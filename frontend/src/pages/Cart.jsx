// src/pages/Cart.jsx
import React from "react";
import CartItem from "../components/CartItem";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getTotal } = useCart();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <Link
            to="/products"
            className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          {items.map(item => (
            <CartItem
              key={item._id || item.id}
              item={item}
              onRemove={removeFromCart}
              onQuantityChange={updateQuantity}
            />
          ))}
          <div className="flex justify-between mt-6">
            <h3 className="text-xl font-semibold">Total: ₹{getTotal()}</h3>
            <Link
              to="/checkout"
              className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700"
            >
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
