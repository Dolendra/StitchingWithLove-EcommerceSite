import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: { type: String, required: true },
  phone: String,
  status: { type: String, enum: ["pending","confirmed"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("Appointment", appointmentSchema);
