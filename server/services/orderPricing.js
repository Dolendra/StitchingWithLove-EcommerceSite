import Product from "../models/Product.js";

function cloneSnapshot(snapshot) {
  if (!snapshot) return undefined;
  const values =
    snapshot.values instanceof Map
      ? Object.fromEntries(snapshot.values)
      : snapshot.values && typeof snapshot.values === "object"
      ? { ...snapshot.values }
      : {};
  return {
    profileName: snapshot.profileName,
    garmentType: snapshot.garmentType,
    unit: snapshot.unit || "inches",
    values,
  };
}

/**
 * Recalculate order totals from DB product prices — never trust client totals.
 * Measurement snapshots are deep-copied so later profile edits cannot rewrite history.
 */
export async function calculateOrderTotals(items = [], options = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    throw Object.assign(new Error("Cart is empty"), { status: 400 });
  }

  const pricedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const productId = item.productId || item.product || item._id || item.id;
    if (!productId) {
      throw Object.assign(new Error("Invalid product in cart"), { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product || product.active === false) {
      throw Object.assign(new Error(`Product not found: ${item.name || productId}`), { status: 404 });
    }

    const qty = Math.max(1, Number(item.quantity) || 1);
    const isReadyMade =
      !product.productType || product.productType === "ready_made";

    if (isReadyMade && typeof product.stock === "number") {
      if (product.stock <= 0) {
        throw Object.assign(new Error(`${product.name} is out of stock`), { status: 400 });
      }
      if (product.stock < qty) {
        throw Object.assign(
          new Error(`Insufficient stock for ${product.name} (only ${product.stock} left)`),
          { status: 400 }
        );
      }
    }

    const unitPrice = product.salePrice != null ? product.salePrice : product.price;
    const stitchingPrice = Number(item.stitchingPrice) || 0;
    const lineTotal = (unitPrice + stitchingPrice) * qty;
    subtotal += lineTotal;

    pricedItems.push({
      product: product._id,
      productId: String(product._id),
      name: product.name,
      basePrice: product.price,
      price: unitPrice,
      quantity: qty,
      variant: item.variant || {},
      customization: item.customization ? { ...item.customization } : {},
      measurementProfile: item.measurementProfile || undefined,
      measurementSnapshot: cloneSnapshot(item.measurementSnapshot),
      referenceImages: [...(item.referenceImages || [])],
      customerNotes: item.customerNotes || item.notes || "",
      stitchingPrice,
      finalPrice: lineTotal,
    });
  }

  const shippingFee =
    options.shippingFee != null ? Number(options.shippingFee) : subtotal >= 2000 ? 0 : 99;
  const discount = Number(options.discount) || 0;
  const totalAmount = Math.max(0, subtotal + shippingFee - discount);

  return { items: pricedItems, subtotal, shippingFee, discount, totalAmount };
}
