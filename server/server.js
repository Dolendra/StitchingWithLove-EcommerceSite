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
import measurementRoutes from "./routes/measurementRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import Order from "./models/Order.js";

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_BASE_URL,
  "https://stitching-with-love-ecommerce-site.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // allow preview deployments; tighten in production if needed
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.send("Stitching With Love API");
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);

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

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const THIRTY_MIN_MS = 30 * 60 * 1000;
setInterval(async () => {
  try {
    const cutoff = new Date(Date.now() - THIRTY_MIN_MS);
    const res = await Order.updateMany(
      { paymentStatus: "pending", createdAt: { $lt: cutoff } },
      { $set: { paymentStatus: "cancelled", orderStatus: "cancelled" } }
    );
    if (res.modifiedCount) {
      console.log(`Auto-cancelled ${res.modifiedCount} pending orders`);
    }
  } catch (e) {
    console.error("Auto-cancel job failed:", e.message);
  }
}, 5 * 60 * 1000);
