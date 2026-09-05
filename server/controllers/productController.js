import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";

export const getProducts = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    fabric,
    color,
    occasion,
    productType,
    minPrice,
    maxPrice,
    featured,
    sort = "newest",
  } = req.query;

  const filter = { active: { $ne: false } };

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
      { fabric: { $regex: q, $options: "i" } },
    ];
  }
  if (category && category !== "all") filter.category = category;
  if (fabric) filter.fabric = { $regex: fabric, $options: "i" };
  if (color) filter.colors = { $regex: color, $options: "i" };
  if (occasion) filter.occasion = { $regex: occasion, $options: "i" };
  if (productType) filter.productType = productType;
  if (featured === "true") filter.featured = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let query = Product.find(filter);
  switch (sort) {
    case "price_asc":
      query = query.sort({ price: 1 });
      break;
    case "price_desc":
      query = query.sort({ price: -1 });
      break;
    case "popular":
      query = query.sort({ reviewCount: -1, rating: -1 });
      break;
    default:
      query = query.sort({ createdAt: -1 });
  }

  const products = await query;
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const body = req.body;
  const product = await Product.create({
    ...body,
    price: Number(body.price),
    stock: body.stock === "" || body.stock == null ? 0 : Number(body.stock),
    images: body.images || (body.image ? [body.image] : []),
  });
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (updates.price != null) updates.price = Number(updates.price);
  if (updates.stock != null) updates.stock = Number(updates.stock);
  const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true });
});
