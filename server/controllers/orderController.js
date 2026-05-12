import asyncHandler from "express-async-handler";
import { getRazorpay } from "../utils/razorpay.js";
import Order from "../models/Order.js";

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { totalAmount } = req.body; // in rupees
  const options = {
    amount: totalAmount * 100,
    currency: "INR",
    receipt: `receipt_${req.user._id}_${Date.now()}`
  };

  const instance = getRazorpay();
  const order = await instance.orders.create(options);
  res.json(order); // send order.id to frontend
});

// verify payment
import crypto from "crypto";
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, totalAmount } = req.body;

  const generated_signature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    res.status(400); throw new Error("Invalid signature");
  }

  // create order in DB
  const newOrder = await Order.create({
    user: req.user._id, items, totalAmount, paymentStatus: "paid",
    razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id
  });
  res.json({ success: true, order: newOrder });
});
