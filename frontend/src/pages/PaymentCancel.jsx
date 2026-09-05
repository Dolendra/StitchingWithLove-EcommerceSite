import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { paymentsAPI } from "../services/api";

const PaymentCancel = () => {
  const [params] = useSearchParams();

  useEffect(() => {
    const orderId = params.get("orderId");
    if (!orderId) return;
    paymentsAPI.cancelPending(orderId).catch(() => {});
  }, [params]);

  return (
    <div className="page-shell section-pad pt-24 max-w-xl mx-auto text-center">
      <h1 className="font-display text-4xl text-[var(--accent)]">Payment cancelled</h1>
      <p className="mt-4 text-[var(--ink-muted)]">
        No charge was made. Your bag is still ready — you can retry checkout anytime.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link className="btn-primary" to="/cart">
          Return to bag
        </Link>
        <Link className="btn-secondary" to="/products">
          Continue shopping
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancel;
