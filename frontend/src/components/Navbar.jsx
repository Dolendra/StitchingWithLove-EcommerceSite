import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingBag, Heart, User, Search } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { BRAND } from "../config/brand";
import NotificationBell from "./NotificationBell";
import logo from "../assets/logo-preview.svg";

const Navbar = () => {
  const { getItemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/products", label: "Shop" },
    { to: "/custom", label: "Custom Tailoring" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(250,247,242,0.88)] backdrop-blur-md border-b border-[var(--line)] py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-8">
        <Link to="/" className="inline-flex items-center gap-3">
          <img src={logo} alt="" className="h-9 md:h-10" />
          <span className="font-display text-xl md:text-2xl text-[var(--accent)] tracking-tight">
            {BRAND.name}
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-7 text-sm text-[var(--ink)]">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-[var(--accent)] transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/products" aria-label="Search" className="hover:text-[var(--accent)]">
            <Search className="w-5 h-5" />
          </Link>
          <NotificationBell />
          <Link to="/wishlist" aria-label="Wishlist" className="hover:text-[var(--accent)]">
            <Heart className="w-5 h-5" />
          </Link>
          <Link
            to={isAuthenticated ? "/account" : "/login"}
            aria-label="Account"
            className="hover:text-[var(--accent)]"
          >
            <User className="w-5 h-5" />
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin" className="text-sm text-[var(--accent)] font-medium">
              Admin
            </Link>
          )}
          {isAuthenticated && (
            <button onClick={logout} className="text-sm text-[var(--ink-muted)] hover:text-[var(--accent)]">
              Logout
            </button>
          )}
          <Link to="/cart" className="relative hover:text-[var(--accent)]" aria-label="Cart">
            <ShoppingBag className="w-5 h-5" />
            {getItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--accent)] text-white text-[10px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                {getItemCount()}
              </span>
            )}
          </Link>
        </div>

        <button className="md:hidden text-[var(--accent)]" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[var(--bg)] border-t border-[var(--line)] px-5 py-4 space-y-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="block" onClick={() => setIsOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link to="/account" className="block" onClick={() => setIsOpen(false)}>
            Account
          </Link>
          <Link to="/wishlist" className="block" onClick={() => setIsOpen(false)}>
            Wishlist
          </Link>
          <Link to="/cart" className="block" onClick={() => setIsOpen(false)}>
            Cart ({getItemCount()})
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin" className="block" onClick={() => setIsOpen(false)}>
              Admin
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
