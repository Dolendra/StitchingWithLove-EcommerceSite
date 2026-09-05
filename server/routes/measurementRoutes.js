import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import asyncHandler from "express-async-handler";
import Measurement, { MEASUREMENT_FIELDS, GARMENT_TYPES } from "../models/Measurement.js";
import { validateMeasurements, MEASUREMENT_RANGES } from "../utils/measurementValidation.js";

const router = express.Router();

router.get(
  "/fields",
  protect,
  asyncHandler(async (_req, res) => {
    res.json({ garmentTypes: GARMENT_TYPES, fields: MEASUREMENT_FIELDS, ranges: MEASUREMENT_RANGES });
  })
);

router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const profiles = await Measurement.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(profiles);
  })
);

router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { name, garmentType, unit, values, notes } = req.body;
    if (!name || !garmentType) {
      res.status(400);
      throw new Error("Name and garment type are required");
    }
    if (!GARMENT_TYPES.includes(garmentType)) {
      res.status(400);
      throw new Error("Invalid garment type");
    }
    const check = validateMeasurements(values || {}, unit || "inches");
    if (!check.ok) {
      res.status(422);
      throw new Error(check.issues[0] || "Invalid measurements");
    }
    const profile = await Measurement.create({
      user: req.user._id,
      name,
      garmentType,
      unit: unit || "inches",
      values: check.normalized,
      notes,
    });
    res.status(201).json(profile);
  })
);

router.put(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const profile = await Measurement.findById(req.params.id);
    if (!profile) {
      res.status(404);
      throw new Error("Profile not found");
    }
    if (profile.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Forbidden");
    }
    const { name, garmentType, unit, values, notes } = req.body;
    if (name) profile.name = name;
    if (garmentType) profile.garmentType = garmentType;
    if (unit) profile.unit = unit;
    if (values) {
      const check = validateMeasurements(values, unit || profile.unit || "inches");
      if (!check.ok) {
        res.status(422);
        throw new Error(check.issues[0] || "Invalid measurements");
      }
      profile.values = check.normalized;
    }
    if (notes != null) profile.notes = notes;
    await profile.save();
    res.json(profile);
  })
);

router.post(
  "/:id/duplicate",
  protect,
  asyncHandler(async (req, res) => {
    const profile = await Measurement.findById(req.params.id);
    if (!profile) {
      res.status(404);
      throw new Error("Profile not found");
    }
    if (profile.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Forbidden");
    }
    const copy = await Measurement.create({
      user: req.user._id,
      name: `${profile.name} (copy)`,
      garmentType: profile.garmentType,
      unit: profile.unit,
      values: profile.values,
      notes: profile.notes,
    });
    res.status(201).json(copy);
  })
);

router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const profile = await Measurement.findById(req.params.id);
    if (!profile) {
      res.status(404);
      throw new Error("Profile not found");
    }
    if (profile.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Forbidden");
    }
    await profile.deleteOne();
    res.json({ success: true });
  })
);

export default router;
