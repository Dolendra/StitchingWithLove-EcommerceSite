import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    name: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    landmark: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    addresses: [addressSchema],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
