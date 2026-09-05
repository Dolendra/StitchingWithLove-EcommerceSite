/**
 * Seed a clean demo customer + admin + sample catalog for portfolio demos.
 * Usage (from server/): node scripts/seedDemo.js
 *
 * Demo customer: demo@stitchingwithlove.in / Demo1234!
 * Admin:         admin@stitchingwithlove.in / Admin1234!
 */
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Measurement from "../models/Measurement.js";
import Order from "../models/Order.js";
import Wishlist from "../models/Wishlist.js";
import { nextOrderNumber } from "../utils/orderNumber.js";

dotenv.config();
await connectDB();

const DEMO_EMAIL = "demo@stitchingwithlove.in";
const DEMO_PASS = "Demo1234!";
const ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL || "admin@stitchingwithlove.in";
const ADMIN_PASS = process.env.DEMO_ADMIN_PASSWORD || "Admin1234!";

const products = [
  {
    name: "Designer Blouse",
    description: "Hand-finished blouse with custom neck and sleeve options.",
    price: 1899,
    category: "blouse",
    fabric: "Silk",
    colors: ["Wine", "Ivory"],
    sizes: ["XS", "S", "M", "L", "XL"],
    customizable: true,
    measurementRequired: true,
    productType: "made_to_measure",
    stock: 25,
    featured: true,
    image: "/images/ethnicwear.webp",
    images: ["/images/ethnicwear.webp"],
    tags: ["blouse", "festive"],
    occasion: ["Festive", "Bridal"],
  },
  {
    name: "Party Dress",
    description: "Occasion dress with elegant drape.",
    price: 2999,
    category: "dress",
    fabric: "Georgette",
    productType: "ready_made",
    stock: 8,
    featured: true,
    image: "/images/partywear.webp",
    images: ["/images/partywear.webp"],
    occasion: ["Party"],
  },
  {
    name: "Bridal Blouse",
    description: "Premium bridal blouse with embroidery options.",
    price: 4999,
    category: "blouse",
    fabric: "Silk",
    productType: "made_to_measure",
    stock: 10,
    featured: true,
    image: "/images/bridal.avif",
    images: ["/images/bridal.avif"],
    occasion: ["Bridal"],
    customizable: true,
  },
];

try {
  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    admin = await User.create({
      name: "Studio Admin",
      email: ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(ADMIN_PASS, 10),
      phone: "9876543210",
      role: "admin",
    });
    console.log("Created admin");
  } else if (admin.role !== "admin") {
    admin.role = "admin";
    await admin.save();
    console.log("Promoted existing user to admin");
  } else {
    console.log("Admin already exists");
  }

  let user = await User.findOne({ email: DEMO_EMAIL });
  if (!user) {
    const passwordHash = await bcrypt.hash(DEMO_PASS, 10);
    user = await User.create({
      name: "Demo Customer",
      email: DEMO_EMAIL,
      passwordHash,
      phone: "9876543210",
      role: "user",
    });
    console.log("Created demo customer");
  } else {
    console.log("Demo customer already exists");
  }

  for (const p of products) {
    const existing = await Product.findOne({ name: p.name });
    if (!existing) {
      await Product.create(p);
      console.log("Product:", p.name);
    }
  }

  let profile = await Measurement.findOne({ user: user._id, name: "Wedding Blouse" });
  if (!profile) {
    profile = await Measurement.create({
      user: user._id,
      name: "Wedding Blouse",
      garmentType: "blouse",
      unit: "inches",
      values: {
        shoulder: 14,
        bust: 34,
        underBust: 30,
        waist: 28,
        blouseLength: 15,
        sleeveLength: 17,
        armhole: 16,
        frontNeckDepth: 3,
        backNeckDepth: 4,
      },
    });
    console.log("Created measurement profile");
  }

  const blouse = await Product.findOne({ name: "Designer Blouse" });
  if (blouse) {
    await Wishlist.findOneAndUpdate(
      { user: user._id },
      { $addToSet: { products: blouse._id } },
      { upsert: true }
    );
  }

  const hasDelivered = await Order.findOne({
    user: user._id,
    orderStatus: "delivered",
    paymentStatus: "paid",
  });
  if (!hasDelivered && blouse) {
    const snapshot = {
      profileName: profile.name,
      garmentType: profile.garmentType,
      unit: "inches",
      values: {
        shoulder: 14,
        bust: 34,
        underBust: 30,
        waist: 28,
        blouseLength: 15,
        sleeveLength: 17,
        armhole: 16,
        frontNeckDepth: 3,
        backNeckDepth: 4,
      },
    };
    await Order.create({
      orderNumber: await nextOrderNumber(),
      user: user._id,
      items: [
        {
          product: blouse._id,
          productId: String(blouse._id),
          name: blouse.name,
          price: blouse.price,
          quantity: 1,
          customization: { embroidery: "Light", lining: "Yes", size: "Custom" },
          measurementProfile: profile._id,
          measurementSnapshot: snapshot,
          customerNotes: "Keep neckline slightly higher",
          finalPrice: blouse.price,
        },
      ],
      subtotal: blouse.price,
      shippingFee: 0,
      totalAmount: blouse.price,
      paymentStatus: "paid",
      orderStatus: "delivered",
      shippingAddress: {
        name: "Demo Customer",
        phone: "9876543210",
        addressLine1: "12 Studio Lane",
        city: "Hyderabad",
        state: "Telangana",
        postalCode: "500001",
      },
      tracking: [
        { status: "placed", note: "Payment confirmed", visibility: "customer" },
        { status: "stitching", note: "Your outfit has entered stitching", visibility: "customer" },
        { status: "delivered", note: "Delivered", visibility: "customer" },
        { status: "delivered", note: "QC sleeve check done", visibility: "internal" },
      ],
    });
    console.log("Created delivered demo order");
  }

  const hasActive = await Order.findOne({
    user: user._id,
    paymentStatus: "paid",
    orderStatus: { $nin: ["delivered", "cancelled"] },
  });
  if (!hasActive && blouse) {
    await Order.create({
      orderNumber: await nextOrderNumber(),
      user: user._id,
      items: [
        {
          product: blouse._id,
          productId: String(blouse._id),
          name: blouse.name,
          price: blouse.price,
          quantity: 1,
          customization: { embroidery: "Premium", lining: "Yes", size: "Custom" },
          measurementProfile: profile._id,
          measurementSnapshot: {
            profileName: profile.name,
            garmentType: "blouse",
            unit: "inches",
            values: { bust: 34, waist: 28, shoulder: 14 },
          },
          finalPrice: blouse.price,
        },
      ],
      subtotal: blouse.price,
      shippingFee: 0,
      totalAmount: blouse.price,
      paymentStatus: "paid",
      orderStatus: "stitching",
      estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      shippingAddress: {
        name: "Demo Customer",
        phone: "9876543210",
        addressLine1: "12 Studio Lane",
        city: "Hyderabad",
        state: "Telangana",
        postalCode: "500001",
      },
      tracking: [
        { status: "placed", note: "Payment confirmed", visibility: "customer" },
        { status: "measurement_confirmed", note: "Measurements confirmed", visibility: "customer" },
        { status: "stitching", note: "Your outfit has entered stitching", visibility: "customer" },
      ],
    });
    console.log("Created active stitching order");
  }

  console.log("\nDemo ready:");
  console.log(`  Customer: ${DEMO_EMAIL} / ${DEMO_PASS}`);
  console.log(`  Admin:    ${ADMIN_EMAIL} / ${ADMIN_PASS}`);
  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}
