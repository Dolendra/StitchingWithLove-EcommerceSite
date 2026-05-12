import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import paymentsRoutes from "./routes/paymentsRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors({ 
  origin: [
    "http://localhost:5173", 
    "https://Stitchingwithlove.vercel.app/"
  ], 
  credentials: true 
}));
app.use(express.json()); // parse JSON bodies

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payments", paymentsRoutes);

// Serve frontend build in production (only for Render deployment)
if (process.env.NODE_ENV === "production" && process.env.SERVE_FRONTEND === "true") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const frontendDist = path.resolve(__dirname, "../frontend/dist");
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Auto-cancel pending orders older than 30 minutes (simple scheduler)
import Order from "./models/Order.js";
const THIRTY_MIN_MS = 30 * 60 * 1000;
setInterval(async () => {
  try {
    const cutoff = new Date(Date.now() - THIRTY_MIN_MS);
    const res = await Order.updateMany({ paymentStatus: "pending", createdAt: { $lt: cutoff } }, { $set: { paymentStatus: "cancelled" } });
    if (res.modifiedCount) {
      console.log(`Auto-cancelled ${res.modifiedCount} pending orders`);
    }
  } catch (e) {
    console.error("Auto-cancel job failed:", e.message);
  }
}, 5 * 60 * 1000); // run every 5 minutes
