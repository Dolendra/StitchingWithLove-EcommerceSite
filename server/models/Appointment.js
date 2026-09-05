import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    phone: { type: String, required: true },
    email: String,
    service: {
      type: String,
      enum: ["blouse", "dress", "bridal", "kids", "alteration", "measurement", "consultation", "fitting", "other"],
      default: "consultation",
    },
    purpose: String,
    preferredDate: { type: Date, required: true },
    preferredSlot: {
      type: String,
      enum: ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"],
      default: "10:00",
    },
    measurementRequired: { type: Boolean, default: false },
    designReference: String,
    referenceImages: [String],
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    adminNote: String,
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
