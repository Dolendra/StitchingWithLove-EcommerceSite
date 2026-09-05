import { useState } from "react";
import { BRAND } from "../config/brand";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = `Hello, my name is ${formData.name}. My email is ${formData.email}. Message: ${formData.message}`;
    const whatsappURL = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
  };

  return (
    <div className="page-shell section-pad pt-24 max-w-5xl mx-auto">
      <h1 className="font-display text-4xl md:text-5xl text-[var(--accent)] mb-3">Visit our studio</h1>
      <p className="text-[var(--ink-muted)] mb-10 max-w-xl">
        Reach out for custom orders, fittings or collaborations. We typically reply within a day.
      </p>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs tracking-widest uppercase text-[var(--ink-muted)]">Call</p>
            <p className="mt-1">{BRAND.phone}</p>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-[var(--ink-muted)]">WhatsApp</p>
            <a
              href={`https://wa.me/${BRAND.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block underline text-[var(--accent)]"
            >
              Chat with us
            </a>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-[var(--ink-muted)]">Email</p>
            <p className="mt-1">{BRAND.email}</p>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-[var(--ink-muted)]">Studio</p>
            <p className="mt-1">{BRAND.address}</p>
            <p className="text-[var(--ink-muted)]">{BRAND.hours}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="input-field"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            className="input-field"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <textarea
            className="input-field"
            name="message"
            rows={5}
            placeholder="How can we help?"
            value={formData.message}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn-primary">
            Send via WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}
