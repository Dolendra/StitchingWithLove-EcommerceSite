/**
 * Shared brand + business config for Stitching With Love
 */
export const BRAND = {
  name: "Stitching With Love",
  tagline: "Made for you. Stitched with love.",
  phone: "+91 98765 43210",
  whatsapp: "919876543210",
  email: "hello@stitchingwithlove.in",
  address: "Studio Lane, Hyderabad",
  hours: "Mon – Sat · 10 AM – 7 PM",
};

export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "blouse", label: "Blouses" },
  { id: "dress", label: "Dresses" },
  { id: "lehenga", label: "Lehengas" },
  { id: "gown", label: "Gowns" },
  { id: "kids", label: "Kids" },
  { id: "ethnic", label: "Ethnic" },
  { id: "western", label: "Western" },
  { id: "alteration", label: "Alterations" },
];

export const OCCASIONS = ["Bridal", "Festive", "Party", "Everyday", "Kids", "Alterations"];

export const ORDER_STATUS_LABELS = {
  placed: "Order Placed",
  measurement_confirmed: "Measurement Confirmed",
  fabric_selected: "Fabric / Design Confirmed",
  cutting: "Cutting",
  stitching: "Stitching",
  quality_check: "Quality Check",
  fitting_ready: "Fitting Ready",
  alteration_requested: "Alteration Requested",
  alteration_completed: "Alteration Completed",
  ready_to_ship: "Ready for Dispatch",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  processing: "Processing",
};

export const PRODUCTION_STATUSES = [
  "placed",
  "measurement_confirmed",
  "fabric_selected",
  "cutting",
  "stitching",
  "quality_check",
  "fitting_ready",
  "alteration_requested",
  "alteration_completed",
  "ready_to_ship",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export const KANBAN_COLUMNS = [
  { id: "placed", label: "New" },
  { id: "measurement_confirmed", label: "Measured" },
  { id: "fabric_selected", label: "Fabric" },
  { id: "cutting", label: "Cutting" },
  { id: "stitching", label: "Stitching" },
  { id: "quality_check", label: "QC" },
  { id: "fitting_ready", label: "Fitting" },
  { id: "alteration_requested", label: "Alterations" },
  { id: "ready_to_ship", label: "Ready" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
];

export const MEASUREMENT_HINTS = {
  shoulder: "Measure across the back from shoulder tip to tip.",
  bust: "Measure the fullest part of the bust, keeping tape level.",
  underBust: "Measure directly under the bust.",
  waist: "Measure the narrowest part of your waist.",
  hip: "Measure the fullest part of the hips.",
  blouseLength: "From shoulder to desired blouse hem.",
  sleeveLength: "From shoulder tip to desired sleeve end.",
  armhole: "Around the armhole comfortably.",
  frontNeckDepth: "From shoulder line down the front neck.",
  backNeckDepth: "From shoulder line down the back neck.",
  dressLength: "From shoulder to desired dress hem.",
  chest: "Around the fullest part of the chest.",
  length: "From top to desired hem length.",
  gownLength: "From shoulder to desired gown hem.",
  blouseShoulder: "Blouse shoulder width.",
  blouseBust: "Blouse bust measurement.",
};

/** Typical ranges in inches for soft client-side warnings */
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

export const ALTERATION_ISSUES = [
  "Too tight",
  "Too loose",
  "Length",
  "Sleeve",
  "Neck",
  "Other",
];
