import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import { getStripe, hasStripeKeys } from "../utils/stripe.js";
import { calculateOrderTotals } from "../services/orderPricing.js";
import { notifyUser } from "../services/notify.js";
import { nextOrderNumber } from "../utils/orderNumber.js";

const router = express.Router();

// In-flight locks by user to reduce double-submit order creation
const creatingForUser = new Set();

router.post(
  "/create-session",
  protect,
  asyncHandler(async (req, res) => {
    const userId = String(req.user._id);
    if (creatingForUser.has(userId)) {
      res.status(429);
      throw new Error("Payment already starting. Please wait a moment.");
    }

    const { items, shippingAddress } = req.body;
    if (!hasStripeKeys()) {
      res.status(503);
      throw new Error("Payment gateway unavailable. Contact support.");
    }

    creatingForUser.add(userId);
    try {
      let priced;
      try {
        priced = await calculateOrderTotals(items);
      } catch (err) {
        res.status(err.status || 400);
        throw new Error(err.message || "Unable to price order");
      }

      // Reuse an existing recent unpaid order for this user if identical total + same stripe pending
      // Prefer creating fresh order each checkout attempt for clarity; cancel older pending stubs
      await Order.updateMany(
        {
          user: req.user._id,
          paymentStatus: "pending",
          createdAt: { $lt: new Date(Date.now() - 2 * 60 * 1000) },
        },
        { $set: { paymentStatus: "cancelled", orderStatus: "cancelled" } }
      );

      const orderNumber = await nextOrderNumber();
      const dbOrder = await Order.create({
        orderNumber,
        user: req.user._id,
        items: priced.items,
        subtotal: priced.subtotal,
        shippingFee: priced.shippingFee,
        discount: priced.discount,
        totalAmount: priced.totalAmount,
        shippingAddress: shippingAddress || undefined,
        paymentStatus: "pending",
        orderStatus: "placed",
        tracking: [
          {
            status: "placed",
            note: "Order created, awaiting payment",
            visibility: "customer",
          },
        ],
        estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          ...priced.items.map((i) => ({
            price_data: {
              currency: "inr",
              product_data: { name: i.name },
              unit_amount: Math.round((i.price + (i.stitchingPrice || 0)) * 100),
            },
            quantity: i.quantity,
          })),
          ...(priced.shippingFee > 0
            ? [
                {
                  price_data: {
                    currency: "inr",
                    product_data: { name: "Shipping" },
                    unit_amount: Math.round(priced.shippingFee * 100),
                  },
                  quantity: 1,
                },
              ]
            : []),
        ],
        success_url: `${process.env.FRONTEND_BASE_URL || "http://localhost:5173"}/payment/success?orderId=${dbOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_BASE_URL || "http://localhost:5173"}/payment/cancel?orderId=${dbOrder._id}`,
        metadata: { orderId: String(dbOrder._id), userId: String(req.user._id) },
      });

      dbOrder.stripeSessionId = session.id;
      await dbOrder.save();

      res.json({
        url: session.url,
        dbOrderId: dbOrder._id,
        orderNumber: dbOrder.orderNumber,
        totalAmount: priced.totalAmount,
        subtotal: priced.subtotal,
        shippingFee: priced.shippingFee,
      });
    } finally {
      creatingForUser.delete(userId);
    }
  })
);

router.get(
  "/confirm",
  protect,
  asyncHandler(async (req, res) => {
    const { session_id, orderId } = req.query;
    if (!session_id || !orderId) {
      res.status(400);
      throw new Error("Missing session_id or orderId");
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Forbidden");
    }

    // Idempotent: refresh on success page must NOT create or re-notify
    if (order.paymentStatus === "paid") {
      return res.json({ status: "paid", order, alreadyConfirmed: true });
    }

    if (session.payment_status === "paid") {
      order.paymentStatus = "paid";
      if (!order.orderStatus || order.orderStatus === "placed") {
        order.orderStatus = "placed";
      }
      const alreadyNoted = (order.tracking || []).some(
        (t) => t.note === "Payment confirmed" && t.status === "placed"
      );
      if (!alreadyNoted) {
        order.tracking.push({
          status: "placed",
          note: "Payment confirmed",
          visibility: "customer",
        });
      }

      // Decrement stock for ready-made lines once
      for (const item of order.items) {
        if (!item.product) continue;
        const product = await Product.findById(item.product);
        if (!product) continue;
        if (product.productType === "ready_made" || product.productType == null) {
          if (typeof product.stock === "number") {
            product.stock = Math.max(0, product.stock - (item.quantity || 1));
            await product.save();
          }
        }
      }

      // Clear server cart only after successful payment
      await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

      await order.save();
      await notifyUser(order.user, {
        title: "Order confirmed",
        message: `Payment received for order ${order.orderNumber}.`,
        type: "order",
        link: `/orders/${order._id}`,
      });
    }

    res.json({ status: order.paymentStatus, order, alreadyConfirmed: false });
  })
);

// Mark pending order cancelled when user aborts Stripe checkout
router.post(
  "/cancel-pending",
  protect,
  asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    if (!orderId) {
      res.status(400);
      throw new Error("orderId required");
    }
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Forbidden");
    }
    if (order.paymentStatus === "pending") {
      order.paymentStatus = "cancelled";
      order.orderStatus = "cancelled";
      order.tracking.push({
        status: "cancelled",
        note: "Payment cancelled by customer",
        visibility: "customer",
      });
      await order.save();
    }
    res.json({ success: true, order });
  })
);

export default router;
