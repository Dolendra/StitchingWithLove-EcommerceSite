import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  res.json(cart || { items: [] });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [{ product: productId, quantity }] });
    return res.status(201).json(cart);
  }

  const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();
  res.json(cart);
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error("Cart not found"); }

  const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
  if (itemIndex === -1) { res.status(404); throw new Error("Item not found"); }

  if (quantity <= 0) cart.items.splice(itemIndex, 1);
  else cart.items[itemIndex].quantity = quantity;

  await cart.save();
  res.json(cart);
});
