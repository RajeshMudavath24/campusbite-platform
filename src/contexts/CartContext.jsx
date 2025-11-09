import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  listenCart,
  addToCart as addToCartFs,
  removeCartItem,
  setCartItemQuantity,
} from '../utils/firestoreClient';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [requiredByTime, setRequiredByTime] = useState('');

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      return;
    }

    const unsubscribe = listenCart(user.uid, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCartItems(items);
    });

    return () => unsubscribe();
  }, [user]);

  const addToCart = async (item, quantity = 1) => {
    if (!user) return;
    await addToCartFs(user.uid, item, quantity);
  };

  const removeFromCart = async (itemId) => {
    if (!user) return;
    await removeCartItem(user.uid, itemId);
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!user) return;
    await setCartItemQuantity(user.uid, itemId, quantity);
  };

  const clearCart = () => {
    if (!user) return;
    cartItems.forEach(item => removeCartItem(user.uid, item.id));
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    requiredByTime,
    setRequiredByTime,
    getCartCount,
    getCartTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};