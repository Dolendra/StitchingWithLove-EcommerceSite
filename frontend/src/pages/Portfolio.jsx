import React, { useState } from "react";
import { Link } from "react-router-dom";

const ITEMS = [
  { src: "/images/bridal.avif", title: "Bridal", category: "Bridal", fabric: "Silk" },
  { src: "/images/partywear.webp", title: "Party wear", category: "Party", fabric: "Georgette" },
  { src: "/images/ethnicwear.webp", title: "Ethnic blouse", category: "Blouse", fabric: "Cotton silk" },
  { src: "/images/home3.webp", title: "Studio finish", category: "Custom", fabric: "Mixed" },
];

const Portfolio = () => {
  const [active, setActive] = useState(null);

  return (
    <div className="page-shell section-pad pt-24 max-w-7xl mx-auto">
      <h1 className="font-display text-4xl md:text-5xl text-[var(--accent)] mb-3">Portfolio</h1>
      <p className="text-[var(--ink-muted)] mb-10 max-w-lg">
        A selection of recent work. Interested in a similar look? Customize it or book a consultation.
      </p>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {ITEMS.map((item, i) => (
          <button
            key={i}
            type="button"
            className="block w-full break-inside-avoid overflow-hidden group text-left"
            onClick={() => setActive(item)}
          >
            <img
              src={item.src}
              alt={item.title}
              className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="bg-[var(--bg)] max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={active.src} alt="" className="w-full aspect-[3/4] object-cover" />
            <h3 className="font-display text-2xl mt-4 text-[var(--accent)]">{active.title}</h3>
            <p className="text-sm text-[var(--ink-muted)] mt-1">
              {active.category} · {active.fabric}
            </p>
            <div className="flex gap-3 mt-6">
              <Link to="/custom" className="btn-primary" onClick={() => setActive(null)}>
                Customize similar
              </Link>
              <Link to="/book" className="btn-secondary" onClick={() => setActive(null)}>
                Book appointment
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
