import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { productsAPI, measurementsAPI, reviewsAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ProductCard from "../components/ProductCard";

const labelize = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [fitMode, setFitMode] = useState("standard"); // standard | custom
  const [size, setSize] = useState("");
  const [measurementId, setMeasurementId] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [customization, setCustomization] = useState({
    embroidery: "None",
    lining: "No",
    notes: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getById(id);
        setProduct(res.data);
        const all = await productsAPI.getAll({ category: res.data.category });
        setRelated(all.data.filter((p) => p._id !== id).slice(0, 4));
        reviewsAPI.forProduct(id).then((r) => setReviews(r.data)).catch(() => {});
      } catch {
        toast("Product not found", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    measurementsAPI.list().then((r) => {
      setProfiles(r.data);
      if (r.data[0]) setMeasurementId(r.data[0]._id);
    }).catch(() => {});
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="page-shell section-pad max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="skeleton aspect-[3/4]" />
          <div className="space-y-4">
            <div className="skeleton h-10 w-2/3" />
            <div className="skeleton h-6 w-1/3" />
            <div className="skeleton h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-shell section-pad text-center">
        <p className="font-display text-3xl">Design not found</p>
        <Link to="/products" className="btn-primary mt-6 inline-flex">
          Back to Shop
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image || "/images/ethnicwear.webp"];
  const price = product.salePrice ?? product.price;
  const sizes = (product.sizes?.length ? product.sizes : ["XS", "S", "M", "L", "XL"]).filter(
    (s) => s.toLowerCase() !== "custom"
  );
  const selectedProfile = profiles.find((p) => p._id === measurementId);
  const profileValues =
    selectedProfile?.values instanceof Map
      ? Object.fromEntries(selectedProfile.values)
      : selectedProfile?.values || {};

  const tryAdd = () => {
    const isReadyMade = !product.productType || product.productType === "ready_made";
    if (isReadyMade && typeof product.stock === "number" && product.stock <= 0) {
      toast("This design is out of stock", "error");
      return;
    }
    if (fitMode === "standard" && !size) {
      toast("Please choose a size", "error");
      return;
    }
    if (fitMode === "custom") {
      if (!isAuthenticated) {
        toast("Sign in to use custom measurements", "info");
        return;
      }
      if (!measurementId) {
        toast("Select or create a measurement profile", "error");
        return;
      }
      setConfirmOpen(true);
      return;
    }
    doAdd();
  };

  const doAdd = async () => {
    try {
      await addToCart({
        ...product,
        size: fitMode === "custom" ? "Custom" : size,
        customization: {
          ...customization,
          size: fitMode === "custom" ? "Custom" : size,
        },
        measurementProfile: fitMode === "custom" ? measurementId : undefined,
        measurementSnapshot:
          fitMode === "custom" && selectedProfile
            ? {
                profileName: selectedProfile.name,
                garmentType: selectedProfile.garmentType,
                unit: selectedProfile.unit,
                values: profileValues,
              }
            : undefined,
        customerNotes: customization.notes,
      });
      setConfirmOpen(false);
      toast("Added to bag", "success");
    } catch {
      toast("Could not add to bag", "error");
    }
  };

  return (
    <div className="page-shell section-pad pt-24 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-3">
          <div className="aspect-[3/4] overflow-hidden bg-[var(--bg-soft)]">
            <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--ink-muted)]">{product.category}</p>
          <h1 className="font-display text-4xl md:text-5xl text-[var(--accent)] mt-2">{product.name}</h1>
          <p className="text-2xl mt-3">₹{price?.toLocaleString("en-IN")}</p>
          <p className="mt-6 text-[var(--ink-muted)] leading-relaxed">{product.description}</p>

          <div className="mt-8">
            <p className="text-sm font-medium mb-3">Fit</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setFitMode("standard")}
                className={`border p-3 text-sm text-left ${
                  fitMode === "standard" ? "border-[var(--accent)] bg-[var(--bg-soft)]" : "border-[var(--line)]"
                }`}
              >
                <p className="font-medium">Standard size</p>
                <p className="text-[var(--ink-muted)] text-xs mt-1">Ready sizes</p>
              </button>
              <button
                type="button"
                onClick={() => setFitMode("custom")}
                className={`border p-3 text-sm text-left ${
                  fitMode === "custom" ? "border-[var(--accent)] bg-[var(--bg-soft)]" : "border-[var(--line)]"
                }`}
              >
                <p className="font-medium">Custom measurements</p>
                <p className="text-[var(--ink-muted)] text-xs mt-1">Made to measure</p>
              </button>
            </div>

            {fitMode === "standard" ? (
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`px-3 py-2 text-sm border ${
                      size === s ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--line)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {isAuthenticated && profiles.length > 0 ? (
                  <select
                    className="input-field"
                    value={measurementId}
                    onChange={(e) => setMeasurementId(e.target.value)}
                  >
                    {profiles.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.garmentType})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-[var(--ink-muted)]">
                    No saved profiles.{" "}
                    <Link to="/measurements" className="underline text-[var(--accent)]">
                      Create measurements
                    </Link>
                  </p>
                )}
                <Link to="/measurements" className="text-sm underline text-[var(--ink-muted)]">
                  Manage measurement profiles
                </Link>
              </div>
            )}
          </div>

          {product.customizable !== false && (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium">Customization</p>
              <select
                className="input-field"
                value={customization.embroidery}
                onChange={(e) => setCustomization({ ...customization, embroidery: e.target.value })}
              >
                <option>None</option>
                <option>Light</option>
                <option>Premium</option>
              </select>
              <select
                className="input-field"
                value={customization.lining}
                onChange={(e) => setCustomization({ ...customization, lining: e.target.value })}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
              <textarea
                className="input-field"
                rows={2}
                placeholder="Special notes (e.g. keep neckline slightly higher)"
                value={customization.notes}
                onChange={(e) => setCustomization({ ...customization, notes: e.target.value })}
              />
            </div>
          )}

          <p className="mt-6 text-sm text-[var(--ink-muted)]">
            Estimated stitching: {product.estimatedDeliveryDays || 7} working days
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={tryAdd} className="btn-primary">
              Add to Cart
            </button>
            <Link to="/book" className="btn-secondary">
              Book Tailoring
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl text-[var(--accent)] mb-8">Related designs</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-20 max-w-3xl">
        <h2 className="font-display text-3xl text-[var(--accent)] mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-[var(--ink-muted)]">No reviews yet. Delivered customers can rate fit and quality.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r._id} className="border-b border-[var(--line)] pb-4 text-sm">
                <p className="font-medium">
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)} · {r.user?.name || "Customer"}
                </p>
                <p className="text-[var(--ink-muted)] mt-1">
                  Fit {r.fitRating || "—"} · Quality {r.qualityRating || "—"} · Delivery {r.deliveryRating || "—"}
                </p>
                {r.text && <p className="mt-2">{r.text}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[var(--bg)] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-auto">
            <h3 className="font-display text-2xl text-[var(--accent)]">Confirm measurements</h3>
            <p className="text-sm text-[var(--ink-muted)] mt-1">
              {selectedProfile?.name} · {selectedProfile?.garmentType}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {Object.entries(profileValues).map(([k, v]) => (
                <li key={k} className="flex justify-between border-b border-[var(--line)] py-2">
                  <span>{labelize(k)}</span>
                  <span>{v}"</span>
                </li>
              ))}
            </ul>
            <p className="text-sm mt-4 text-[var(--ink-muted)]">
              Embroidery: {customization.embroidery} · Lining: {customization.lining}
            </p>
            <div className="flex gap-3 mt-6">
              <button type="button" className="btn-secondary flex-1" onClick={() => setConfirmOpen(false)}>
                Edit
              </button>
              <button type="button" className="btn-primary flex-1" onClick={doAdd}>
                Looks good — add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
