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

  // Save cart to localStorage whenever it changes (guarded: photos can be large)
  useEffect(() => {
    if (!cartReady) return;
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartItems));
    } catch {
      // Quota exceeded (e.g. a large custom photo) — keep the in-memory cart.
    }
  }, [cartItems, cartReady]);

  // options: { customImage, customizationValues, unitPrice }. A legacy string
  // 3rd arg is treated as customImage for back-compat.
  const addToCart = async (product, quantity = 1, options = {}) => {
    if (!product?.id) throw new Error('Invalid product');
    const opts = typeof options === 'string' ? { customImage: options } : (options || {});
    const { customImage = null, customizationValues = null, unitPrice = null } = opts;
    try {
      setCartItems(prev => {
        // Non-customised lines merge by product; customised lines stay separate.
        if (!customizationValues) {
          const existing = prev.find(item => item.product_id === product.id && !item.customization_values);
          if (existing) {
            return prev.map(item =>
              item === existing ? { ...item, quantity: item.quantity + quantity } : item
            );
          }
        }
        const line = {
          id: `ci_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          product_id: product.id,
          product,
          quantity,
          custom_image: customImage,
          customization_values: customizationValues,
          unit_price: unitPrice,
        };
        return [...prev, line];
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

  const SHIPPING_COST = 50; // flat shipping on every order (never free)

  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => {
    const price = item.unit_price ?? item.product?.price ?? item.price ?? 0;
    return sum + price * item.quantity;
  }, 0), [cartItems]);

  const shippingCost = SHIPPING_COST; // always ₹50

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
