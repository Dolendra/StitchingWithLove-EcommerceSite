import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { paymentsAPI } from "../services/api";

const labelize = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

const Checkout = () => {
  const { items, getTotal, shippingEstimate } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    landmark: "",
  });

  const customItems = useMemo(
    () => items.filter((i) => i.size === "Custom" || i.measurementSnapshot),
    [items]
  );

  const onChange = (e) => {
    setShippingAddress((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const validateAddress = () => {
    const required = ["name", "phone", "addressLine1", "city", "state", "postalCode"];
    const missing = required.filter((f) => !shippingAddress[f]?.trim());
    if (missing.length) {
      toast(`Please fill: ${missing.join(", ")}`, "error");
      return false;
    }
    return true;
  };

  const pay = async () => {
    if (!isAuthenticated) {
      toast("Please sign in to continue", "info");
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await paymentsAPI.createSession({
        items: items.map((item) => ({
          productId: item._id || item.id,
          quantity: item.quantity,
          customization: item.customization,
          measurementProfile: item.measurementProfile,
          measurementSnapshot: item.measurementSnapshot,
          customerNotes: item.customerNotes,
          stitchingPrice: item.stitchingPrice || 0,
        })),
        shippingAddress,
      });
      // Keep cart until payment succeeds — cancel/fail must allow retry
      window.location.href = res.data.url;
    } catch (e) {
      toast(e.response?.data?.message || "Payment could not be started", "error");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-shell section-pad text-center">
        <h1 className="font-display text-4xl text-[var(--accent)]">Your bag is empty</h1>
        <Link to="/products" className="btn-primary mt-6 inline-flex">
          Explore Collection
        </Link>
      </div>
    );
  }

  const subtotal = getTotal();
  const shipping = shippingEstimate();
  const steps = customItems.length
    ? ["Address", "Measurements", "Review", "Payment"]
    : ["Address", "Review", "Payment"];

  const goNextFromAddress = () => {
    if (!validateAddress()) return;
    setStep(customItems.length ? 2 : 3);
  };

  return (
    <div className="page-shell section-pad pt-24 max-w-4xl mx-auto">
      <h1 className="font-display text-4xl text-[var(--accent)] mb-6">Checkout</h1>
      <div className="flex flex-wrap gap-3 text-sm mb-10 text-[var(--ink-muted)]">
        {steps.map((label, i) => {
          const n = i + 1;
          const activeStep =
            !customItems.length && n >= 2 ? n + 1 : n;
          const current =
            step === n ||
            (!customItems.length && ((step === 3 && n === 2) || (step === 4 && n === 3)));
          return (
            <span key={label} className={current ? "text-[var(--accent)] font-medium" : ""}>
              0{n} {label}
              {i < steps.length - 1 && <span className="mx-2 opacity-40">→</span>}
            </span>
          );
        })}
      </div>

      {step === 1 && (
        <div className="space-y-4 max-w-xl">
          {["name", "phone", "addressLine1", "addressLine2", "city", "state", "postalCode", "landmark"].map(
            (field) => (
              <input
                key={field}
                name={field}
                className="input-field"
                placeholder={field.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
                value={shippingAddress[field]}
                onChange={onChange}
              />
            )
          )}
          <button type="button" className="btn-primary" onClick={goNextFromAddress}>
            Continue
          </button>
        </div>
      )}

      {step === 2 && customItems.length > 0 && (
        <div className="max-w-xl space-y-6">
          <h2 className="font-display text-2xl">Confirm measurements</h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Please verify fit details before payment.
          </p>
          {customItems.map((item, idx) => (
            <div key={idx} className="surface rounded-2xl p-5">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-[var(--ink-muted)] mt-1">
                Profile: {item.measurementSnapshot?.profileName || "Custom"}
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                {Object.entries(item.measurementSnapshot?.values || {}).map(([k, v]) => (
                  <li key={k} className="flex justify-between border-b border-[var(--line)] py-1.5">
                    <span>{labelize(k)}</span>
                    <span>{v}"</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex gap-3">
            <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <Link to="/measurements" className="btn-secondary">
              Edit measurements
            </Link>
            <button type="button" className="btn-primary" onClick={() => setStep(3)}>
              Measurements look good
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between text-sm border-b border-[var(--line)] py-3"
              >
                <span>
                  {item.name} × {item.quantity}
                  {item.size ? ` · ${item.size}` : ""}
                </span>
                <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
            <p className="text-sm text-[var(--ink-muted)] pt-2">
              Ship to {shippingAddress.name}, {shippingAddress.city}
            </p>
            <button
              type="button"
              className="text-sm underline"
              onClick={() => setStep(customItems.length ? 2 : 1)}
            >
              Back
            </button>
          </div>
          <div className="surface p-6 rounded-2xl h-fit">
            <div className="flex justify-between text-sm mb-2">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between font-medium text-lg pt-3 border-t border-[var(--line)]">
              <span>Estimated total</span>
              <span>₹{(subtotal + shipping).toLocaleString("en-IN")}</span>
            </div>
            <p className="text-xs text-[var(--ink-muted)] mt-2">
              Final total is confirmed by the server at payment.
            </p>
            <button type="button" className="btn-primary w-full mt-6" onClick={() => setStep(4)}>
              Continue to payment
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="max-w-md space-y-4">
          <p className="text-[var(--ink-muted)]">
            You will be redirected to secure Stripe checkout. Custom garments follow our measurement
            and alteration policy.
          </p>
          <button type="button" className="btn-primary w-full" disabled={loading} onClick={pay}>
            {loading ? "Redirecting…" : "Pay securely"}
          </button>
          <button type="button" className="btn-secondary w-full" onClick={() => setStep(3)}>
            Back
          </button>
          <Link to="/cart" className="block text-center text-sm underline text-[var(--ink-muted)]">
            Return to bag if payment fails
          </Link>
        </div>
      )}
    </div>
  );
};

export default Checkout;
