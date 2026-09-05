import React from "react";
import { Link } from "react-router-dom";
import { BRAND } from "../config/brand";

const About = () => {
  return (
    <div className="page-shell">
      <section className="section-pad max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center pt-24">
        <img
          src="/images/amma.jpeg"
          alt="Supraja at her workspace"
          className="w-full aspect-[4/5] object-cover"
        />
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-[var(--rose)] mb-3">Our story</p>
          <h1 className="font-display text-4xl md:text-5xl text-[var(--accent)]">
            Crafted with patience, worn with confidence
          </h1>
          <p className="mt-6 text-[var(--ink-muted)] leading-relaxed">
            Hi, I&apos;m <strong className="text-[var(--ink)]">Supraja</strong> — the hands behind{" "}
            {BRAND.name}. What began as stitching for family and friends grew into an atelier
            devoted to fit, fabric and personal story.
          </p>
          <p className="mt-4 text-[var(--ink-muted)] leading-relaxed">
            Whether bridal wear, everyday elegance or careful alterations, every garment is
            measured, cut and finished with the same care we would give someone we love.
          </p>
          <p className="mt-6 font-display text-xl italic text-[var(--accent)]">
            Stitching dreams, one outfit at a time.
          </p>
          <Link to="/book" className="btn-primary mt-8 inline-flex">
            Book a consultation
          </Link>
        </div>
      </section>

      <section className="section-pad bg-[var(--bg-soft)]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            ["Perfect fit", "Service-specific measurements and fittings when you need them."],
            ["Thoughtful craft", "Careful cutting, clean finishes and quality checks at every stage."],
            ["Personal service", "From inspiration to delivery — tracked, transparent and warm."],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="font-display text-2xl text-[var(--accent)]">{t}</h3>
              <p className="text-sm text-[var(--ink-muted)] mt-3 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
