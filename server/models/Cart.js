import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1 },
    size: String,
    customization: {
      size: String,
      color: String,
      fabric: String,
      neck: String,
      sleeve: String,
      embroidery: String,
      lining: String,
      notes: String,
    },
    measurementProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Measurement" },
    measurementSnapshot: {
      profileName: String,
      garmentType: String,
      unit: String,
      values: { type: Object, default: {} },
    },
    customerNotes: String,
    stitchingPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
