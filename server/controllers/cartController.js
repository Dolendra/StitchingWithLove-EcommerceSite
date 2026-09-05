import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product")
    .populate("items.measurementProfile");
  res.json(cart || { items: [] });
});

export const addToCart = asyncHandler(async (req, res) => {
  const {
    productId,
    quantity = 1,
    size,
    customization,
    measurementProfile,
    measurementSnapshot,
    customerNotes,
    stitchingPrice,
  } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("productId required");
  }

  let cart = await Cart.findOne({ user: req.user._id });
  const payload = {
    product: productId,
    quantity,
    size,
    customization,
    measurementProfile: measurementProfile || undefined,
    measurementSnapshot,
    customerNotes,
    stitchingPrice: stitchingPrice || 0,
  };

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [payload] });
    return res.status(201).json(await cart.populate("items.product"));
  }

  // Same product + same size + same measurement = merge qty; else new line
  const itemIndex = cart.items.findIndex((i) => {
    const sameProduct = i.product.toString() === productId;
    const sameSize = (i.size || "") === (size || "");
    const sameMeas =
      String(i.measurementProfile || "") === String(measurementProfile || "");
    return sameProduct && sameSize && sameMeas;
  });

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push(payload);
  }
  await cart.save();
  res.json(await cart.populate("items.product"));
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity, size, measurementProfile } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const itemIndex = cart.items.findIndex((i) => {
    const sameProduct = i.product.toString() === productId;
    if (size != null || measurementProfile != null) {
      return (
        sameProduct &&
        (i.size || "") === (size || "") &&
        String(i.measurementProfile || "") === String(measurementProfile || "")
      );
    }
    return sameProduct;
  });
  if (itemIndex === -1) {
    res.status(404);
    throw new Error("Item not found");
  }

  if (quantity <= 0) cart.items.splice(itemIndex, 1);
  else cart.items[itemIndex].quantity = quantity;

  await cart.save();
  res.json(await cart.populate("items.product"));
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.json({ items: [] });
});
