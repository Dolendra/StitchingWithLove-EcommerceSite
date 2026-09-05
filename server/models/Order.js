import mongoose from "mongoose";

export const TAILORING_STATUSES = [
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
  "cancelled",
  // legacy ecommerce statuses (kept for existing documents)
  "processing",
];

const CANCELABLE_STATUSES = ["placed", "measurement_confirmed", "fabric_selected"];

const measurementSnapshotSchema = new mongoose.Schema(
  {
    profileName: String,
    garmentType: String,
    unit: { type: String, default: "inches" },
    // Plain object (not Map) so snapshots serialize reliably and never mutate with profiles
    values: { type: Object, default: {} },
  },
  { _id: false }
);

const customizationSchema = new mongoose.Schema(
  {
    size: String,
    color: String,
    fabric: String,
    neck: String,
    sleeve: String,
    embroidery: String,
    lining: String,
    notes: String,
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productId: String,
    name: String,
    basePrice: Number,
    price: Number,
    quantity: { type: Number, default: 1 },
    variant: {
      size: String,
      color: String,
      fabric: String,
    },
    customization: customizationSchema,
    measurementProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Measurement" },
    measurementSnapshot: measurementSnapshotSchema,
    referenceImages: [String],
    customerNotes: String,
    stitchingPrice: { type: Number, default: 0 },
    finalPrice: Number,
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    landmark: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: TAILORING_STATUSES,
      default: "placed",
    },
    shippingAddress: shippingAddressSchema,
    estimatedCompletion: Date,
    adminNotes: String,
    stripeSessionId: String,
    tracking: [
      {
        status: String,
        note: String,
        visibility: {
          type: String,
          enum: ["customer", "internal"],
          default: "customer",
        },
        at: { type: Date, default: Date.now },
      },
    ],
    messages: [
      {
        from: { type: String, enum: ["user", "admin"], default: "user" },
        text: String,
        at: { type: Date, default: Date.now },
      },
    ],
    alterationRequests: [
      {
        issues: [String],
        notes: String,
        photos: [String],
        status: {
          type: String,
          enum: ["open", "approved", "completed", "rejected"],
          default: "open",
        },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  // Prefer explicit orderNumber from nextOrderNumber(); keep legacy fallback
  if (!this.orderNumber) {
    const year = new Date().getFullYear();
    this.orderNumber = `SWL-${year}-${Date.now().toString().slice(-6)}`;
  }
  next();
});

orderSchema.methods.canCancel = function () {
  if (this.paymentStatus !== "paid") return false;
  if (this.orderStatus === "cancelled") return false;
  return CANCELABLE_STATUSES.includes(this.orderStatus);
};

export { CANCELABLE_STATUSES };
export default mongoose.model("Order", orderSchema);
