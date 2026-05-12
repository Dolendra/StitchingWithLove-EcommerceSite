import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) { res.status(400); throw new Error("All fields are required"); }

  const userExists = await User.findOne({ email });
  if (userExists) { res.status(400); throw new Error("User already exists"); }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const user = await User.create({ name, email, passwordHash });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

// Login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) { res.status(401); throw new Error("Invalid credentials"); }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) { res.status(401); throw new Error("Invalid credentials"); }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});
