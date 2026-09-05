import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appointmentsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const SERVICES = ["blouse", "dress", "bridal", "kids", "alteration", "measurement", "consultation", "fitting"];

const BookAppointment = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [slots, setSlots] = useState([]);
  const [booked, setBooked] = useState([]);
  const [created, setCreated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    service: "consultation",
    preferredDate: "",
    preferredSlot: "10:00",
    purpose: "",
    measurementRequired: false,
    message: "",
  });

  useEffect(() => {
    if (!form.preferredDate) return;
    appointmentsAPI
      .slots(form.preferredDate)
      .then((r) => {
        setSlots(r.data.slots || []);
        setBooked(r.data.booked || []);
      })
      .catch(() => {});
  }, [form.preferredDate]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast("Please sign in to book", "info");
      return;
    }
    if (!form.phone || !form.preferredDate) {
      toast("Phone and date are required", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await appointmentsAPI.create(form);
      setCreated(res.data);
      toast("Appointment requested", "success");
    } catch (err) {
      toast(err.response?.data?.message || "Booking failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="page-shell section-pad pt-24 max-w-lg mx-auto text-center">
        <h1 className="font-display text-4xl text-[var(--accent)]">Appointment requested</h1>
        <p className="mt-4 text-[var(--ink-muted)]">
          Reference <strong>#{created._id.slice(-6).toUpperCase()}</strong>
        </p>
        <p className="mt-2 text-sm">
          {created.service} · {new Date(created.preferredDate).toLocaleDateString()} ·{" "}
          {created.preferredSlot}
        </p>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">Status: {created.status}</p>
        <Link to="/account" className="btn-primary mt-8 inline-flex">
          Go to account
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell section-pad pt-24 max-w-xl mx-auto">
      <h1 className="font-display text-4xl text-[var(--accent)] mb-2">Book an appointment</h1>
      <p className="text-[var(--ink-muted)] mb-8">
        Choose a service, date and slot. We will confirm shortly.
      </p>
      {!isAuthenticated && (
        <p className="mb-6 text-sm">
          <Link to="/login" className="underline text-[var(--accent)]">
            Sign in
          </Link>{" "}
          to submit a booking.
        </p>
      )}
      <form onSubmit={submit} className="space-y-4">
        <input className="input-field" name="name" placeholder="Name" value={form.name} onChange={onChange} />
        <input className="input-field" name="phone" placeholder="Phone" value={form.phone} onChange={onChange} required />
        <select className="input-field" name="service" value={form.service} onChange={onChange}>
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          className="input-field"
          type="date"
          name="preferredDate"
          value={form.preferredDate}
          onChange={onChange}
          required
        />
        <select className="input-field" name="preferredSlot" value={form.preferredSlot} onChange={onChange}>
          {(slots.length ? slots : ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00"]).map((s) => (
            <option key={s} value={s} disabled={booked.includes(s)}>
              {s} {booked.includes(s) ? "(booked)" : ""}
            </option>
          ))}
        </select>
        <input
          className="input-field"
          name="purpose"
          placeholder="Purpose (e.g. bridal consultation)"
          value={form.purpose}
          onChange={onChange}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="measurementRequired"
            checked={form.measurementRequired}
            onChange={onChange}
          />
          Measurement required
        </label>
        <textarea
          className="input-field"
          name="message"
          rows={3}
          placeholder="Additional notes"
          value={form.message}
          onChange={onChange}
        />
        <button type="submit" className="btn-primary w-full" disabled={loading || !isAuthenticated}>
          {loading ? "Submitting…" : "Request appointment"}
        </button>
      </form>
    </div>
  );
};

export default BookAppointment;
