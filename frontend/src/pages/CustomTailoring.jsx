import React from "react";
import { Link } from "react-router-dom";

const CustomTailoring = () => {
  return (
    <div>
      <section className="relative min-h-[70vh] flex items-end">
        <img src="/images/bridal.avif" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(42,36,34,0.75)] to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-16 pt-28 w-full">
          <h1 className="font-display text-4xl md:text-6xl text-white max-w-2xl">
            Custom Tailoring
          </h1>
          <p className="mt-4 text-white/85 max-w-md">
            From inspiration to fittings — designed around your measurements and occasion.
          </p>
        </div>
      </section>

      <section className="section-pad max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        {[
          {
            title: "Choose a design",
            body: "Browse the shop or portfolio, then customize neck, sleeve and embroidery.",
            to: "/products",
            cta: "Browse designs",
          },
          {
            title: "Share measurements",
            body: "Create a saved profile or book a studio measurement appointment.",
            to: "/measurements",
            cta: "My measurements",
          },
          {
            title: "Book consultation",
            body: "Talk through fabric, timeline and fittings with our atelier.",
            to: "/book",
            cta: "Book appointment",
          },
        ].map((item) => (
          <div key={item.title}>
            <h2 className="font-display text-2xl text-[var(--accent)]">{item.title}</h2>
            <p className="text-sm text-[var(--ink-muted)] mt-3 leading-relaxed">{item.body}</p>
            <Link to={item.to} className="inline-block mt-4 text-sm underline underline-offset-4">
              {item.cta}
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
};

export default CustomTailoring;
