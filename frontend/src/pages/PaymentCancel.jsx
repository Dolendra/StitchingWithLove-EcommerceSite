import React from "react";
import { Link } from "react-router-dom";

const PaymentCancel = () => {
  return (
    <div className="p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Payment Cancelled</h2>
        <p className="text-gray-600 mb-6">Your payment was cancelled. You can try again from your cart.</p>
        <div className="space-x-3">
          <Link className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700" to="/cart">Go to Cart</Link>
          <Link className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200" to="/orders">View Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;


