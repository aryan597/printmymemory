import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Loader2, CreditCard, Banknote, MapPin, Home, Briefcase, PlusCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { openRazorpayCheckout } from '../lib/razorpay';
import { supabase, TABLES } from '../lib/supabaseClient';
import { sendOrderConfirmationEmail, getWhatsAppOrderLink } from '../lib/notifications';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

export default function Cart() {
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated, profile } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cod'
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressesLoading, setAddressesLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadAddresses();
  }, [user?.id]);

  const loadAddresses = async () => {
    setAddressesLoading(true);
    try {
      const { data } = await supabase
        .from(TABLES.ADDRESSES)
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      setAddresses(data || []);
      const defaultAddr = data?.find(a => a.is_default);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (data?.[0]) setSelectedAddressId(data[0].id);
    } catch (_) { /* ignore */ }
    finally { setAddressesLoading(false); }
  };

  const getSelectedAddress = () => addresses.find(a => a.id === selectedAddressId);

  const buildShippingAddress = () => {
    const addr = getSelectedAddress();
    if (addr) {
      return {
        full_name: addr.full_name || profile?.full_name || '',
        phone: addr.phone || profile?.phone || '',
        email: user?.email || '',
        address_line1: addr.address_line1,
        address_line2: addr.address_line2 || '',
        city: addr.city || '',
        state: addr.state || '',
        postcode: addr.postcode || '',
        label: addr.label || 'Home',
      };
    }
    return {
      full_name: profile?.full_name || user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: profile?.phone || user?.user_metadata?.phone || '',
      address_line1: '',
      city: '',
      state: '',
      postcode: '',
    };
  };

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

    if (!getSelectedAddress()) {
      toast.error('Please add a delivery address in your profile');
      navigate('/profile');
      return;
    }

    setCheckingOut(true);
    let orderId = null;

    try {
      // Step 1: Create order in Supabase first
      const { data: orderData, error: orderError } = await supabase
        .from(TABLES.ORDERS)
        .insert({
          user_id: user.id,
          total_amount: cartTotal,
          status: 'order_placed',
          payment_method: paymentMethod,
          shipping_address: buildShippingAddress(),
        })
        .select()
        .single();

      if (orderError) throw orderError;
      orderId = orderData.id;

      // Step 2: Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderId,
        product_id: item.product_id || item.product?.id || item.id,
        quantity: item.quantity,
        price: item.product?.price || item.price || 0,
      }));

      const { error: itemsError } = await supabase
        .from(TABLES.ORDER_ITEMS)
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Prepare shared data
      const hasCustomised = cartItems.some(
        item => item.product?.product_type === 'customised' || item.product_type === 'customised'
      );
      const customerEmail = user?.email || '';
      const customerName = profile?.full_name || user?.user_metadata?.full_name || '';

      // Step 3: COD — skip Razorpay
      if (paymentMethod === 'cod') {
        // Send confirmation email
        await sendOrderConfirmationEmail({
          to_email: customerEmail,
          to_name: customerName,
          order_id: orderId,
          total_amount: cartTotal,
          payment_method: 'cod',
          items: cartItems,
          delivery: buildShippingAddress(),
        });

        await clearCart();
        toast.success('Order placed! Pay ₹' + cartTotal + ' on delivery.');

        // Redirect customised orders to WhatsApp
        if (hasCustomised) {
          const waLink = getWhatsAppOrderLink({
            order_id: orderId,
            customer_name: customerName,
            product_name: cartItems.find(i => i.product?.product_type === 'customised' || i.product_type === 'customised')?.product?.name,
          });
          window.open(waLink, '_blank');
        }

        navigate('/orders');
        return;
      }

      // Step 3: Online — Open Razorpay checkout
      await openRazorpayCheckout(
        {
          amount: cartTotal,
          name: profile?.full_name || user?.user_metadata?.full_name || '',
          email: user?.email || '',
          phone: profile?.phone || user?.user_metadata?.phone || '',
          orderName: hasCustomised ? 'Customised 3D Printed Gift' : '3D Printed Gift',
        },
        // On success
        async (response) => {
          try {
            const { error: updateError } = await supabase
              .from(TABLES.ORDERS)
              .update({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature || null,
                razorpay_order_id: response.razorpay_order_id || null,
                status: 'order_placed',
                paid_at: new Date().toISOString(),
              })
              .eq('id', orderId);

            if (updateError) throw updateError;

            await clearCart();
            toast.success('Payment successful! Order placed.');

            // Send confirmation email
            await sendOrderConfirmationEmail({
              to_email: customerEmail,
              to_name: customerName,
              order_id: orderId,
              total_amount: cartTotal,
              payment_method: 'online',
              items: cartItems,
              delivery: buildShippingAddress(),
            });

            // Redirect customised orders to WhatsApp
            if (hasCustomised) {
              const waLink = getWhatsAppOrderLink({
                order_id: orderId,
                customer_name: customerName,
                product_name: cartItems.find(i => i.product?.type === 'customised' || i.type === 'customised')?.product?.name,
              });
              window.open(waLink, '_blank');
            }

            navigate('/orders');
          } catch (err) {
            console.error('Post-payment update failed:', err);
            toast.error('Payment received but order update failed. Contact support.');
          }
        },
        // On error / cancel
        async (error) => {
          // Mark order as cancelled
          try {
            await supabase
              .from(TABLES.ORDERS)
              .update({ status: 'cancelled' })
              .eq('id', orderId);
          } catch (_) { /* ignore */ }

          if (error.message !== 'Payment cancelled') {
            toast.error(error.message || 'Payment failed');
          } else {
            toast('Payment cancelled', { icon: 'ℹ️' });
          }
        }
      );
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Checkout failed');

      // Clean up orphaned order if created
      if (orderId) {
        try {
          await supabase.from(TABLES.ORDER_ITEMS).delete().eq('order_id', orderId);
          await supabase.from(TABLES.ORDERS).delete().eq('id', orderId);
        } catch (_) { /* ignore */ }
      }
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
                      src={product.image || '/images/products/model1.jpeg'}
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

            {/* Delivery Address */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">Deliver To</p>
                <Link to="/profile" className="text-accent text-xs hover:underline">Manage</Link>
              </div>
              {addressesLoading ? (
                <div className="flex items-center gap-2 text-text-muted text-sm py-3">
                  <Loader2 size={14} className="animate-spin" /> Loading addresses...
                </div>
              ) : addresses.length === 0 ? (
                <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4 text-center">
                  <MapPin size={20} className="text-text-muted mx-auto mb-2" />
                  <p className="text-text-secondary text-sm">No delivery address saved</p>
                  <Link to="/profile" className="text-accent text-xs hover:underline inline-flex items-center gap-1 mt-1">
                    <PlusCircle size={12} /> Add address
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    const Icon = addr.label === 'Home' ? Home : addr.label === 'Work' ? Briefcase : MapPin;
                    return (
                      <button
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`w-full flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-accent bg-accent/10'
                            : 'border-border-subtle bg-bg-secondary hover:border-border-default'
                        }`}
                      >
                        <Icon size={14} className={`mt-0.5 shrink-0 ${isSelected ? 'text-accent' : 'text-text-muted'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                            {addr.label}{addr.is_default && <span className="text-text-muted font-normal ml-1">· Default</span>}
                          </p>
                          <p className="text-text-secondary text-xs mt-0.5 truncate">
                            {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
                          </p>
                          <p className="text-text-muted text-[10px]">
                            {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postcode}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 mb-4">
              <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">Payment Method</p>
              <button
                onClick={() => setPaymentMethod('online')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                  paymentMethod === 'online'
                    ? 'border-accent bg-accent/10 text-text-primary'
                    : 'border-border-subtle bg-bg-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                <CreditCard size={18} className={paymentMethod === 'online' ? 'text-accent' : 'text-text-muted'} />
                <div className="flex-1">
                  <p className="text-sm font-medium">Pay Online</p>
                  <p className="text-xs text-text-muted">Razorpay — Cards, UPI, Netbanking</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-accent' : 'border-text-muted'}`}>
                  {paymentMethod === 'online' && <div className="w-2 h-2 rounded-full bg-accent" />}
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod('cod')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                  paymentMethod === 'cod'
                    ? 'border-accent bg-accent/10 text-text-primary'
                    : 'border-border-subtle bg-bg-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                <Banknote size={18} className={paymentMethod === 'cod' ? 'text-accent' : 'text-text-muted'} />
                <div className="flex-1">
                  <p className="text-sm font-medium">Cash on Delivery</p>
                  <p className="text-xs text-text-muted">Pay ₹{cartTotal} when your order arrives</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-accent' : 'border-text-muted'}`}>
                  {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-accent" />}
                </div>
              </button>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {checkingOut ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {paymentMethod === 'cod' ? 'Place COD Order' : 'Pay with Razorpay'}
            </button>
            {paymentMethod === 'online' && (
              <p className="text-text-muted text-xs text-center mt-3">
                Secured by Razorpay. Your payment info is never stored.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
