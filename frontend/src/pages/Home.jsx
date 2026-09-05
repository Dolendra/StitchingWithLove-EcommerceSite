import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BRAND, OCCASIONS } from "../config/brand";
import { useEffect, useState } from "react";
import { productsAPI } from "../services/api";
import ProductCard from "../components/ProductCard";

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

const Home = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    productsAPI
      .getAll({ featured: "true", sort: "newest" })
      .then((r) => setFeatured(r.data.slice(0, 4)))
      .catch(() =>
        productsAPI.getAll().then((r) => setFeatured(r.data.slice(0, 4))).catch(() => {})
      );
  }, []);

  return (
    <div>
      <section className="relative min-h-[100svh] flex items-end md:items-center">
        <img
          src="/images/home3.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(42,36,34,0.78)] via-[rgba(42,36,34,0.4)] to-[rgba(42,36,34,0.25)]" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-8 pb-16 md:pb-24 pt-28">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl text-white leading-[1.05] max-w-3xl"
          >
            {BRAND.name}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 font-display text-2xl sm:text-3xl md:text-4xl text-[#f3ebe1] font-normal"
          >
            Tailored Around You.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-4 max-w-lg text-white/85 text-base md:text-lg"
          >
            From your measurements to the final stitch, create clothing that feels truly yours.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link to="/products" className="btn-primary bg-white text-[var(--accent)] hover:bg-[var(--champagne)]">
              Shop Collection
            </Link>
            <Link
              to="/custom"
              className="btn-secondary border-white text-white hover:bg-white hover:text-[var(--accent)]"
            >
              Create Custom Outfit
            </Link>
          </motion.div>
        </div>
      </section>

      <motion.section {...fade} className="section-pad bg-[var(--bg-soft)]">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-[var(--accent)] mb-10 text-center">
            How it works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              ["01", "Choose your design", "Browse the collection or bring inspiration from our portfolio."],
              ["02", "Share your measurements", "Use a saved profile or book a studio measurement."],
              ["03", "We stitch with care", "Cutting, stitching and quality checks — tracked live."],
              ["04", "Track every step", "Follow production, fittings, alterations and delivery."],
            ].map(([n, t, d]) => (
              <div key={n}>
                <p className="text-xs tracking-[0.2em] text-[var(--rose)] mb-2">{n}</p>
                <h3 className="font-display text-2xl text-[var(--ink)] mb-2">{t}</h3>
                <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...fade} className="section-pad max-w-7xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl text-[var(--accent)] mb-8">Shop by Occasion</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {OCCASIONS.map((o) => (
            <Link
              key={o}
              to={`/products?occasion=${encodeURIComponent(o)}`}
              className="aspect-[3/4] relative overflow-hidden bg-[var(--bg-soft)]"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--plum-deep)]/70 to-transparent" />
              <span className="absolute bottom-4 left-4 font-display text-xl text-white">{o}</span>
            </Link>
          ))}
        </div>
      </motion.section>

      {featured.length > 0 && (
        <motion.section {...fade} className="section-pad pt-0 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display text-3xl md:text-4xl text-[var(--accent)]">Featured Designs</h2>
            <Link to="/products" className="text-sm underline underline-offset-4 text-[var(--ink-muted)]">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </motion.section>
      )}

      <motion.section {...fade} className="section-pad max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-0 min-h-[360px]">
          <div className="bg-[var(--accent)] text-white p-8 md:p-12 flex flex-col justify-center">
            <h2 className="font-display text-3xl md:text-5xl">Custom Tailoring</h2>
            <p className="mt-4 text-white/80 max-w-md">
              Save measurements, customize neck and sleeve details, then track every stitch.
            </p>
            <Link to="/custom" className="btn-primary mt-6 bg-white text-[var(--accent)] inline-flex w-fit">
              Start custom order
            </Link>
          </div>
          <div className="relative min-h-[240px]">
            <img src="/images/bridal.avif" alt="" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        </div>
      </motion.section>

      <motion.section {...fade} className="section-pad pt-0 max-w-7xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl text-[var(--accent)] mb-8">Our Craft</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            ["Measured with care", "Garment-specific profiles so you never start from scratch."],
            ["Made in stages you can see", "From fabric confirmation to fitting ready — live tracking."],
            ["Fitted, then finished", "Alterations and studio fittings when the outfit needs a tweak."],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="font-display text-2xl">{t}</h3>
              <p className="text-sm text-[var(--ink-muted)] mt-3 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section {...fade} className="section-pad pt-0 text-center max-w-3xl mx-auto">
        <h2 className="font-display text-3xl md:text-5xl text-[var(--accent)]">
          Your perfect fit is only a few stitches away.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/measurements" className="btn-primary inline-flex">
            Create measurements
          </Link>
          <Link to="/book" className="btn-secondary inline-flex">
            Book Appointment
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
