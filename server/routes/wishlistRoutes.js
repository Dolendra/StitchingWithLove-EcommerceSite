import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import asyncHandler from "express-async-handler";
import Wishlist from "../models/Wishlist.js";

const router = express.Router();

router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    res.json(wishlist);
  })
);

router.post(
  "/toggle",
  protect,
  asyncHandler(async (req, res) => {
    const { productId } = req.body;
    if (!productId) {
      res.status(400);
      throw new Error("productId required");
    }
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
      return res.json({ added: true, wishlist: await wishlist.populate("products") });
    }
    const idx = wishlist.products.findIndex((p) => p.toString() === productId);
    if (idx >= 0) {
      wishlist.products.splice(idx, 1);
      await wishlist.save();
      return res.json({ added: false, wishlist: await wishlist.populate("products") });
    }
    wishlist.products.push(productId);
    await wishlist.save();
    res.json({ added: true, wishlist: await wishlist.populate("products") });
  })
);

export default router;
