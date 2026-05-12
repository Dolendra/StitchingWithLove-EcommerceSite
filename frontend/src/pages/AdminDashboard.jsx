// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { productsAPI, appointmentsAPI, ordersAPI } from "../services/api";

const AdminDashboard = () => {
  const [product, setProduct] = useState({ name: "", price: "", image: "", description: "", stock: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [apRes, ordRes] = await Promise.all([
          appointmentsAPI.list(),
          ordersAPI.getAll(),
        ]);
        setAppointments(apRes.data);
        setOrders(ordRes.data);
      } catch (e) {}
    };
    fetchAdminData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const payload = {
        name: product.name,
        description: product.description,
        price: Number(product.price),
        image: product.image,
        stock: product.stock === "" ? undefined : Number(product.stock),
      };
      await productsAPI.create(payload);
      setMessage("Product created successfully.");
      setProduct({ name: "", price: "", image: "", description: "", stock: "" });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to create product";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4 mb-8">
        {message && (
          <div className="p-3 rounded-md border text-sm">
            {message}
          </div>
        )}
        <input
          type="text"
          placeholder="Product Name"
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
          className="w-full border p-2 rounded-lg"
        />
        <input
          type="number"
          placeholder="Price"
          value={product.price}
          onChange={(e) => setProduct({ ...product, price: e.target.value })}
          className="w-full border p-2 rounded-lg"
        />
        <input
          type="number"
          placeholder="Stock (optional)"
          value={product.stock}
          onChange={(e) => setProduct({ ...product, stock: e.target.value })}
          className="w-full border p-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={product.image}
          onChange={(e) => setProduct({ ...product, image: e.target.value })}
          className="w-full border p-2 rounded-lg"
        />
        <textarea
          placeholder="Description"
          value={product.description}
          onChange={(e) => setProduct({ ...product, description: e.target.value })}
          className="w-full border p-2 rounded-lg"
        />
        <button type="submit" disabled={loading} className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 disabled:opacity-60">
          {loading ? "Saving..." : "Add Product"}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Booked Appointments</h3>
          {appointments.length === 0 ? (
            <p className="text-gray-600">No appointments yet.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map(ap => (
                <div key={ap._id} className="border rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{ap.user?.name || 'Guest'}</div>
                    <div className="text-sm text-gray-600">{ap.phone}</div>
                    <div className="text-sm text-gray-700 mt-1">{ap.message}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${ap.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{ap.status}</span>
                    <button onClick={async ()=>{ await appointmentsAPI.updateStatus(ap._id, ap.status === 'confirmed' ? 'pending' : 'confirmed'); const r = await appointmentsAPI.list(); setAppointments(r.data); }} className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">Toggle</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Orders Tracking</h3>
          {orders.length === 0 ? (
            <p className="text-gray-600">No orders.</p>
          ) : (
            <div className="space-y-3">
              {orders.map(o => (
                <div key={o._id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Order #{o._id.slice(-8)}</div>
                      <div className="text-sm text-gray-600">{o.user?.name} • ₹{o.totalAmount}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100">{o.orderStatus}</span>
                  </div>
                  <div className="mt-3 flex items-center space-x-2 text-sm">
                    {['processing','shipped','out_for_delivery','delivered'].map(s => (
                      <button key={s} onClick={async ()=>{ await ordersAPI.updateStatus(o._id, s); const r = await ordersAPI.getAll(); setOrders(r.data); }} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">{s.replaceAll('_',' ')}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
