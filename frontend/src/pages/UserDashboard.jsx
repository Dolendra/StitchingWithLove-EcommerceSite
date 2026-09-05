import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ordersAPI, measurementsAPI, appointmentsAPI, notificationsAPI } from "../services/api";
import { ORDER_STATUS_LABELS } from "../config/brand";

const UserDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    Promise.all([
      ordersAPI.getMyOrders().catch(() => ({ data: [] })),
      measurementsAPI.list().catch(() => ({ data: [] })),
      appointmentsAPI.my().catch(() => ({ data: [] })),
      notificationsAPI.list().catch(() => ({ data: [] })),
    ]).then(([o, m, a, n]) => {
      setOrders(o.data);
      setProfiles(m.data);
      setAppointments(a.data);
      setNotifications(n.data.slice(0, 5));
    });
  }, []);

  const active = orders.find(
    (o) => o.paymentStatus === "paid" && o.orderStatus !== "delivered" && o.orderStatus !== "cancelled"
  );
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const actions = [
    { to: "/measurements", label: "My Measurements" },
    { to: "/orders", label: "My Orders" },
    { to: "/wishlist", label: "Wishlist" },
    { to: "/book", label: "Appointments" },
    { to: "/products", label: "Shop" },
  ];

  return (
    <div className="page-shell section-pad pt-24 max-w-5xl mx-auto">
      <h1 className="font-display text-4xl md:text-5xl text-[var(--accent)]">
        {greet}, {user?.name?.split(" ")[0] || "there"}
      </h1>

      {active && (
        <div className="mt-8 surface rounded-2xl p-6">
          <p className="text-xs tracking-widest text-[var(--ink-muted)]">YOUR CURRENT ORDER</p>
          <p className="font-display text-3xl mt-2">
            {active.orderNumber || `#${active._id.slice(-8)}`}
          </p>
          <p className="text-[var(--ink-muted)] mt-1">
            {ORDER_STATUS_LABELS[active.orderStatus] || active.orderStatus}
          </p>
          <Link to={`/orders/${active._id}`} className="btn-primary mt-4 inline-flex">
            Track Order
          </Link>
        </div>
      )}

      <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-3">
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="border border-[var(--line)] p-4 text-center text-sm hover:border-[var(--accent)] transition"
          >
            {a.label}
          </Link>
        ))}
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-10">
        <section>
          <h2 className="font-display text-2xl mb-4">Recent orders</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-[var(--ink-muted)]">No orders yet.</p>
          ) : (
            <ul className="space-y-3">
              {orders.slice(0, 4).map((o) => (
                <li key={o._id}>
                  <Link to={`/orders/${o._id}`} className="flex justify-between text-sm border-b border-[var(--line)] py-3">
                    <span>{o.orderNumber || o._id.slice(-8)}</span>
                    <span className="text-[var(--ink-muted)]">
                      {ORDER_STATUS_LABELS[o.orderStatus]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="flex justify-between items-baseline mb-4">
            <h2 className="font-display text-2xl">Saved measurements</h2>
            <Link to="/measurements" className="text-sm underline">
              Manage
            </Link>
          </div>
          {profiles.length === 0 ? (
            <p className="text-sm text-[var(--ink-muted)]">
              No profiles yet.{" "}
              <Link to="/measurements" className="underline text-[var(--accent)]">
                Create one
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {profiles.slice(0, 4).map((p) => (
                <li key={p._id} className="text-sm border-b border-[var(--line)] py-3 flex justify-between">
                  <span>{p.name}</span>
                  <span className="capitalize text-[var(--ink-muted)]">{p.garmentType}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {appointments[0] && (
        <section className="mt-12">
          <h2 className="font-display text-2xl mb-3">Upcoming appointment</h2>
          <p className="text-sm">
            {appointments[0].service} ·{" "}
            {new Date(appointments[0].preferredDate).toLocaleDateString()} ·{" "}
            {appointments[0].preferredSlot} · {appointments[0].status}
          </p>
        </section>
      )}

      {notifications.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl mb-4">Notifications</h2>
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li key={n._id} className="text-sm text-[var(--ink-muted)]">
                <strong className="text-[var(--ink)]">{n.title}</strong> — {n.message}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default UserDashboard;
