import Counter from "../models/Counter.js";

/** Professional customer-facing reference: SWL-2026-001048 */
export async function nextOrderNumber() {
  const year = new Date().getFullYear();
  const key = `order_${year}`;
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const seq = String(doc.seq).padStart(6, "0");
  return `SWL-${year}-${seq}`;
}
