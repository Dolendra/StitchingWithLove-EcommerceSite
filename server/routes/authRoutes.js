import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// profile
router.get("/profile", protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-passwordHash");
  res.json(user);
}));

export default router;
