import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { wishlistAPI } from "../services/api";

const ProductCard = ({ product, onAddToCart }) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const img = product.image || product.images?.[0] || "/images/ethnicwear.webp";
  const price = product.salePrice ?? product.price;

  const toggleWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast("Please sign in to save designs", "info");
      return;
    }
    try {
      const res = await wishlistAPI.toggle(product._id);
      setLiked(res.data.added);
      toast(res.data.added ? "Saved to wishlist" : "Removed from wishlist", "success");
    } catch {
      toast("Could not update wishlist", "error");
    }
  };

  return (
    <article className="group">
      <Link to={`/products/${product._id}`} className="block overflow-hidden relative aspect-[3/4] bg-[var(--bg-soft)]">
        <img
          src={img}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <button
          type="button"
          onClick={toggleWish}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur hover:bg-white transition"
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-[var(--rose)] text-[var(--rose)]" : "text-[var(--accent)]"}`} />
        </button>
      </Link>
      <div className="pt-4 space-y-1">
        {product.category && (
          <p className="text-xs uppercase tracking-widest text-[var(--ink-muted)]">{product.category}</p>
        )}
        <Link to={`/products/${product._id}`} className="font-display text-xl text-[var(--ink)] block hover:text-[var(--accent)]">
          {product.name}
        </Link>
        <p className="text-[var(--accent)] font-medium">₹{price?.toLocaleString("en-IN")}</p>
        {onAddToCart && (
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="mt-2 text-sm underline underline-offset-4 text-[var(--ink-muted)] hover:text-[var(--accent)]"
          >
            Add to bag
          </button>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
