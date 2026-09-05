import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ordersAPI, reviewsAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { ORDER_STATUS_LABELS, ALTERATION_ISSUES, BRAND } from "../config/brand";
import OrderTimeline from "../components/OrderTimeline";

const CANCELABLE = ["placed", "measurement_confirmed", "fabric_selected"];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [order, setOrder] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [alterOpen, setAlterOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [issues, setIssues] = useState([]);
  const [alterNotes, setAlterNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    fitRating: 5,
    qualityRating: 5,
    deliveryRating: 5,
    text: "",
    productId: "",
  });

  const load = async () => {
    try {
      const res = await ordersAPI.getById(id);
      setOrder(res.data);
      const first = res.data.items?.[0];
      if (first?.product || first?.productId) {
        setReviewForm((f) => ({
          ...f,
          productId: first.product || first.productId,
        }));
      }
    } catch {
      toast("Order not found", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const cancel = async () => {
    try {
      await ordersAPI.cancel(id);
      toast("Order cancelled", "success");
      setConfirm(false);
      load();
    } catch (e) {
      toast(e.response?.data?.message || "Unable to cancel", "error");
    }
  };

  const fitting = async (decision) => {
    try {
      if (decision === "request_alteration") {
        setAlterOpen(true);
        return;
      }
      await ordersAPI.fittingDecision(id, decision);
      toast("Preference saved", "success");
      load();
    } catch (e) {
      toast(e.response?.data?.message || "Could not update", "error");
    }
  };

  const submitAlteration = async () => {
    try {
      await ordersAPI.requestAlteration(id, { issues, notes: alterNotes });
      toast("Alteration request submitted", "success");
      setAlterOpen(false);
      setIssues([]);
      setAlterNotes("");
      load();
    } catch (e) {
      toast(e.response?.data?.message || "Could not submit", "error");
    }
  };

  const reorder = async () => {
    try {
      for (const item of order.items) {
        await addToCart({
          _id: item.product || item.productId,
          id: item.product || item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          size:
            item.customization?.size ||
            item.variant?.size ||
            (item.measurementSnapshot ? "Custom" : undefined),
          customization: item.customization,
          measurementProfile: item.measurementProfile,
          measurementSnapshot: item.measurementSnapshot,
          customerNotes: item.customerNotes,
          stitchingPrice: item.stitchingPrice || 0,
        });
      }
      toast("Previous design added to bag — adjust before checkout", "success");
      navigate("/cart");
    } catch {
      toast("Could not reorder — product may be unavailable", "error");
    }
  };

  const submitReview = async () => {
    try {
      await reviewsAPI.create({
        ...reviewForm,
        orderId: order._id,
        productId: reviewForm.productId || order.items[0]?.product || order.items[0]?.productId,
      });
      toast("Thank you for your review", "success");
      setReviewOpen(false);
    } catch (e) {
      toast(e.response?.data?.message || "Could not submit review", "error");
    }
  };

  if (loading) {
    return (
      <div className="page-shell section-pad max-w-3xl mx-auto">
        <div className="skeleton h-64" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-shell section-pad text-center">
        <p className="font-display text-3xl">Order not found</p>
        <Link to="/orders" className="btn-primary mt-6 inline-flex">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell section-pad pt-24 max-w-3xl mx-auto">
      <Link to="/orders" className="text-sm text-[var(--ink-muted)] underline">
        Back to orders
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4 mt-4">
        <div>
          <h1 className="font-display text-4xl text-[var(--accent)]">
            {order.orderNumber || `Order #${order._id.slice(-8)}`}
          </h1>
          <p className="text-[var(--ink-muted)] mt-1">
            Placed {new Date(order.createdAt).toLocaleString()} ·{" "}
            {ORDER_STATUS_LABELS[order.orderStatus]}
          </p>
          {order.estimatedCompletion && order.orderStatus !== "cancelled" && (
            <p className="mt-2 text-sm">
              Estimated completion:{" "}
              <strong>{new Date(order.estimatedCompletion).toLocaleDateString()}</strong>
            </p>
          )}
        </div>
        {order.paymentStatus === "paid" && order.orderStatus !== "cancelled" && (
          <button type="button" className="btn-secondary text-sm py-2" onClick={reorder}>
            Order this design again
          </button>
        )}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl mb-4">Order timeline</h2>
        <OrderTimeline orderStatus={order.orderStatus} tracking={order.tracking} />
      </section>

      {order.orderStatus === "fitting_ready" && (
        <section className="mt-8 surface rounded-2xl p-5">
          <h2 className="font-display text-2xl text-[var(--accent)]">Your outfit is ready for fitting</h2>
          <p className="text-sm text-[var(--ink-muted)] mt-2">How would you like to proceed?</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <button type="button" className="btn-primary" onClick={() => fitting("studio_fitting")}>
              Book studio fitting
            </button>
            <button type="button" className="btn-secondary" onClick={() => fitting("request_delivery")}>
              Request delivery
            </button>
            <button type="button" className="btn-secondary" onClick={() => fitting("request_alteration")}>
              Request alteration
            </button>
          </div>
        </section>
      )}

      {(order.orderStatus === "delivered" || order.orderStatus === "alteration_requested") && (
        <section className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="btn-secondary" onClick={() => setAlterOpen(true)}>
            Request alteration
          </button>
          {order.orderStatus === "delivered" && (
            <button type="button" className="btn-primary" onClick={() => setReviewOpen(true)}>
              Leave a review
            </button>
          )}
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-2xl mb-4">Your outfit</h2>
        <div className="space-y-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-4 border-b border-[var(--line)] py-4">
              <div className="flex-1 text-sm">
                <p className="font-display text-xl">{item.name}</p>
                <p className="text-[var(--ink-muted)]">Qty {item.quantity}</p>
                {item.customization && (
                  <p className="text-[var(--ink-muted)] mt-1">
                    {[item.customization.size, item.customization.embroidery, item.customization.lining]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                {item.measurementSnapshot?.profileName && (
                  <p className="text-[var(--ink-muted)]">
                    Measurements: {item.measurementSnapshot.profileName}
                  </p>
                )}
                {item.customerNotes && (
                  <p className="text-[var(--ink-muted)]">Note: {item.customerNotes}</p>
                )}
              </div>
              <p className="text-sm">
                ₹{((item.finalPrice ?? item.price * item.quantity) || 0).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 font-medium">
          <span>Payment</span>
          <span>
            {order.paymentStatus === "paid" ? "Paid" : order.paymentStatus} ₹
            {order.totalAmount?.toLocaleString("en-IN")}
          </span>
        </div>
      </section>

      {order.shippingAddress && (
        <section className="mt-10">
          <h2 className="font-display text-2xl mb-3">Delivery</h2>
          <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
            {order.shippingAddress.name}
            <br />
            {order.shippingAddress.addressLine1}
            {order.shippingAddress.addressLine2 && (
              <>
                <br />
                {order.shippingAddress.addressLine2}
              </>
            )}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.phone}
          </p>
        </section>
      )}

      {order.alterationRequests?.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl mb-3">Alteration history</h2>
          {order.alterationRequests.map((a, i) => (
            <div key={i} className="text-sm border-b border-[var(--line)] py-3">
              <p className="font-medium">{(a.issues || []).join(", ") || "Alteration"}</p>
              <p className="text-[var(--ink-muted)]">{a.notes}</p>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                {a.status} · {new Date(a.at).toLocaleString()}
              </p>
            </div>
          ))}
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-2xl mb-2">Need help?</h2>
        <a
          href={`https://wa.me/${BRAND.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline text-[var(--accent)]"
        >
          Contact {BRAND.name}
        </a>
      </section>

      {order.paymentStatus === "paid" && CANCELABLE.includes(order.orderStatus) && (
        <button
          type="button"
          className="mt-10 text-red-700 underline text-sm"
          onClick={() => setConfirm(true)}
        >
          Cancel this order
        </button>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[var(--bg)] rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-display text-2xl">Cancel order?</h3>
            <div className="flex gap-3 mt-6">
              <button type="button" className="btn-secondary flex-1" onClick={() => setConfirm(false)}>
                Keep
              </button>
              <button type="button" className="btn-primary flex-1 bg-red-700" onClick={cancel}>
                Cancel order
              </button>
            </div>
          </div>
        </div>
      )}

      {alterOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[var(--bg)] rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-display text-2xl text-[var(--accent)]">Request alteration</h3>
            <div className="flex flex-wrap gap-2 mt-4">
              {ALTERATION_ISSUES.map((issue) => {
                const on = issues.includes(issue);
                return (
                  <button
                    key={issue}
                    type="button"
                    onClick={() =>
                      setIssues((prev) => (on ? prev.filter((x) => x !== issue) : [...prev, issue]))
                    }
                    className={`px-3 py-1.5 text-sm border ${
                      on ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--line)]"
                    }`}
                  >
                    {issue}
                  </button>
                );
              })}
            </div>
            <textarea
              className="input-field mt-4"
              rows={3}
              placeholder="Additional notes"
              value={alterNotes}
              onChange={(e) => setAlterNotes(e.target.value)}
            />
            <div className="flex gap-3 mt-6">
              <button type="button" className="btn-secondary flex-1" onClick={() => setAlterOpen(false)}>
                Close
              </button>
              <button type="button" className="btn-primary flex-1" onClick={submitAlteration}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[var(--bg)] rounded-2xl p-6 max-w-md w-full space-y-3">
            <h3 className="font-display text-2xl text-[var(--accent)]">How was your experience?</h3>
            {[
              ["rating", "Overall"],
              ["fitRating", "Fit"],
              ["qualityRating", "Quality"],
              ["deliveryRating", "Delivery"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between text-sm">
                <span>{label}</span>
                <select
                  className="input-field w-24"
                  value={reviewForm[key]}
                  onChange={(e) => setReviewForm({ ...reviewForm, [key]: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} ★
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <textarea
              className="input-field"
              rows={3}
              placeholder="Share details about the fit and finish"
              value={reviewForm.text}
              onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
            />
            <div className="flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setReviewOpen(false)}>
                Close
              </button>
              <button type="button" className="btn-primary flex-1" onClick={submitReview}>
                Submit review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
