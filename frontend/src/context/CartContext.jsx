import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { cartAPI } from "../services/api";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: action.payload };
    case "ADD_ITEM": {
      const itemId = action.payload._id || action.payload.id;
      const size = action.payload.size || "";
      const meas = action.payload.measurementProfile || "";
      const existingItem = state.items.find(
        (item) =>
          (item._id || item.id) === itemId &&
          (item.size || "") === size &&
          String(item.measurementProfile || "") === String(meas)
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            (item._id || item.id) === itemId &&
            (item.size || "") === size &&
            String(item.measurementProfile || "") === String(meas)
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => {
          const id = item._id || item.id;
          if (typeof action.payload === "object") {
            return !(
              id === action.payload.id &&
              (item.size || "") === (action.payload.size || "") &&
              String(item.measurementProfile || "") === String(action.payload.measurementProfile || "")
            );
          }
          return id !== action.payload;
        }),
      };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) => {
          const id = item._id || item.id;
          const match =
            id === action.payload.id &&
            (item.size || "") === (action.payload.size || "") &&
            String(item.measurementProfile || "") === String(action.payload.measurementProfile || "");
          return match ? { ...item, quantity: action.payload.quantity } : item;
        }),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    default:
      return state;
  }
};

const mapServerItems = (items) =>
  (items || []).map((i) => ({
    id: i.product?._id || i.product || i.productId,
    _id: i.product?._id || i.product,
    name: i.product?.name || i.name,
    price: i.product?.salePrice ?? i.product?.price ?? i.price ?? 0,
    image: i.product?.image || i.product?.images?.[0],
    quantity: i.quantity,
    size: i.size,
    customization: i.customization,
    measurementProfile: i.measurementProfile?._id || i.measurementProfile,
    measurementSnapshot: i.measurementSnapshot
      ? {
          ...i.measurementSnapshot,
          values:
            i.measurementSnapshot.values instanceof Map
              ? Object.fromEntries(i.measurementSnapshot.values)
              : i.measurementSnapshot.values,
        }
      : undefined,
    customerNotes: i.customerNotes,
    stitchingPrice: i.stitchingPrice || 0,
  }));

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const storageKey = user ? `cart_${user.id || user._id}` : "cart_guest";
  const [state, dispatch] = useReducer(cartReducer, {
    items: JSON.parse(localStorage.getItem(storageKey) || "[]"),
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state.items));
  }, [state.items, storageKey]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await cartAPI.get();
        dispatch({ type: "SET_ITEMS", payload: mapServerItems(res.data?.items) });
      } catch {
        /* keep local */
      }
    };
    fetchCart();
  }, [isAuthenticated, user?._id]);

  const addToCart = async (product, quantity = 1) => {
    const prev = state.items;
    const payload = {
      ...product,
      quantity,
      size: product.size,
      customization: product.customization,
      measurementProfile: product.measurementProfile,
      measurementSnapshot: product.measurementSnapshot,
      customerNotes: product.customerNotes,
      stitchingPrice: product.stitchingPrice || 0,
    };
    dispatch({ type: "ADD_ITEM", payload });
    if (isAuthenticated) {
      try {
        await cartAPI.add(product._id || product.id, quantity, {
          size: product.size,
          customization: product.customization,
          measurementProfile: product.measurementProfile,
          measurementSnapshot: product.measurementSnapshot,
          customerNotes: product.customerNotes,
          stitchingPrice: product.stitchingPrice || 0,
        });
      } catch (e) {
        dispatch({ type: "SET_ITEMS", payload: prev });
        throw e;
      }
    }
  };

  const removeFromCart = async (productId, meta = {}) => {
    const prev = state.items;
    dispatch({ type: "REMOVE_ITEM", payload: { id: productId, ...meta } });
    if (isAuthenticated) {
      try {
        await cartAPI.update(productId, 0, meta);
      } catch (e) {
        dispatch({ type: "SET_ITEMS", payload: prev });
        throw e;
      }
    }
  };

  const updateQuantity = async (productId, quantity, meta = {}) => {
    if (quantity < 1) return;
    const prev = state.items;
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: productId, quantity, ...meta } });
    if (isAuthenticated) {
      try {
        await cartAPI.update(productId, quantity, meta);
      } catch (e) {
        dispatch({ type: "SET_ITEMS", payload: prev });
        throw e;
      }
    }
  };

  const clearCart = async () => {
    dispatch({ type: "CLEAR_CART" });
    if (isAuthenticated) {
      try {
        await cartAPI.clear();
      } catch {
        /* local already cleared */
      }
    }
  };

  const getTotal = () =>
    state.items.reduce(
      (total, item) => total + (item.price + (item.stitchingPrice || 0)) * item.quantity,
      0
    );

  const getItemCount = () => state.items.reduce((count, item) => count + item.quantity, 0);

  const shippingEstimate = () => (getTotal() >= 2000 ? 0 : 99);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        shippingEstimate,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
