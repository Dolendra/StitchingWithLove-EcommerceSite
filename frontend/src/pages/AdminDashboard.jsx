import React, { useEffect, useMemo, useState } from "react";
import { productsAPI, appointmentsAPI, ordersAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import { ORDER_STATUS_LABELS, PRODUCTION_STATUSES, CATEGORIES, KANBAN_COLUMNS } from "../config/brand";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [product, setProduct] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    stock: "",
    category: "blouse",
  });
  const [products, setProducts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [apRes, ordRes, prodRes] = await Promise.all([
        appointmentsAPI.list(),
        ordersAPI.getAll(),
        productsAPI.getAll(),
      ]);
      setAppointments(apRes.data);
      setOrders(ordRes.data);
      setProducts(prodRes.data);
    } catch {
      toast("Failed to load admin data", "error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.paymentStatus === "paid");
    const active = paid.filter((o) => !["delivered", "cancelled"].includes(o.orderStatus));
    const stitching = paid.filter((o) =>
      ["cutting", "stitching", "quality_check"].includes(o.orderStatus)
    );
    const revenue = paid.reduce((s, o) => s + (o.totalAmount || 0), 0);
    return {
      ordersToday: paid.length,
      pendingStitching: stitching.length,
      appointments: appointments.filter((a) => a.status === "pending").length,
      revenue,
      active,
    };
  }, [orders, appointments]);

  const createProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await productsAPI.create({
        ...product,
        price: Number(product.price),
        stock: product.stock === "" ? 0 : Number(product.stock),
      });
      toast("Product created", "success");
      setProduct({ name: "", price: "", image: "", description: "", stock: "", category: "blouse" });
      load();
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to create product", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id, status) => {
    try {
      await ordersAPI.updateStatus(
        id,
        status,
        undefined,
        {
          customerNote: `Your order is now: ${ORDER_STATUS_LABELS[status] || status}`,
        }
      );
      toast("Order updated — customer notified", "success");
      load();
    } catch (e) {
      toast(e.response?.data?.message || "Update failed", "error");
    }
  };

  const tabs = ["overview", "production", "orders", "alterations", "products", "appointments"];

  return (
    <div className="page-shell section-pad pt-24 max-w-6xl mx-auto">
      <h1 className="font-display text-4xl text-[var(--accent)] mb-6">Admin</h1>
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize border ${
              tab === t ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--line)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ["Paid orders", stats.ordersToday],
            ["In production", stats.pendingStitching],
            ["Pending appointments", stats.appointments],
            ["Revenue", `₹${stats.revenue.toLocaleString("en-IN")}`],
          ].map(([label, value]) => (
            <div key={label} className="surface rounded-2xl p-5">
              <p className="text-xs tracking-widest text-[var(--ink-muted)] uppercase">{label}</p>
              <p className="font-display text-3xl mt-2 text-[var(--accent)]">{value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "production" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {KANBAN_COLUMNS.map((col) => {
              const cards = orders.filter(
                (o) =>
                  o.paymentStatus === "paid" &&
                  o.orderStatus === col.id &&
                  o.orderStatus !== "cancelled"
              );
              return (
                <div key={col.id} className="w-56 shrink-0 bg-[var(--bg-soft)] rounded-xl p-3">
                  <p className="text-xs tracking-widest uppercase text-[var(--ink-muted)] mb-3">
                    {col.label} · {cards.length}
                  </p>
                  <div className="space-y-2">
                    {cards.map((o) => (
                      <div key={o._id} className="bg-white border border-[var(--line)] rounded-lg p-3 text-sm">
                        <p className="font-medium">{o.orderNumber || o._id.slice(-6)}</p>
                        <p className="text-[var(--ink-muted)] text-xs mt-1">
                          {o.user?.name} · ₹{o.totalAmount}
                        </p>
                        <p className="text-xs mt-1 truncate">
                          {o.items?.[0]?.name || "Custom order"}
                        </p>
                        {o.estimatedCompletion && (
                          <p className="text-xs text-[var(--rose)] mt-1">
                            Due {new Date(o.estimatedCompletion).toLocaleDateString()}
                          </p>
                        )}
                        <select
                          className="mt-2 w-full text-xs border border-[var(--line)] rounded px-1 py-1"
                          value={o.orderStatus}
                          onChange={(e) => updateOrder(o._id, e.target.value)}
                        >
                          {PRODUCTION_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {ORDER_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                    {cards.length === 0 && (
                      <p className="text-xs text-[var(--ink-muted)] py-4 text-center">Empty</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-[var(--ink-muted)]">No paid orders yet.</p>
          ) : (
            orders.map((o) => {
              const cancelled = o.orderStatus === "cancelled";
              return (
                <div key={o._id} className="surface rounded-2xl p-5">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="font-display text-xl">
                        {o.orderNumber || `#${o._id.slice(-8)}`}
                      </p>
                      <p className="text-sm text-[var(--ink-muted)]">
                        {o.user?.name} · ₹{o.totalAmount} · {o.paymentStatus}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full h-fit ${
                        cancelled ? "bg-red-50 text-red-700" : "bg-[var(--bg-soft)] text-[var(--accent)]"
                      }`}
                    >
                      {ORDER_STATUS_LABELS[o.orderStatus] || o.orderStatus}
                    </span>
                  </div>
                  {cancelled ? (
                    <p className="text-sm text-red-700 mt-3">Cancelled — no further actions</p>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {PRODUCTION_STATUSES.filter((s) => s !== "cancelled").map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateOrder(o._id, s)}
                          className={`px-2 py-1 text-xs border rounded ${
                            o.orderStatus === s
                              ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                              : "border-[var(--line)] hover:border-[var(--accent)]"
                          }`}
                        >
                          {ORDER_STATUS_LABELS[s] || s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "alterations" && (
        <div className="space-y-4">
          {orders.filter((o) => o.orderStatus === "alteration_requested" || o.alterationRequests?.some((a) => a.status === "open")).length === 0 ? (
            <p className="text-[var(--ink-muted)]">No open alterations.</p>
          ) : (
            orders
              .filter(
                (o) =>
                  o.orderStatus === "alteration_requested" ||
                  o.alterationRequests?.some((a) => a.status === "open")
              )
              .map((o) => (
                <div key={o._id} className="surface rounded-2xl p-5">
                  <p className="font-display text-xl">{o.orderNumber || o._id.slice(-8)}</p>
                  <p className="text-sm text-[var(--ink-muted)]">{o.user?.name}</p>
                  {(o.alterationRequests || []).slice(-1).map((a, i) => (
                    <div key={i} className="mt-3 text-sm">
                      <p>{(a.issues || []).join(", ")}</p>
                      <p className="text-[var(--ink-muted)]">{a.notes}</p>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      className="btn-secondary text-sm py-2"
                      onClick={() => updateOrder(o._id, "alteration_completed")}
                    >
                      Mark alteration completed
                    </button>
                    <button
                      type="button"
                      className="btn-primary text-sm py-2"
                      onClick={() => updateOrder(o._id, "ready_to_ship")}
                    >
                      Ready for dispatch
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {tab === "products" && (
        <div className="grid lg:grid-cols-2 gap-8">
          <form onSubmit={createProduct} className="space-y-3">
            <h2 className="font-display text-2xl mb-2">Add product</h2>
            <input className="input-field" placeholder="Name" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} required />
            <input className="input-field" type="number" placeholder="Price" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} required />
            <select className="input-field" value={product.category} onChange={(e) => setProduct({ ...product, category: e.target.value })}>
              {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <input className="input-field" placeholder="Stock" value={product.stock} onChange={(e) => setProduct({ ...product, stock: e.target.value })} />
            <input className="input-field" placeholder="Image URL" value={product.image} onChange={(e) => setProduct({ ...product, image: e.target.value })} />
            <textarea className="input-field" placeholder="Description" value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving…" : "Add product"}
            </button>
          </form>
          <div className="space-y-3">
            <h2 className="font-display text-2xl mb-2">Catalog ({products.length})</h2>
            {products.map((p) => (
              <div key={p._id} className="flex justify-between border-b border-[var(--line)] py-3 text-sm">
                <span>{p.name}</span>
                <span>₹{p.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "appointments" && (
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <p className="text-[var(--ink-muted)]">No appointments.</p>
          ) : (
            appointments.map((ap) => (
              <div key={ap._id} className="surface rounded-2xl p-4 flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-medium">{ap.name || ap.user?.name}</p>
                  <p className="text-sm text-[var(--ink-muted)]">
                    {ap.service} · {ap.preferredDate ? new Date(ap.preferredDate).toLocaleDateString() : "—"} ·{" "}
                    {ap.preferredSlot} · {ap.phone}
                  </p>
                  <p className="text-sm mt-1">{ap.message || ap.purpose}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-[var(--bg-soft)]">{ap.status}</span>
                  {ap.status !== "cancelled" && (
                    <button
                      type="button"
                      className="text-sm underline"
                      onClick={async () => {
                        const next =
                          ap.status === "confirmed"
                            ? "completed"
                            : ap.status === "pending"
                            ? "confirmed"
                            : "pending";
                        await appointmentsAPI.updateStatus(ap._id, next);
                        load();
                      }}
                    >
                      Advance
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
