import { Link } from "react-router-dom";
import { BRAND } from "../config/brand";

const Footer = () => {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--bg-soft)] mt-auto">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <p className="font-display text-2xl text-[var(--accent)]">{BRAND.name}</p>
          <p className="text-sm text-[var(--ink-muted)] mt-3 max-w-xs">{BRAND.tagline}</p>
        </div>
        <div className="text-sm space-y-2">
          <p className="font-medium mb-3">Explore</p>
          <Link to="/products" className="block hover:text-[var(--accent)]">Shop</Link>
          <Link to="/custom" className="block hover:text-[var(--accent)]">Custom Tailoring</Link>
          <Link to="/portfolio" className="block hover:text-[var(--accent)]">Portfolio</Link>
          <Link to="/book" className="block hover:text-[var(--accent)]">Book Appointment</Link>
        </div>
        <div className="text-sm space-y-2 text-[var(--ink-muted)]">
          <p className="font-medium text-[var(--ink)] mb-3">Visit</p>
          <p>{BRAND.address}</p>
          <p>{BRAND.hours}</p>
          <p>{BRAND.phone}</p>
          <p>{BRAND.email}</p>
        </div>
      </div>
      <div className="border-t border-[var(--line)] text-center text-xs text-[var(--ink-muted)] py-4">
        © {new Date().getFullYear()} {BRAND.name}
      </div>
    </footer>
  );
};

export default Footer;
