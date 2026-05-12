// src/components/ProductCard.jsx
import React from "react";

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white shadow-md rounded-2xl p-4 hover:shadow-lg transition duration-300">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded-xl mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
      <p className="text-gray-600 text-sm mb-2">{product.description}</p>
      <p className="text-purple-600 font-bold text-lg mb-3">₹{product.price}</p>

      <button
        onClick={() => onAddToCart(product)}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-xl hover:bg-purple-700 transition"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
