// src/pages/Checkout.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { paymentsAPI } from "../services/api";

const Checkout = () => {
  const { items, getTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Stripe Checkout redirects, no script load needed

  const handlePayment = async () => {
    if (!isAuthenticated) {
      alert("Please login to continue");
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // Validate shipping address
    const requiredFields = ['name', 'address', 'city', 'state', 'pincode', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      // Create Stripe session
      const paymentData = {
        items: items.map(item => ({
          productId: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: getTotal(),
        shippingAddress,
      };
      const response = await paymentsAPI.createSession(paymentData);
      const { url } = response.data;
      window.location.href = url;
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-4">Add some products to your cart before checkout.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shipping Address Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={shippingAddress.name}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
              required
            />
            <textarea
              name="address"
              placeholder="Address"
              value={shippingAddress.address}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
              rows="3"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={shippingAddress.city}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={shippingAddress.state}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={shippingAddress.pincode}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={shippingAddress.phone}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id || item.id} className="flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <hr className="my-4" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>₹{getTotal()}</span>
            </div>
          </div>
          
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : `Pay ₹${getTotal()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
