import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getCart, addToCart, updateCartItem, clearCart } from "../controllers/cartController.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/update", protect, updateCartItem);
router.delete("/", protect, clearCart);

export default router;
