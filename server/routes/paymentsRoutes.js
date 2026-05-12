import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import { getStripe, hasStripeKeys } from "../utils/stripe.js";

const router = express.Router();

// Create Stripe Checkout Session and provisional DB order
router.post("/create-session", protect, asyncHandler(async (req, res) => {
  const { items, total, shippingAddress } = req.body;
  if (!hasStripeKeys) { res.status(503); throw new Error("Payment gateway unavailable. Contact support."); }

  const dbOrder = await Order.create({
    user: req.user._id,
    items: items.map(i => ({
      product: i.productId && String(i.productId).length === 24 ? i.productId : undefined,
      productId: String(i.productId),
      name: i.name,
      price: Number(i.price),
      quantity: i.quantity,
    })),
    totalAmount: Number(total),
    paymentStatus: "pending",
  });

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: items.map(i => ({
      price_data: {
        currency: "inr",
        product_data: { name: i.name },
        unit_amount: Math.round(Number(i.price) * 100),
      },
      quantity: i.quantity,
    })),
    success_url: `${process.env.FRONTEND_BASE_URL || "http://localhost:5173"}/payment/success?orderId=${dbOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_BASE_URL || "http://localhost:5173"}/payment/cancel`,
    metadata: { orderId: String(dbOrder._id), userId: String(req.user._id) },
  });

  res.json({ url: session.url, dbOrderId: dbOrder._id });
}));

// Confirm session and mark order as paid
router.get("/confirm", protect, asyncHandler(async (req, res) => {
  const { session_id, orderId } = req.query;
  if (!session_id || !orderId) { res.status(400); throw new Error("Missing session_id or orderId"); }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(session_id);
  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error("Order not found"); }
  if (order.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error("Forbidden"); }

  if (session.payment_status === "paid") {
    order.paymentStatus = "paid";
    if (!order.orderStatus || order.orderStatus === 'placed') {
      order.orderStatus = 'placed';
    }
    order.tracking.push({ status: 'placed', note: 'Payment confirmed' });
    await order.save();
  }
  res.json({ status: order.paymentStatus });
}));

export default router;


