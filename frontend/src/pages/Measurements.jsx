import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { measurementsAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import { MEASUREMENT_HINTS, MEASUREMENT_RANGES } from "../config/brand";

const labelize = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

const toDisplay = (inches, unit) =>
  unit === "cm" ? Math.round(inches * 2.54 * 10) / 10 : inches;

const toInches = (val, unit) =>
  unit === "cm" ? Math.round((Number(val) / 2.54) * 10) / 10 : Number(val);

const Measurements = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [fieldsMap, setFieldsMap] = useState({});
  const [garmentTypes, setGarmentTypes] = useState([]);
  const [wizard, setWizard] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [step, setStep] = useState(1);
  const [garmentType, setGarmentType] = useState("");
  const [method, setMethod] = useState("");
  const [fieldIndex, setFieldIndex] = useState(0);
  const [values, setValues] = useState({}); // stored in inches
  const [unit, setUnit] = useState("inches");
  const [name, setName] = useState("");
  const [warnings, setWarnings] = useState([]);

  const fields = useMemo(() => fieldsMap[garmentType] || [], [fieldsMap, garmentType]);

  const load = async () => {
    try {
      const [list, meta] = await Promise.all([
        measurementsAPI.list(),
        measurementsAPI.fields(),
      ]);
      setProfiles(list.data);
      setFieldsMap(meta.data.fields || {});
      setGarmentTypes(meta.data.garmentTypes || []);
    } catch {
      toast("Could not load measurements", "error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetWizard = () => {
    setWizard(false);
    setEditingId(null);
    setStep(1);
    setGarmentType("");
    setMethod("");
    setFieldIndex(0);
    setValues({});
    setName("");
    setWarnings([]);
  };

  const checkRanges = (vals) => {
    const issues = [];
    for (const [key, inches] of Object.entries(vals)) {
      const range = MEASUREMENT_RANGES[key];
      if (!range || inches == null || inches === "") continue;
      if (inches < range.min || inches > range.max) {
        issues.push(`${labelize(key)}: ${inches}" looks unusual (typical ${range.min}–${range.max}")`);
      }
    }
    return issues;
  };

  const startEdit = (profile) => {
    const vals =
      profile.values instanceof Map
        ? Object.fromEntries(profile.values)
        : { ...(profile.values || {}) };
    setEditingId(profile._id);
    setWizard(true);
    setStep(3);
    setMethod("enter");
    setGarmentType(profile.garmentType);
    setName(profile.name);
    setUnit(profile.unit || "inches");
    setValues(vals);
    setFieldIndex(0);
  };

  const save = async () => {
    if (!name.trim()) {
      toast("Give this profile a name", "error");
      return;
    }
    const filled = Object.keys(values).length;
    if (filled < Math.min(3, fields.length)) {
      toast("Please enter a few more measurements", "error");
      return;
    }
    try {
      if (editingId) {
        await measurementsAPI.update(editingId, { name, garmentType, values, unit });
        toast("Profile updated", "success");
      } else {
        await measurementsAPI.create({ name, garmentType, values, unit });
        toast("Measurement profile saved", "success");
      }
      resetWizard();
      load();
    } catch (e) {
      toast(e.response?.data?.message || "Could not save profile", "error");
    }
  };

  const remove = async (id) => {
    try {
      await measurementsAPI.remove(id);
      toast("Profile deleted", "success");
      load();
    } catch {
      toast("Could not delete", "error");
    }
  };

  const duplicate = async (id) => {
    try {
      await measurementsAPI.duplicate(id);
      toast("Profile duplicated", "success");
      load();
    } catch {
      toast("Could not duplicate", "error");
    }
  };

  const currentField = fields[fieldIndex];
  const displayValue =
    currentField && values[currentField] != null
      ? toDisplay(values[currentField], unit)
      : "";

  return (
    <div className="page-shell section-pad pt-24 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl text-[var(--accent)]">My Measurements</h1>
          <p className="text-[var(--ink-muted)] mt-2">Save once. Reuse for every custom order.</p>
        </div>
        {!wizard && (
          <button type="button" className="btn-primary" onClick={() => setWizard(true)}>
            New profile
          </button>
        )}
      </div>

      {wizard ? (
        <div className="surface rounded-2xl p-6 md:p-8">
          <div className="flex justify-end mb-4">
            <div className="inline-flex border border-[var(--line)] rounded-full overflow-hidden text-sm">
              {["inches", "cm"].map((u) => (
                <button
                  key={u}
                  type="button"
                  className={`px-3 py-1 ${unit === u ? "bg-[var(--accent)] text-white" : ""}`}
                  onClick={() => setUnit(u)}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {step === 1 && (
            <>
              <h2 className="font-display text-2xl mb-4">Select garment</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {garmentTypes.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setGarmentType(g);
                      setStep(2);
                    }}
                    className="border border-[var(--line)] px-4 py-6 capitalize hover:border-[var(--accent)]"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-2xl mb-2">How would you like to provide measurements?</h2>
              <p className="text-sm text-[var(--ink-muted)] mb-6">Choose one option to continue.</p>
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full border border-[var(--line)] p-4 text-left hover:border-[var(--accent)]"
                  onClick={() => {
                    setMethod("enter");
                    setStep(3);
                    setFieldIndex(0);
                  }}
                >
                  <p className="font-medium">Enter measurements yourself</p>
                  <p className="text-sm text-[var(--ink-muted)]">Guided fields with how-to tips</p>
                </button>
                {profiles.length > 0 && (
                  <button
                    type="button"
                    className="w-full border border-[var(--line)] p-4 text-left hover:border-[var(--accent)]"
                    onClick={() => {
                      setWizard(false);
                      toast("Select a saved profile below to edit or duplicate", "info");
                    }}
                  >
                    <p className="font-medium">Use saved measurements</p>
                    <p className="text-sm text-[var(--ink-muted)]">{profiles.length} profile(s) available</p>
                  </button>
                )}
                <button
                  type="button"
                  className="w-full border border-[var(--line)] p-4 text-left hover:border-[var(--accent)]"
                  onClick={() => navigate("/book")}
                >
                  <p className="font-medium">Book a measurement appointment</p>
                  <p className="text-sm text-[var(--ink-muted)]">We measure you at the studio</p>
                </button>
              </div>
              <button type="button" className="mt-4 text-sm underline" onClick={() => setStep(1)}>
                Back
              </button>
            </>
          )}

          {step === 3 && method === "enter" && currentField && (
            <>
              <p className="text-xs tracking-widest text-[var(--rose)] mb-2">
                {fieldIndex + 1} / {fields.length}
              </p>
              <h2 className="font-display text-3xl mb-2">{labelize(currentField)}</h2>
              <div className="mb-6 p-4 bg-[var(--bg-soft)] rounded-xl">
                <p className="text-xs uppercase tracking-widest text-[var(--ink-muted)] mb-1">
                  How to measure
                </p>
                <p className="text-sm text-[var(--ink-muted)]">
                  {MEASUREMENT_HINTS[currentField] || "Enter the measurement carefully."}
                </p>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  className="input-field text-2xl pr-16"
                  placeholder={unit}
                  value={displayValue}
                  onChange={(e) => {
                    const v = e.target.value;
                    setValues((prev) => {
                      const next = { ...prev };
                      if (v === "") delete next[currentField];
                      else next[currentField] = toInches(v, unit);
                      return next;
                    });
                  }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]">
                  {unit === "cm" ? "cm" : "in"}
                </span>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    if (fieldIndex === 0 && !editingId) setStep(2);
                    else if (fieldIndex === 0) setStep(4);
                    else setFieldIndex((i) => i - 1);
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    if (fieldIndex >= fields.length - 1) {
                      setWarnings(checkRanges(values));
                      setStep(4);
                    } else setFieldIndex((i) => i + 1);
                  }}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="font-display text-2xl mb-2">Please confirm your measurements</h2>
              <p className="text-sm text-[var(--ink-muted)] mb-4">
                Double-check before saving — this protects your fit.
              </p>
              <ul className="space-y-2 mb-6">
                {Object.entries(values).map(([k, v]) => (
                  <li key={k} className="flex justify-between text-sm border-b border-[var(--line)] py-2">
                    <span>{labelize(k)}</span>
                    <span>
                      {toDisplay(v, unit)}
                      {unit === "cm" ? " cm" : '"'}
                    </span>
                  </li>
                ))}
              </ul>
              {warnings.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50 text-amber-900 text-sm rounded-xl space-y-1">
                  <p className="font-medium">Please review</p>
                  {warnings.map((w) => (
                    <p key={w}>{w}</p>
                  ))}
                </div>
              )}
              <input
                className="input-field mb-4"
                placeholder='Save as e.g. "Wedding Blouse"'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="flex flex-wrap gap-3">
                <button type="button" className="btn-secondary" onClick={() => setStep(3)}>
                  Edit measurements
                </button>
                <button type="button" className="btn-primary" onClick={save}>
                  Measurements look good — save
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            className="mt-6 text-sm text-[var(--ink-muted)] underline"
            onClick={resetWizard}
          >
            Cancel
          </button>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-display text-2xl text-[var(--accent)]">No profiles yet</p>
          <p className="text-[var(--ink-muted)] mt-2">Create your first measurement profile.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((p, idx) => (
            <div
              key={p._id}
              className="surface rounded-2xl p-5 flex flex-wrap justify-between gap-4"
            >
              <div>
                <h3 className="font-display text-2xl">{p.name}</h3>
                <p className="text-sm text-[var(--ink-muted)] capitalize">
                  {p.garmentType} · Updated {new Date(p.updatedAt).toLocaleDateString()}
                  {idx === 0 ? " · Last used" : ""}
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <button type="button" className="underline" onClick={() => startEdit(p)}>
                  Edit
                </button>
                <button type="button" className="underline" onClick={() => duplicate(p._id)}>
                  Duplicate
                </button>
                <button type="button" className="underline text-red-700" onClick={() => remove(p._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Measurements;
