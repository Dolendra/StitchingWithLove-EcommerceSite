export const MEASUREMENT_RANGES = {
  shoulder: { min: 10, max: 22 },
  bust: { min: 24, max: 55 },
  underBust: { min: 22, max: 50 },
  waist: { min: 20, max: 50 },
  hip: { min: 26, max: 60 },
  blouseLength: { min: 10, max: 30 },
  sleeveLength: { min: 0, max: 30 },
  armhole: { min: 10, max: 28 },
  frontNeckDepth: { min: 1, max: 12 },
  backNeckDepth: { min: 1, max: 14 },
  dressLength: { min: 20, max: 70 },
  chest: { min: 18, max: 45 },
  length: { min: 10, max: 60 },
  gownLength: { min: 30, max: 75 },
  blouseShoulder: { min: 10, max: 22 },
  blouseBust: { min: 24, max: 55 },
};

/** Validate measurement values in inches (convert from cm if needed). */
export function validateMeasurements(values = {}, unit = "inches") {
  const issues = [];
  const normalized = {};
  for (const [key, raw] of Object.entries(values)) {
    if (raw === "" || raw == null) continue;
    const num = Number(raw);
    if (Number.isNaN(num) || num <= 0) {
      issues.push(`${key}: enter a valid number`);
      continue;
    }
    const inches = unit === "cm" ? num / 2.54 : num;
    normalized[key] = Math.round(inches * 10) / 10;
    const range = MEASUREMENT_RANGES[key];
    if (range && (inches < range.min || inches > range.max)) {
      issues.push(
        `${key}: ${inches}" looks unusual (typical ${range.min}–${range.max}")`
      );
    }
  }
  return { ok: issues.length === 0, issues, normalized };
}
