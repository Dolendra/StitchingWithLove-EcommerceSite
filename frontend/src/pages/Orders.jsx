import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import { ORDER_STATUS_LABELS } from "../config/brand";
import OrderTimeline from "../components/OrderTimeline";

const CANCELABLE = ["placed", "measurement_confirmed", "fabric_selected"];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    try {
      const res = await ordersAPI.getMyOrders();
      setOrders(res.data);
    } catch {
      toast("Could not load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    try {
      await ordersAPI.cancel(id);
      toast("Order cancelled", "success");
      setConfirmId(null);
      load();
    } catch (e) {
      toast(e.response?.data?.message || "Unable to cancel", "error");
    }
  };

  if (loading) {
    return (
      <div className="page-shell section-pad max-w-3xl mx-auto space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="skeleton h-40" />
        ))}
      </div>
    );
  }

  return (
    <div className="page-shell section-pad pt-24 max-w-3xl mx-auto">
      <h1 className="font-display text-4xl text-[var(--accent)] mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-display text-2xl text-[var(--accent)]">No orders yet</p>
          <p className="text-[var(--ink-muted)] mt-2">Your next favorite outfit starts here.</p>
          <Link to="/products" className="btn-primary mt-6 inline-flex">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <article key={order._id} className="surface rounded-2xl p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {order.orderNumber || `#${order._id.slice(-8)}`}
                  </p>
                  <Link
                    to={`/orders/${order._id}`}
                    className="font-display text-2xl text-[var(--accent)] hover:underline"
                  >
                    {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
                  </Link>
                  <p className="text-sm text-[var(--ink-muted)] mt-1">
                    {new Date(order.createdAt).toLocaleString()} · ₹
                    {order.totalAmount?.toLocaleString("en-IN")}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    order.orderStatus === "cancelled"
                      ? "bg-red-50 text-red-700"
                      : "bg-[var(--bg-soft)] text-[var(--accent)]"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <div className="max-h-48 overflow-hidden">
                <OrderTimeline orderStatus={order.orderStatus} tracking={order.tracking} />
              </div>
              <div className="flex gap-3 mt-4">
                <Link to={`/orders/${order._id}`} className="btn-secondary text-sm py-2 px-4">
                  View details
                </Link>
                {order.paymentStatus === "paid" && CANCELABLE.includes(order.orderStatus) && (
                  <button
                    type="button"
                    className="text-sm text-red-700 underline"
                    onClick={() => setConfirmId(order._id)}
                  >
                    Cancel order
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[var(--bg)] rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-display text-2xl text-[var(--accent)]">Cancel order?</h3>
            <p className="text-sm text-[var(--ink-muted)] mt-2">
              This cannot be undone. Production has not started yet.
            </p>
            <div className="flex gap-3 mt-6">
              <button type="button" className="btn-secondary flex-1" onClick={() => setConfirmId(null)}>
                Keep order
              </button>
              <button
                type="button"
                className="btn-primary flex-1 bg-red-700"
                onClick={() => cancel(confirmId)}
              >
                Cancel order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
