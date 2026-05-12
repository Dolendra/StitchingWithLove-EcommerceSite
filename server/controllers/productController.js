import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";

export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }
  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, stock } = req.body;
  const product = await Product.create({ name, description, price, image, stock });
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const updates = req.body;
  const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!product) { res.status(404); throw new Error("Product not found"); }
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }
  res.json({ success: true });
});
