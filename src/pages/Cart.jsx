import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { openRazorpayCheckout, createOrder } from '../lib/razorpay';
import { supabase, TABLES } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function Cart() {
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to checkout');
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setCheckingOut(true);
    try {
      const orderDetails = await createOrder(cartTotal, cartItems, user);
      
      await openRazorpayCheckout(
        orderDetails,
        user,
        async (response) => {
          // Payment success - save order to Supabase
          const { data: orderData, error: orderError } = await supabase
            .from(TABLES.ORDERS)
            .insert({
              user_id: user.id,
              total_amount: cartTotal,
              status: 'paid',
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              shipping_address: user?.user_metadata || {},
            })
            .select()
            .single();

          if (orderError) throw orderError;

          // Save order items
          const orderItems = cartItems.map(item => ({
            order_id: orderData.id,
            product_id: item.product_id || item.product?.id,
            quantity: item.quantity,
            price: item.product?.price || item.price || 0,
          }));

          await supabase.from(TABLES.ORDER_ITEMS).insert(orderItems);
          await clearCart();
          toast.success('Order placed successfully!');
          navigate('/orders');
        },
        (error) => {
          toast.error(error.message || 'Payment failed');
        }
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="py-16 sm:py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-bg-card rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-text-muted" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Your cart is empty</h2>
          <p className="text-text-secondary text-sm mb-6">Add some amazing 3D gifts to get started!</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Browse Products <ArrowRight size={16} />
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Shopping Cart ({cartCount})</h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => {
              const product = item.product || item;
              const price = product.price || 0;
              return (
                <motion.div
                  key={item.id || item.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-bg-card border border-border-subtle rounded-xl p-4 flex gap-4"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-bg-secondary shrink-0">
                    <img
                      src={product.image || '/images/model1.jpeg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-text-primary font-semibold text-sm truncate">{product.name}</h3>
                    <p className="text-accent font-bold mt-1">₹{price}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id || item.product_id, item.quantity - 1)}
                        className="w-7 h-7 bg-bg-secondary border border-border-subtle rounded-md flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-text-primary text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id || item.product_id, item.quantity + 1)}
                        className="w-7 h-7 bg-bg-secondary border border-border-subtle rounded-md flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id || item.product_id)}
                    className="text-text-muted hover:text-red-400 transition-colors self-start"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-bg-card border border-border-subtle rounded-xl p-6 h-fit"
          >
            <h2 className="text-lg font-bold text-text-primary mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text-primary">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Shipping</span>
                <span className="text-success">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Discount</span>
                <span className="text-accent">-₹0</span>
              </div>
            </div>
            <div className="border-t border-border-subtle pt-4 mb-4">
              <div className="flex justify-between">
                <span className="text-text-primary font-semibold">Total</span>
                <span className="text-accent font-bold text-xl">₹{cartTotal}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {checkingOut ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              Proceed to Checkout
            </button>
            <p className="text-text-muted text-xs text-center mt-3">
              Secured by Razorpay. Cash on delivery also available.
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
