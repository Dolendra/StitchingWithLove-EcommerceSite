import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import Order, { TAILORING_STATUSES } from "../models/Order.js";
import asyncHandler from "express-async-handler";
import { notifyUser } from "../services/notify.js";

const router = express.Router();

const sanitizeOrderForCustomer = (order) => {
  const obj = order.toObject ? order.toObject() : { ...order };
  obj.tracking = (obj.tracking || []).filter((t) => t.visibility !== "internal");
  delete obj.adminNotes;
  return obj;
};

// Customer: paid orders (including cancelled-after-pay). Hide unpaid Stripe stubs.
router.get(
  "/my",
  protect,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({
      user: req.user._id,
      paymentStatus: "paid",
    }).sort({ createdAt: -1 });
    res.json(orders.map(sanitizeOrderForCustomer));
  })
);

// Admin: only paid (and cancelled-after-pay) orders
router.get(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { status, q } = req.query;
    const filter = { paymentStatus: { $in: ["paid", "cancelled"] } };
    if (status) filter.orderStatus = status;
    const orders = await Order.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  })
);

router.get(
  "/statuses",
  protect,
  asyncHandler(async (_req, res) => {
    res.json(TAILORING_STATUSES);
  })
);

router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate("user", "name email phone");
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error("Forbidden");
    }
    if (isAdmin) return res.json(order);
    res.json(sanitizeOrderForCustomer(order));
  })
);

router.post(
  "/:id/track",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { status, note, customerNote, internalNote, estimatedCompletion, adminNotes } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    if (order.paymentStatus !== "paid") {
      res.status(400);
      throw new Error("Only paid orders can be tracked");
    }
    if (order.orderStatus === "cancelled") {
      res.status(400);
      throw new Error("Cancelled orders cannot be updated");
    }
    if (status) {
      if (!TAILORING_STATUSES.includes(status)) {
        res.status(400);
        throw new Error("Invalid status");
      }
      order.orderStatus = status;
    }
    if (estimatedCompletion) order.estimatedCompletion = estimatedCompletion;
    if (adminNotes != null) order.adminNotes = adminNotes;

    const publicNote =
      customerNote ||
      note ||
      (status ? `Your order is now: ${status.replaceAll("_", " ")}` : "Order updated");

    order.tracking.push({
      status: status || "updated",
      note: publicNote,
      visibility: "customer",
    });

    if (internalNote?.trim()) {
      order.tracking.push({
        status: status || "updated",
        note: internalNote.trim(),
        visibility: "internal",
      });
    }

    await order.save();

    await notifyUser(order.user, {
      title: "Order update",
      message: publicNote,
      type: "order",
      link: `/orders/${order._id}`,
    });

    res.json(order);
  })
);

router.post(
  "/:id/message",
  protect,
  asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text?.trim()) {
      res.status(400);
      throw new Error("Message required");
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error("Forbidden");
    }
    order.messages.push({
      from: isAdmin ? "admin" : "user",
      text: text.trim(),
    });
    await order.save();
    res.json(order);
  })
);

router.post(
  "/:id/cancel",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Forbidden");
    }
    if (!order.canCancel()) {
      res.status(400);
      throw new Error(
        "This order can no longer be cancelled. Contact support if you need help."
      );
    }
    order.orderStatus = "cancelled";
    order.tracking.push({
      status: "cancelled",
      note: "Cancelled by customer",
      visibility: "customer",
    });
    await order.save();

    await notifyUser(order.user, {
      title: "Order cancelled",
      message: `Order ${order.orderNumber || order._id} was cancelled.`,
      type: "order",
      link: `/orders/${order._id}`,
    });

    res.json({ success: true, order });
  })
);

// Customer: fitting ready → book fitting, request delivery, or alteration
router.post(
  "/:id/fitting-decision",
  protect,
  asyncHandler(async (req, res) => {
    const { decision } = req.body; // studio_fitting | request_delivery | request_alteration
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Forbidden");
    }
    if (order.orderStatus !== "fitting_ready") {
      res.status(400);
      throw new Error("Fitting options are only available when fitting is ready");
    }

    if (decision === "request_delivery" || decision === "studio_fitting") {
      order.orderStatus = "ready_to_ship";
      order.tracking.push({
        status: "ready_to_ship",
        note:
          decision === "studio_fitting"
            ? "Customer will book studio fitting; marked ready for dispatch after fitting"
            : "Customer requested delivery",
      });
      await order.save();
      await notifyUser(order.user, {
        title: decision === "studio_fitting" ? "Studio fitting noted" : "Delivery requested",
        message: `Order ${order.orderNumber} is moving to ready for dispatch.`,
        type: "order",
        link: `/orders/${order._id}`,
      });
      return res.json(order);
    }

    if (decision === "request_alteration") {
      order.orderStatus = "alteration_requested";
      order.tracking.push({ status: "alteration_requested", note: "Customer requested alteration" });
      await order.save();
      return res.json(order);
    }

    res.status(400);
    throw new Error("Invalid decision");
  })
);

router.post(
  "/:id/alteration",
  protect,
  asyncHandler(async (req, res) => {
    const { issues, notes, photos } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Forbidden");
    }
    const allowed = ["fitting_ready", "delivered", "alteration_requested", "quality_check"];
    if (!allowed.includes(order.orderStatus)) {
      res.status(400);
      throw new Error("Alterations are not available for this order stage");
    }
    if (!issues?.length && !notes?.trim()) {
      res.status(400);
      throw new Error("Describe the alteration needed");
    }

    order.alterationRequests.push({
      issues: issues || [],
      notes: notes || "",
      photos: photos || [],
      status: "open",
    });
    order.orderStatus = "alteration_requested";
    order.tracking.push({
      status: "alteration_requested",
      note: notes || `Alteration: ${(issues || []).join(", ")}`,
    });
    await order.save();

    await notifyUser(order.user, {
      title: "Alteration requested",
      message: `We received your alteration request for ${order.orderNumber}.`,
      type: "alteration",
      link: `/orders/${order._id}`,
    });

    res.json(order);
  })
);

export default router;
