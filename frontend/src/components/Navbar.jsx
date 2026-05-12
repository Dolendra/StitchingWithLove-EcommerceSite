import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { getItemCount, items } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-x-3 font-bold text-purple-700">
          <img
            src="./src/assets/logo-preview.svg"
            alt="Stitching With Love Logo"
            className="h-8 md:h-10"
          />
          <span className="text-xl md:text-2xl">Stitching With Love</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-purple-600">Home</Link>
          <Link to="/about" className="hover:text-purple-600">About</Link>
          <Link to="/products" className="hover:text-purple-600">Shop</Link>
          <Link to="/portfolio" className="hover:text-purple-600">Portfolio</Link>
          <Link to="/contact" className="hover:text-purple-600">Contact</Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders" className="hover:text-purple-600">Orders</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="hover:text-purple-600">Admin</Link>
              )}
              <button onClick={logout} className="hover:text-purple-600">Logout</button>
            </>
          ) : (
            <Link to="/login" className="hover:text-purple-600">Login</Link>
          )}

          {/* Cart with Badge */}
          <Link to="/cart" className="relative flex items-center">
            <ShoppingCart className="w-6 h-6 text-purple-700" />
            {getItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                {getItemCount()}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-purple-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg px-6 py-4 space-y-4">
          <Link to="/" className="block hover:text-purple-600" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/about" className="block hover:text-purple-600" onClick={() => setIsOpen(false)}>About</Link>
          <Link to="/products" className="block hover:text-purple-600" onClick={() => setIsOpen(false)}>Shop</Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders" className="block hover:text-purple-600" onClick={() => setIsOpen(false)}>Orders</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="block hover:text-purple-600" onClick={() => setIsOpen(false)}>Admin</Link>
              )}
              <button onClick={() => { logout(); setIsOpen(false); }} className="block hover:text-purple-600">Logout</button>
            </>
          ) : (
            <Link to="/login" className="block hover:text-purple-600" onClick={() => setIsOpen(false)}>Login</Link>
          )}

          {/* Cart with Badge */}
          <Link to="/cart" className="relative flex items-center hover:text-purple-600" onClick={() => setIsOpen(false)}>
            <ShoppingCart className="w-6 h-6 text-purple-700" />
            {getItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                {getItemCount()}
              </span>
            )}
            <span className="ml-2">Cart</span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
