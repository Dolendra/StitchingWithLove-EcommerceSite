import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  productId: { type: String },
  name: { type: String },
  price: { type: Number },
  quantity: { type: Number, default: 1 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending","paid","failed","cancelled"], default: "pending" },
  orderStatus: { type: String, enum: ["placed","processing","shipped","out_for_delivery","delivered","cancelled"], default: "placed" },
  tracking: [{ status: String, note: String, at: { type: Date, default: Date.now } }],
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
