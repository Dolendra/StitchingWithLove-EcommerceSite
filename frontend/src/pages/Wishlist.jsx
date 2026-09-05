import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { wishlistAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const load = async () => {
    try {
      const res = await wishlistAPI.get();
      setProducts(res.data.products || []);
    } catch {
      toast("Could not load wishlist", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const moveToCart = async (product) => {
    try {
      await addToCart(product);
      await wishlistAPI.toggle(product._id);
      setProducts((p) => p.filter((x) => x._id !== product._id));
      toast("Moved to bag", "success");
    } catch {
      toast("Could not move to bag", "error");
    }
  };

  const remove = async (product) => {
    try {
      await wishlistAPI.toggle(product._id);
      setProducts((p) => p.filter((x) => x._id !== product._id));
      toast("Removed from wishlist", "success");
    } catch {
      toast("Could not update wishlist", "error");
    }
  };

  return (
    <div className="page-shell section-pad pt-24 max-w-7xl mx-auto">
      <h1 className="font-display text-4xl text-[var(--accent)] mb-8">Wishlist</h1>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton aspect-[3/4]" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-display text-2xl text-[var(--accent)]">No saved designs yet</p>
          <p className="text-[var(--ink-muted)] mt-2">
            Heart a design while browsing to find it here later.
          </p>
          <Link to="/products" className="btn-primary mt-6 inline-flex">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {products.map((p) => {
              const img = p.image || p.images?.[0] || "/images/ethnicwear.webp";
              const inStock = p.stock == null || p.stock > 0;
              return (
                <motion.article
                  key={p._id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group"
                >
                  <Link to={`/products/${p._id}`} className="block aspect-[3/4] overflow-hidden bg-[var(--bg-soft)]">
                    <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  </Link>
                  <div className="pt-3 space-y-1">
                    <Link to={`/products/${p._id}`} className="font-display text-xl block">
                      {p.name}
                    </Link>
                    <p className="text-[var(--accent)]">₹{(p.salePrice ?? p.price)?.toLocaleString("en-IN")}</p>
                    <p className={`text-xs ${inStock ? "text-[var(--ink-muted)]" : "text-red-700"}`}>
                      {inStock ? (p.stock != null ? `${p.stock} in stock` : "Available") : "Out of stock"}
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2 text-sm">
                      <button
                        type="button"
                        className="underline"
                        disabled={!inStock}
                        onClick={() => moveToCart(p)}
                      >
                        Move to bag
                      </button>
                      <button type="button" className="underline text-[var(--ink-muted)]" onClick={() => remove(p)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
