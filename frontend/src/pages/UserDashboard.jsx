// src/pages/UserDashboard.jsx
import React from "react";

const UserDashboard = ({ orders }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Dashboard</h2>
      <h3 className="text-lg font-semibold mb-3">My Orders</h3>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order, idx) => (
            <li key={idx} className="bg-white p-4 shadow rounded-xl">
              Order #{idx + 1} – {order.items.length} items – Total ₹{order.total}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserDashboard;
