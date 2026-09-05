import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    fitRating: { type: Number, min: 1, max: 5 },
    qualityRating: { type: Number, min: 1, max: 5 },
    deliveryRating: { type: Number, min: 1, max: 5 },
    text: { type: String, default: "" },
    photos: [String],
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
