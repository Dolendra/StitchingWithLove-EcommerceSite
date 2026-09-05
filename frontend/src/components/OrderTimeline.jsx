import React from "react";
import { ORDER_STATUS_LABELS } from "../config/brand";

const MAIN_FLOW = [
  "placed",
  "measurement_confirmed",
  "fabric_selected",
  "cutting",
  "stitching",
  "quality_check",
  "fitting_ready",
  "ready_to_ship",
  "shipped",
  "out_for_delivery",
  "delivered",
];

function buildFlow(orderStatus) {
  if (orderStatus === "alteration_requested") {
    return [
      ...MAIN_FLOW.slice(0, MAIN_FLOW.indexOf("fitting_ready") + 1),
      "alteration_requested",
      "alteration_completed",
      ...MAIN_FLOW.slice(MAIN_FLOW.indexOf("ready_to_ship")),
    ];
  }
  if (orderStatus === "alteration_completed") {
    return [
      ...MAIN_FLOW.slice(0, MAIN_FLOW.indexOf("fitting_ready") + 1),
      "alteration_requested",
      "alteration_completed",
      ...MAIN_FLOW.slice(MAIN_FLOW.indexOf("ready_to_ship")),
    ];
  }
  return MAIN_FLOW;
}

export default function OrderTimeline({ orderStatus, tracking = [], compact = false }) {
  const visibleTracking = (tracking || []).filter((t) => t.visibility !== "internal");

  if (orderStatus === "cancelled") {
    return (
      <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
        Order cancelled
        {visibleTracking?.length > 0 && (
          <p className="text-red-600/80 mt-1">{visibleTracking[visibleTracking.length - 1]?.note}</p>
        )}
      </div>
    );
  }

  const flow = buildFlow(orderStatus);
  const currentIdx = Math.max(0, flow.indexOf(orderStatus === "processing" ? "placed" : orderStatus));
  const byStatus = Object.fromEntries(visibleTracking.map((t) => [t.status, t]));

  return (
    <ol className="space-y-0">
      {flow.map((status, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const event = byStatus[status];
        if (compact && !done && idx > currentIdx + 2) return null;
        return (
          <li key={`${status}-${idx}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`w-3 h-3 rounded-full mt-1.5 ${
                  done ? "bg-[var(--accent)]" : "bg-[var(--champagne)]"
                } ${active ? "ring-4 ring-[rgba(92,42,58,0.15)]" : ""}`}
              />
              {idx < flow.length - 1 && (
                <span
                  className={`w-px flex-1 min-h-8 ${done ? "bg-[var(--accent)]" : "bg-[var(--line)]"}`}
                />
              )}
            </div>
            <div className="pb-6">
              <p
                className={`text-sm ${
                  done ? "text-[var(--ink)] font-medium" : "text-[var(--ink-muted)]"
                }`}
              >
                {ORDER_STATUS_LABELS[status] || status}
              </p>
              {event?.at && (
                <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                  {new Date(event.at).toLocaleString()}
                  {event.note ? ` · ${event.note}` : ""}
                </p>
              )}
              {active && !event?.at && (
                <p className="text-xs text-[var(--rose)] mt-0.5">In progress</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
