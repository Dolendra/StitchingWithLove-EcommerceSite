import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";
import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const router = express.Router();

router.get(
  "/product/:productId",
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  })
);

router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { productId, orderId, rating, fitRating, qualityRating, deliveryRating, text, photos } =
      req.body;
    if (!productId || !rating) {
      res.status(400);
      throw new Error("Product and rating are required");
    }

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order || order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Order not found for this user");
      }
      if (order.orderStatus !== "delivered") {
        res.status(400);
        throw new Error("You can review after delivery");
      }
    }

    const review = await Review.findOneAndUpdate(
      { user: req.user._id, product: productId },
      {
        user: req.user._id,
        product: productId,
        order: orderId || undefined,
        rating,
        fitRating,
        qualityRating,
        deliveryRating,
        text: text || "",
        photos: photos || [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$product",
          avg: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats[0]) {
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].avg * 10) / 10,
        reviewCount: stats[0].count,
      });
    }

    res.status(201).json(review);
  })
);

export default router;
