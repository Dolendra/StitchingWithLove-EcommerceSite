import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, paymentsAPI } from '../services/api';
import { useLocation } from 'react-router-dom';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const confirmIfNeeded = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');
      const orderId = params.get('orderId');
      if (isAuthenticated && sessionId && orderId) {
        try { await paymentsAPI.confirm({ session_id: sessionId, orderId }); } catch {}
      }
    };

    const fetchOrders = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await ordersAPI.getMyOrders();
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    confirmIfNeeded().finally(fetchOrders);
  }, [isAuthenticated, location.search]);

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p className="text-gray-600">You need to be logged in to view your orders.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (paymentStatus) => {
    const map = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return map[paymentStatus] || 'bg-gray-100 text-gray-800';
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await ordersAPI.cancel(id);
      const refreshed = await ordersAPI.getMyOrders();
      setOrders(refreshed.data);
    } catch (e) {
      console.error('Cancel failed', e);
      alert('Unable to cancel order');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>

      {orders.filter(o => o.paymentStatus === 'paid').length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.filter(o => o.paymentStatus === 'paid').map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden border">
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
                <div>
                  <div className="text-sm text-gray-500">Order ID</div>
                  <div className="text-lg font-semibold">#{order._id.slice(-8)}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.name} × {item.quantity}</span>
                      <span className="font-medium">₹{(item.price || 0) * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t">
                  <div className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total</div>
                    <div className="text-lg font-semibold">₹{order.totalAmount}</div>
                  </div>
                </div>

                {order.tracking && order.tracking.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Tracking</h4>
                    <div className="space-y-1 text-sm">
                      {order.tracking.map((t, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-gray-700">{t.status.replaceAll('_',' ')}</span>
                          <span className="text-gray-500">{new Date(t.at).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.paymentStatus === 'paid' && (
                  <div className="pt-4 mt-4 border-t flex justify-end">
                    <button onClick={() => handleCancel(order._id)} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Cancel Order</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders
 