import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import asyncHandler from "express-async-handler";
import Appointment from "../models/Appointment.js";

const router = express.Router();

router.post("/", protect, asyncHandler(async (req, res) => {
  const { message, phone } = req.body;
  const appt = await Appointment.create({ user: req.user._id, message, phone });
  res.status(201).json(appt);
}));

export default router;

// Admin: list appointments
router.get("/admin/list", protect, admin, asyncHandler(async (req, res) => {
  const list = await Appointment.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(list);
}));

// Admin: update appointment status
router.post("/:id/status", protect, admin, asyncHandler(async (req, res) => {
  const { status } = req.body; // pending | confirmed
  const appt = await Appointment.findById(req.params.id);
  if (!appt) { res.status(404); throw new Error('Appointment not found'); }
  appt.status = status || appt.status;
  await appt.save();
  res.json(appt);
}));
