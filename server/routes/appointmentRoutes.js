import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import asyncHandler from "express-async-handler";
import Appointment from "../models/Appointment.js";
import { notifyUser } from "../services/notify.js";

const router = express.Router();

const SLOTS = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

router.get(
  "/slots",
  asyncHandler(async (req, res) => {
    const { date } = req.query;
    if (!date) {
      return res.json({ slots: SLOTS, booked: [] });
    }
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    const booked = await Appointment.find({
      preferredDate: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ["pending", "confirmed"] },
    }).select("preferredSlot");
    res.json({
      slots: SLOTS,
      booked: booked.map((b) => b.preferredSlot),
    });
  })
);

router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const {
      name,
      phone,
      email,
      service,
      purpose,
      preferredDate,
      preferredSlot,
      measurementRequired,
      designReference,
      referenceImages,
      message,
    } = req.body;

    if (!phone || !preferredDate) {
      res.status(400);
      throw new Error("Phone and preferred date are required");
    }

    const appt = await Appointment.create({
      user: req.user._id,
      name: name || req.user.name,
      phone,
      email: email || req.user.email,
      service: service || "consultation",
      purpose,
      preferredDate,
      preferredSlot: preferredSlot || "10:00",
      measurementRequired: !!measurementRequired,
      designReference,
      referenceImages: referenceImages || [],
      message: message || purpose || "",
    });

    await notifyUser(req.user._id, {
      title: "Appointment requested",
      message: `Your ${appt.service} appointment is pending confirmation.`,
      type: "appointment",
      link: "/account",
    });

    res.status(201).json(appt);
  })
);

router.get(
  "/my",
  protect,
  asyncHandler(async (req, res) => {
    const list = await Appointment.find({ user: req.user._id }).sort({ preferredDate: -1 });
    res.json(list);
  })
);

router.get(
  "/admin/list",
  protect,
  admin,
  asyncHandler(async (_req, res) => {
    const list = await Appointment.find()
      .populate("user", "name email phone")
      .sort({ preferredDate: -1 });
    res.json(list);
  })
);

router.post(
  "/:id/status",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { status, adminNote } = req.body;
    const appt = await Appointment.findById(req.params.id);
    if (!appt) {
      res.status(404);
      throw new Error("Appointment not found");
    }
    if (status) appt.status = status;
    if (adminNote != null) appt.adminNote = adminNote;
    await appt.save();

    if (appt.user) {
      await notifyUser(appt.user, {
        title: "Appointment update",
        message: `Your appointment is now ${appt.status}.`,
        type: "appointment",
        link: "/account",
      });
    }

    res.json(appt);
  })
);

export default router;
