import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI } from '../services/api';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const itemId = action.payload._id || action.payload.id;
      const existingItem = state.items.find(item => (item._id || item.id) === itemId);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            (item._id || item.id) === itemId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => (item._id || item.id) !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          (item._id || item.id) === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const storageKey = user ? `cart_${user.id || user._id}` : 'cart_guest';
  const [state, dispatch] = useReducer(cartReducer, {
    items: JSON.parse(localStorage.getItem(storageKey) || '[]'),
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state.items));
  }, [state.items, storageKey]);

  // Load user cart from backend on login
  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await cartAPI.get();
        const items = (res.data?.items || []).map(i => ({
          id: i.product?._id || i.product || i.productId,
          _id: i.product?._id,
          name: i.product?.name || i.name,
          price: i.product?.price || i.price || 0,
          image: i.product?.image,
          quantity: i.quantity,
        }));
        dispatch({ type: 'CLEAR_CART' });
        items.forEach(p => dispatch({ type: 'ADD_ITEM', payload: { ...p, quantity: p.quantity } }));
      } catch {}
    };
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?._id]);

  const addToCart = async (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
    if (isAuthenticated) {
      try { await cartAPI.add(product._id || product.id, 1); } catch {}
    }
  };

  const removeFromCart = async (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
    if (isAuthenticated) {
      try { await cartAPI.update(productId, 0); } catch {}
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    if (isAuthenticated) {
      try { await cartAPI.update(productId, quantity); } catch {}
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
