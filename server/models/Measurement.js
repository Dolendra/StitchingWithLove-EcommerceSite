import mongoose from "mongoose";

export const GARMENT_TYPES = ["blouse", "dress", "lehenga", "gown", "kids", "alteration"];

export const MEASUREMENT_FIELDS = {
  blouse: [
    "shoulder",
    "bust",
    "underBust",
    "waist",
    "blouseLength",
    "sleeveLength",
    "armhole",
    "frontNeckDepth",
    "backNeckDepth",
  ],
  dress: ["bust", "waist", "hip", "shoulder", "dressLength", "sleeveLength", "armhole"],
  lehenga: ["waist", "hip", "length", "blouseShoulder", "blouseBust", "blouseLength"],
  gown: ["bust", "waist", "hip", "shoulder", "gownLength", "sleeveLength"],
  kids: ["chest", "waist", "shoulder", "length", "sleeve"],
  alteration: ["chest", "waist", "hip", "length", "sleeve"],
};

const measurementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    garmentType: {
      type: String,
      enum: GARMENT_TYPES,
      required: true,
    },
    unit: { type: String, enum: ["inches", "cm"], default: "inches" },
    values: {
      type: Map,
      of: Number,
      default: {},
    },
    notes: String,
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Measurement", measurementSchema);
