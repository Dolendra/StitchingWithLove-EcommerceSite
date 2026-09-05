import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";

const router = express.Router();

router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  })
);

router.post(
  "/read-all",
  protect,
  asyncHandler(async (req, res) => {
    await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
    res.json({ success: true });
  })
);

router.post(
  "/:id/read",
  protect,
  asyncHandler(async (req, res) => {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    res.json(n);
  })
);

export default router;
