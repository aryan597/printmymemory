import { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { supabase, TABLES } from '../lib/supabaseClient';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

export const CartContext = createContext(null);

const LOCAL_CART_KEY = 'printmymemory_cart';

export function CartProvider({ children }) {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartReady, setCartReady] = useState(false);

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
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) setCartItems(parsed);
          } catch (_) {
            localStorage.removeItem(LOCAL_CART_KEY);
          }
        }
      }
    } catch (err) {
      console.error('Error loading cart:', err);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
      setCartReady(true);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!authLoading) {
      loadCart();
    }
  }, [loadCart, authLoading]);

  // Save local cart when not authenticated
  useEffect(() => {
    if (!isAuthenticated && cartReady) {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated, cartReady]);

  const addToCart = async (product, quantity = 1, customImage = null) => {
    if (!product?.id) throw new Error('Invalid product');
    try {
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
          const payload = {
            user_id: user.id,
            product_id: product.id,
            quantity,
          };
          if (customImage) payload.custom_image = customImage;
          const { data, error } = await supabase
            .from(TABLES.CART_ITEMS)
            .insert(payload)
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
          return [...prev, { product_id: product.id, product, quantity, custom_image: customImage }];
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart');
      throw err;
    }
  };

  const removeFromCart = async (itemId) => {
    const previousItems = [...cartItems];
    // Optimistic update for guest; auth will rollback on failure
    if (!isAuthenticated) {
      setCartItems(prev => prev.filter(item => item.id !== itemId && item.product_id !== itemId));
      return;
    }
    setCartItems(prev => prev.filter(item => item.id !== itemId && item.product_id !== itemId));
    try {
      if (isAuthenticated && user) {
        const { error } = await supabase.from(TABLES.CART_ITEMS).delete().eq('id', itemId);
        if (error) throw error;
      }
    } catch (err) {
      setCartItems(previousItems);
      toast.error(err.message || 'Failed to remove item');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    const previousItems = [...cartItems];
    if (!isAuthenticated) {
      setCartItems(prev =>
        prev.map(item =>
          (item.id === itemId || item.product_id === itemId) ? { ...item, quantity } : item
        )
      );
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        (item.id === itemId || item.product_id === itemId) ? { ...item, quantity } : item
      )
    );
    try {
      if (isAuthenticated && user) {
        const { error } = await supabase
          .from(TABLES.CART_ITEMS)
          .update({ quantity })
          .eq('id', itemId);
        if (error) throw error;
      }
    } catch (err) {
      setCartItems(previousItems);
      toast.error(err.message || 'Failed to update quantity');
    }
  };

  const clearCart = async () => {
    const previousItems = [...cartItems];
    if (!isAuthenticated) {
      setCartItems([]);
      localStorage.removeItem(LOCAL_CART_KEY);
      return;
    }
    setCartItems([]);
    localStorage.removeItem(LOCAL_CART_KEY);
    try {
      if (isAuthenticated && user) {
        const { error } = await supabase.from(TABLES.CART_ITEMS).delete().eq('user_id', user.id);
        if (error) throw error;
      }
    } catch (err) {
      setCartItems(previousItems);
      toast.error(err.message || 'Failed to clear cart');
    }
  };

  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    return sum + price * item.quantity;
  }, 0), [cartItems]);

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

  const migrateLocalCart = useCallback(async () => {
    const local = localStorage.getItem(LOCAL_CART_KEY);
    if (!local || !user) return;
    let localItems = [];
    try {
      localItems = JSON.parse(local);
      if (!Array.isArray(localItems)) return;
    } catch (_) {
      localStorage.removeItem(LOCAL_CART_KEY);
      return;
    }
    for (const item of localItems) {
      if (item.product) {
        try {
          await addToCart(item.product, item.quantity, item.custom_image);
        } catch (err) {
          console.error('Failed to migrate cart item:', err);
        }
      }
    }
    localStorage.removeItem(LOCAL_CART_KEY);
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user && cartReady) {
      migrateLocalCart();
    }
  }, [isAuthenticated, user, cartReady, migrateLocalCart]);

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
