import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotal, shippingEstimate } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const metaOf = (item) => ({
    size: item.size,
    measurementProfile: item.measurementProfile,
  });

  const onQty = async (item, qty) => {
    try {
      await updateQuantity(item._id || item.id, qty, metaOf(item));
    } catch {
      toast("Could not update quantity", "error");
    }
  };

  const onRemove = async (item) => {
    try {
      await removeFromCart(item._id || item.id, metaOf(item));
      toast("Removed from bag", "success");
    } catch {
      toast("Could not remove item", "error");
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-shell section-pad text-center">
        <h1 className="font-display text-4xl text-[var(--accent)]">Your bag is empty</h1>
        <p className="text-[var(--ink-muted)] mt-3">Your next favorite outfit starts here.</p>
        <Link to="/products" className="btn-primary mt-8 inline-flex">
          Explore Collection
        </Link>
      </div>
    );
  }

  const shipping = shippingEstimate();
  const total = getTotal() + shipping;

  return (
    <div className="page-shell section-pad pt-24 max-w-6xl mx-auto">
      <h1 className="font-display text-4xl text-[var(--accent)] mb-10">Your Bag</h1>
      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-6">
          {items.map((item, idx) => {
            const id = item._id || item.id;
            return (
              <div key={`${id}-${item.size}-${item.measurementProfile}-${idx}`} className="flex gap-4 border-b border-[var(--line)] pb-6">
                <img
                  src={item.image || item.images?.[0] || "/images/ethnicwear.webp"}
                  alt=""
                  className="w-24 h-32 object-cover bg-[var(--bg-soft)]"
                />
                <div className="flex-1">
                  <h3 className="font-display text-xl">{item.name}</h3>
                  {item.size && <p className="text-sm text-[var(--ink-muted)]">Size: {item.size}</p>}
                  {item.customization?.embroidery && item.customization.embroidery !== "None" && (
                    <p className="text-sm text-[var(--ink-muted)]">
                      Embroidery: {item.customization.embroidery}
                    </p>
                  )}
                  {item.measurementSnapshot?.profileName && (
                    <p className="text-sm text-[var(--ink-muted)]">
                      Measurements: {item.measurementSnapshot.profileName}
                    </p>
                  )}
                  {item.customerNotes && (
                    <p className="text-sm text-[var(--ink-muted)]">Note: {item.customerNotes}</p>
                  )}
                  <p className="mt-2 text-[var(--accent)]">₹{item.price?.toLocaleString("en-IN")}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      className="w-8 h-8 border border-[var(--line)]"
                      onClick={() => onQty(item, Math.max(1, item.quantity - 1))}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      className="w-8 h-8 border border-[var(--line)]"
                      onClick={() => onQty(item, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="ml-auto text-sm text-[var(--ink-muted)] underline"
                      onClick={() => onRemove(item)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="surface rounded-2xl p-6 h-fit">
          <h2 className="font-display text-2xl mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{getTotal().toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between font-medium text-base pt-3 border-t border-[var(--line)]">
              <span>Total</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <button type="button" className="btn-primary w-full mt-6" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>
          <Link to="/products" className="block text-center text-sm mt-4 underline text-[var(--ink-muted)]">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
