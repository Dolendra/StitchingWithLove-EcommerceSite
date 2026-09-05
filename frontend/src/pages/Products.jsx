import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { productsAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { CATEGORIES } from "../config/brand";

const Products = () => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get("q") || "");
  const category = params.get("category") || "all";
  const sort = params.get("sort") || "newest";
  const occasion = params.get("occasion") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productsAPI.getAll({
          q: search || undefined,
          category: category !== "all" ? category : undefined,
          sort,
          occasion: occasion || undefined,
        });
        setProducts(response.data);
      } catch {
        setProducts([]);
        toast("Could not load products", "error");
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(fetchProducts, 200);
    return () => clearTimeout(t);
  }, [search, category, sort, occasion]);

  const setCategory = (id) => {
    const next = new URLSearchParams(params);
    if (id === "all") next.delete("category");
    else next.set("category", id);
    setParams(next);
  };

  const handleAdd = async (product) => {
    if (typeof product.stock === "number" && product.stock <= 0 && (!product.productType || product.productType === "ready_made")) {
      toast("This design is out of stock", "error");
      return;
    }
    try {
      await addToCart(product);
      toast("Added to bag", "success");
    } catch {
      toast("Could not add to bag", "error");
    }
  };

  return (
    <div className="page-shell section-pad pt-24 max-w-7xl mx-auto">
      <h1 className="font-display text-4xl md:text-5xl text-[var(--accent)] mb-2">Shop</h1>
      <p className="text-[var(--ink-muted)] mb-8">Ready-to-wear and made-to-measure designs.</p>

      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 text-sm border transition ${
                category === c.id
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--accent)]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="input-field sm:w-64"
            placeholder="Search designs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input-field sm:w-44"
            value={sort}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              next.set("sort", e.target.value);
              setParams(next);
            }}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most popular</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton aspect-[3/4]" />
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-2xl text-[var(--accent)]">No designs found</p>
          <p className="text-[var(--ink-muted)] mt-2">Try another category or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} onAddToCart={handleAdd} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
