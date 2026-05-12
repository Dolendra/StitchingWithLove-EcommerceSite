// src/pages/Products.jsx
import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { productsAPI } from "../services/api";
import { useCart } from "../context/CartContext";

const Products = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll();
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        // Fallback to sample products if API fails
        setProducts([
          { _id: 1, name: "Bridal Dress", price: 4999, image: "/images/bridal.avif", description: "Elegant bridal wear" },
          { _id: 2, name: "Party Dress", price: 2999, image: "/images/partywear.webp", description: "Stylish party wear" },
          { _id: 3, name: "Casual Kurti", price: 999, image: "/images/ethnicwear.webp", description: "Comfortable daily wear" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Our Products</h2>
      <input
        type="text"
        placeholder="Search..."
        className="border p-2 rounded-lg mb-6 w-full md:w-1/2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map(product => (
          <ProductCard
            key={product._id || product.id}
            product={product}
            onAddToCart={addToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default Products;
