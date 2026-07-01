import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

export const CartContext = createContext(null);

const LOCAL_CART_KEY = 'printmymemory_cart';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartReady, setCartReady] = useState(false);

  // Load cart from localStorage only
  const loadCart = useCallback(() => {
    setLoading(true);
    try {
      const local = localStorage.getItem(LOCAL_CART_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) setCartItems(parsed);
      }
    } catch {
      localStorage.removeItem(LOCAL_CART_KEY);
    } finally {
      setLoading(false);
      setCartReady(true);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartReady) {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, cartReady]);

  const addToCart = async (product, quantity = 1, customImage = null) => {
    if (!product?.id) throw new Error('Invalid product');
    try {
      setCartItems(prev => {
        const existing = prev.find(item => item.product_id === product.id);
        if (existing) {
          return prev.map(item =>
            item.product_id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product_id: product.id, product, quantity, custom_image: customImage }];
      });
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart');
      throw err;
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId && item.product_id !== itemId));
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        (item.id === itemId || item.product_id === itemId) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem(LOCAL_CART_KEY);
  };

  const SHIPPING_THRESHOLD = 999;
  const SHIPPING_COST = 50;

  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    return sum + price * item.quantity;
  }, 0), [cartItems]);

  const shippingCost = useMemo(() => cartTotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST, [cartTotal]);

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

  const value = {
    cartItems,
    loading,
    cartTotal,
    shippingCost,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
