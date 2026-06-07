import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { supabase, TABLES } from '../lib/supabaseClient';
import { AuthContext } from './AuthContext';

export const CartContext = createContext(null);

const LOCAL_CART_KEY = 'printmymemory_cart';

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart from localStorage or Supabase
  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated && user) {
        const { data, error } = await supabase
          .from(TABLES.CART_ITEMS)
          .select(`*, product:products(*)`)
          .eq('user_id', user.id);
        if (error) throw error;
        setCartItems(data || []);
      } else {
        const local = localStorage.getItem(LOCAL_CART_KEY);
        if (local) {
          setCartItems(JSON.parse(local));
        }
      }
    } catch (err) {
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Save local cart when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated && user) {
      const { data: existing } = await supabase
        .from(TABLES.CART_ITEMS)
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from(TABLES.CART_ITEMS)
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select(`*, product:products(*)`)
          .single();
        if (error) throw error;
        setCartItems(prev => prev.map(item => item.id === existing.id ? data : item));
      } else {
        const { data, error } = await supabase
          .from(TABLES.CART_ITEMS)
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity,
          })
          .select(`*, product:products(*)`)
          .single();
        if (error) throw error;
        setCartItems(prev => [...prev, data]);
      }
    } else {
      setCartItems(prev => {
        const existing = prev.find(item => item.product_id === product.id);
        if (existing) {
          return prev.map(item =>
            item.product_id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product_id: product.id, product, quantity }];
      });
    }
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated && user) {
      const { error } = await supabase.from(TABLES.CART_ITEMS).delete().eq('id', itemId);
      if (error) throw error;
    }
    setCartItems(prev => prev.filter(item => item.id !== itemId && item.product_id !== itemId));
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    if (isAuthenticated && user) {
      const { error } = await supabase
        .from(TABLES.CART_ITEMS)
        .update({ quantity })
        .eq('id', itemId);
      if (error) throw error;
    }
    setCartItems(prev =>
      prev.map(item =>
        (item.id === itemId || item.product_id === itemId) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    if (isAuthenticated && user) {
      const { error } = await supabase.from(TABLES.CART_ITEMS).delete().eq('user_id', user.id);
      if (error) throw error;
    }
    setCartItems([]);
    localStorage.removeItem(LOCAL_CART_KEY);
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const migrateLocalCart = useCallback(async () => {
    const local = localStorage.getItem(LOCAL_CART_KEY);
    if (!local || !user) return;
    const localItems = JSON.parse(local);
    for (const item of localItems) {
      await addToCart(item.product, item.quantity);
    }
    localStorage.removeItem(LOCAL_CART_KEY);
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      migrateLocalCart();
    }
  }, [isAuthenticated, user, migrateLocalCart]);

  const value = {
    cartItems,
    loading,
    cartTotal,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
