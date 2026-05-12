import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createRazorpayOrder,
  verifyPayment,
} from "../controllers/orderController.js";

// Orders resource (non-payment): list mine, list all, update status
import Order from "../models/Order.js";
import asyncHandler from "express-async-handler";

const router = express.Router();

// Get my orders
router.get("/my", protect, asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id, paymentStatus: 'paid' }).sort({ createdAt: -1 });
  res.json(orders);
}));

// Get all orders (admin)
router.get("/", protect, admin, asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json(orders);
}));

// Update order tracking/status (admin)
router.post("/:id/track", protect, admin, asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error("Order not found"); }
  if (status) order.orderStatus = status;
  order.tracking.push({ status: status || 'updated', note });
  await order.save();
  res.json(order);
}));

// Cancel order (user): allowed anytime (marks as cancelled)
router.post("/:id/cancel", protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error("Order not found"); }
  if (order.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error("Forbidden"); }
  order.paymentStatus = "cancelled";
  order.orderStatus = "cancelled";
  order.tracking.push({ status: 'cancelled', note: 'Cancelled by user' });
  await order.save();
  res.json({ success: true, order });
}));

export default router;
