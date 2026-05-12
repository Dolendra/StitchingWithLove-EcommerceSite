// src/components/CartItem.jsx
import React from "react";

const CartItem = ({ item, onRemove, onQuantityChange }) => {
  const itemId = item._id || item.id;
  return (
    <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm mb-3">
      <img
        src={item.image}
        alt={item.name}
        className="w-20 h-20 object-cover rounded-lg"
      />
      <div className="flex-1 ml-4">
        <h4 className="text-lg font-semibold">{item.name}</h4>
        <p className="text-gray-600">₹{item.price}</p>
        <div className="flex items-center mt-2">
          <button
            className="px-3 py-1 bg-gray-200 rounded-lg"
            onClick={() => onQuantityChange(itemId, item.quantity - 1)}
            disabled={item.quantity === 1}
          >
            -
          </button>
          <span className="px-4">{item.quantity}</span>
          <button
            className="px-3 py-1 bg-gray-200 rounded-lg"
            onClick={() => onQuantityChange(itemId, item.quantity + 1)}
          >
            +
          </button>
        </div>
      </div>
      <button
        className="text-red-500 ml-4"
        onClick={() => onRemove(itemId)}
      >
        Remove
      </button>
    </div>
  );
};

export default CartItem;
