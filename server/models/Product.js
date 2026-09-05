import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, index: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["blouse", "dress", "lehenga", "gown", "kids", "ethnic", "western", "alteration", "other"],
      default: "other",
      index: true,
    },
    subcategory: String,
    images: [{ type: String }],
    image: String, // legacy single image
    price: { type: Number, required: true },
    salePrice: Number,
    stock: { type: Number, default: 0 },
    sku: String,
    fabric: String,
    colors: [String],
    sizes: [String],
    occasion: [String],
    customizable: { type: Boolean, default: true },
    stitchingAvailable: { type: Boolean, default: true },
    measurementRequired: { type: Boolean, default: false },
    productType: {
      type: String,
      enum: ["ready_made", "made_to_measure", "tailoring_service", "alteration"],
      default: "ready_made",
    },
    estimatedDeliveryDays: { type: Number, default: 7 },
    careInstructions: String,
    tags: [String],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  if ((!this.images || this.images.length === 0) && this.image) {
    this.images = [this.image];
  }
  next();
});

export default mongoose.model("Product", productSchema);
