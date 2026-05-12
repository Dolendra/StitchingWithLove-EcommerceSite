import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { paymentsAPI } from "../services/api";
import { useCart } from "../context/CartContext";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const [message, setMessage] = useState("Confirming your payment...");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session_id");
    const orderId = params.get("orderId");

    const confirm = async () => {
      try {
        if (!sessionId || !orderId) throw new Error("Missing payment details");
        const res = await paymentsAPI.confirm({ session_id: sessionId, orderId });
        if (res.data?.status === "paid") {
          clearCart();
          setMessage("Payment successful! Redirecting to your orders...");
          setTimeout(() => navigate("/orders"), 1000);
        } else {
          setMessage("Payment not completed. You can retry from your cart.");
        }
      } catch (e) {
        setMessage("Verification failed. Please contact support if you were charged.");
      }
    };

    confirm();
  }, [location.search, navigate, clearCart]);

  return (
    <div className="p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-6 text-center">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;


