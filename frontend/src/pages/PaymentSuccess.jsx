import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { paymentsAPI } from "../services/api";
import { useCart } from "../context/CartContext";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const [message, setMessage] = useState("Confirming your payment…");
  const [ok, setOk] = useState(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session_id");
    const orderId = params.get("orderId");

    const confirm = async () => {
      try {
        if (!sessionId || !orderId) throw new Error("Missing payment details");
        const res = await paymentsAPI.confirm({ session_id: sessionId, orderId });
        if (res.data?.status === "paid") {
          await clearCart();
          setOk(true);
          setMessage(
            res.data.alreadyConfirmed
              ? "Payment already confirmed. Redirecting to your orders…"
              : "Payment successful. Redirecting to your orders…"
          );
          setTimeout(() => navigate("/orders"), 1200);
        } else {
          setOk(false);
          setMessage("Payment not completed. Your bag is still available — you can retry.");
        }
      } catch {
        setOk(false);
        setMessage("Verification failed. If you were charged, contact support with your order ID.");
      }
    };

    confirm();
  }, [location.search, navigate, clearCart]);

  return (
    <div className="page-shell section-pad pt-24 max-w-xl mx-auto text-center">
      <h1 className="font-display text-4xl text-[var(--accent)]">
        {ok === false ? "Payment issue" : "Thank you"}
      </h1>
      <p className="mt-4 text-[var(--ink-muted)]">{message}</p>
      {ok === null && <div className="skeleton h-10 w-10 rounded-full mx-auto mt-8" />}
      {ok === false && (
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/cart" className="btn-primary">
            Return to bag
          </Link>
          <Link to="/contact" className="btn-secondary">
            Contact support
          </Link>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
