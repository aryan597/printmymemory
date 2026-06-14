import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Loader2, CreditCard, Banknote, MapPin, Home, Briefcase, PlusCircle, MessageCircle, Tag, Check, X } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { openRazorpayCheckout } from '../lib/razorpay';
import { supabase, TABLES } from '../lib/supabaseClient';
import { sendOrderConfirmationEmail, getWhatsAppOrderLink } from '../lib/notifications';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '919471725271';

function formatPrice(price) {
  return 'Rs. ' + Number(price).toLocaleString('en-IN');
}

export default function Cart() {
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated, profile } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressesLoading, setAddressesLoading] = useState(false);

  const [guestForm, setGuestForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postcode: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null); // { code, discountPercent, discountAmount }

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadAddresses();
      setGuestForm(prev => ({
        ...prev,
        full_name: profile?.full_name || user?.user_metadata?.full_name || '',
        email: user?.email || '',
        phone: (profile?.phone || user?.user_metadata?.phone || '').replace(/\D/g, '').slice(-10),
      }));
    }
  }, [isAuthenticated, user?.id]);

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
    if (isAuthenticated) {
      const addr = getSelectedAddress();
      if (addr) {
        return {
          full_name: addr.full_name || profile?.full_name || '',
          phone: (addr.phone || profile?.phone || '').replace(/\D/g, '').slice(-10),
          email: user?.email || '',
          address_line1: addr.address_line1,
          address_line2: addr.address_line2 || '',
          city: addr.city || '',
          state: addr.state || '',
          postcode: addr.postcode || '',
          label: addr.label || 'Home',
        };
      }
    }
    return {
      full_name: guestForm.full_name.trim(),
      phone: guestForm.phone.trim().replace(/\D/g, '').slice(-10),
      email: guestForm.email.trim(),
      address_line1: guestForm.address_line1.trim(),
      address_line2: guestForm.address_line2.trim(),
      city: guestForm.city.trim(),
      state: guestForm.state.trim(),
      postcode: guestForm.postcode.trim(),
      label: 'Home',
    };
  };

  const validate = () => {
    const errors = {};
    const delivery = buildShippingAddress();
    if (!delivery.full_name) errors.full_name = 'Required';
    if (!delivery.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(delivery.email)) errors.email = 'Valid email required';
    if (!delivery.phone || !/^\d{10}$/.test(delivery.phone.replace(/\D/g, ''))) errors.phone = '10-digit phone required';
    if (!delivery.address_line1) errors.address_line1 = 'Required';
    if (!delivery.city) errors.city = 'Required';
    if (!delivery.state) errors.state = 'Required';
    if (!delivery.postcode) errors.postcode = 'Required';
    if (isAuthenticated && !getSelectedAddress()) errors.address = 'Please select an address';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const applyVoucher = async () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a voucher code');
      return;
    }
    setVoucherLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLES.VOUCHERS)
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast.error('Invalid voucher code');
        setAppliedVoucher(null);
        return;
      }

      // Check expiry
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast.error('This voucher has expired');
        setAppliedVoucher(null);
        return;
      }

      // Check usage limit
      if (data.usage_limit !== null && data.usage_count >= data.usage_limit) {
        toast.error('This voucher has reached its usage limit');
        setAppliedVoucher(null);
        return;
      }

      // Check minimum order amount
      if (data.min_order_amount && cartTotal < data.min_order_amount) {
        toast.error(`Minimum order of ${formatPrice(data.min_order_amount)} required`);
        setAppliedVoucher(null);
        return;
      }

      // Calculate discount
      let discount = Math.round((cartTotal * data.discount_percent) / 100);
      if (data.max_discount_amount && discount > data.max_discount_amount) {
        discount = data.max_discount_amount;
      }

      setAppliedVoucher({
        code: data.code,
        discountPercent: data.discount_percent,
        discountAmount: discount,
      });
      toast.success(`${data.code} applied! You saved ${formatPrice(discount)}`);
    } catch (err) {
      console.error('Voucher error:', err);
      toast.error('Failed to apply voucher');
    } finally {
      setVoucherLoading(false);
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    toast('Voucher removed', { icon: 'ℹ️' });
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!validate()) {
      toast.error('Please fill in all delivery details');
      return;
    }

    setCheckingOut(true);
    let orderId = null;

    try {
      const shipping = buildShippingAddress();
      const orderPayload = {
        user_id: isAuthenticated ? user.id : null,
        total_amount: finalTotal,
        status: 'order_placed',
        payment_method: paymentMethod,
        shipping_address: shipping,
        voucher_code: appliedVoucher?.code || null,
        discount_amount: discountAmount,
      };
      if (!isAuthenticated) {
        orderPayload.guest_name = shipping.full_name;
        orderPayload.guest_email = shipping.email;
        orderPayload.guest_phone = shipping.phone;
      }

      const { data: orderData, error: orderError } = await supabase
        .from(TABLES.ORDERS)
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;
      orderId = orderData.id;

      const orderItems = cartItems.map(item => ({
        order_id: orderId,
        product_id: item.product_id || item.product?.id || item.id,
        quantity: item.quantity,
        price: item.product?.price || item.price || 0,
        custom_image: item.custom_image || null,
      }));

      const { error: itemsError } = await supabase.from(TABLES.ORDER_ITEMS).insert(orderItems);
      if (itemsError) throw itemsError;

      // Increment voucher usage count if voucher was applied
      if (appliedVoucher) {
        try {
          await supabase.rpc('increment_voucher_usage', { code: appliedVoucher.code });
        } catch (vErr) {
          console.debug('Voucher usage increment failed:', vErr);
        }
      }

      const hasCustomised = cartItems.some(
        item => item.product?.product_type === 'customised' || item.product_type === 'customised'
      );
      const customerEmail = shipping.email;
      const customerName = shipping.full_name;
      const customerPhone = shipping.phone;

      // COD flow
      if (paymentMethod === 'cod') {
        await sendOrderConfirmationEmail({
          to_email: customerEmail,
          to_name: customerName,
          order_id: orderId,
          total_amount: finalTotal,
          payment_method: 'cod',
          items: cartItems,
          delivery: shipping,
        });

        await clearCart();
        toast.success('Order placed! Pay ' + formatPrice(finalTotal) + ' on delivery.');

        if (hasCustomised) {
          const waLink = getWhatsAppOrderLink({
            phone: WHATSAPP_NUMBER,
            order_id: orderId,
            customer_name: customerName,
            product_name: cartItems.find(i => i.product?.product_type === 'customised' || i.product_type === 'customised')?.product?.name,
          });
          window.open(waLink, '_blank');
        }

        navigate(`/receipt?orderId=${orderId}&phone=${customerPhone}`);
        return;
      }

      // Online flow
      await openRazorpayCheckout(
        {
          amount: finalTotal,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          orderName: hasCustomised ? 'Customised 3D Printed Gift' : '3D Printed Gift',
        },
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

            await sendOrderConfirmationEmail({
              to_email: customerEmail,
              to_name: customerName,
              order_id: orderId,
              total_amount: finalTotal,
              payment_method: 'online',
              items: cartItems,
              delivery: shipping,
            });

            if (hasCustomised) {
              const waLink = getWhatsAppOrderLink({
                phone: WHATSAPP_NUMBER,
                order_id: orderId,
                customer_name: customerName,
                product_name: cartItems.find(i => i.product?.product_type === 'customised' || i.product_type === 'customised')?.product?.name,
              });
              window.open(waLink, '_blank');
            }

            navigate(`/receipt?orderId=${orderId}&phone=${customerPhone}`);
          } catch (err) {
            console.error('Post-payment update failed:', err);
            toast.error('Payment received but order update failed. Contact support.');
          }
        },
        async (error) => {
          try {
            await supabase.from(TABLES.ORDERS).update({ status: 'cancelled' }).eq('id', orderId);
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
      <main className="section-padding flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 card rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-neutral-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-neutral-400 text-sm mb-6">Add some amazing 3D gifts to get started!</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-6 py-3 rounded-full font-semibold transition-all"
          >
            Browse Products <ArrowRight size={16} />
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="section-padding">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Shopping Cart ({cartCount})</h1>
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
                  className="card p-4 flex gap-4"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
                    <img
                      src={product.image || '/images/products/model1.jpeg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{product.name}</h3>
                    <p className="text-white font-bold mt-1">{formatPrice(price)}</p>
                    {item.custom_image && (
                      <p className="text-neutral-500 text-xs mt-1">Custom photo attached</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id || item.product_id, item.quantity - 1)}
                        className="w-7 h-7 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-white text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id || item.product_id, item.quantity + 1)}
                        className="w-7 h-7 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id || item.product_id)}
                    className="text-neutral-500 hover:text-red-400 transition-colors self-start"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 h-fit">
            <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Subtotal</span>
                <span className="text-white">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Shipping</span>
                <span className="text-green-400">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Discount</span>
                <span className={appliedVoucher ? 'text-green-400' : 'text-white'}>
                  {appliedVoucher ? `-${formatPrice(discountAmount)}` : '-Rs. 0'}
                </span>
              </div>
              {appliedVoucher && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-orange font-medium">{appliedVoucher.code}</span>
                  <button onClick={removeVoucher} className="text-neutral-500 hover:text-red-400 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="border-t border-neutral-800 pt-4 mb-4">
              <div className="flex justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-white font-bold text-xl">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Voucher Input */}
            <div className="mb-4">
              <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-2">Voucher Code</p>
              {appliedVoucher ? (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-green-500/30 bg-green-500/10">
                  <Check size={14} className="text-green-400" />
                  <span className="text-green-400 text-sm font-medium">{appliedVoucher.code} applied</span>
                  <span className="text-green-400/70 text-xs">(-{appliedVoucher.discountPercent}%)</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. WELCOME10)"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="input flex-1 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && applyVoucher()}
                  />
                  <button
                    onClick={applyVoucher}
                    disabled={voucherLoading}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {voucherLoading ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />}
                  </button>
                </div>
              )}
            </div>
            <div className="mb-4">
              <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-2">Deliver To</p>
              {isAuthenticated ? (
                addressesLoading ? (
                  <div className="flex items-center gap-2 text-neutral-500 text-sm py-3">
                    <Loader2 size={14} className="animate-spin" /> Loading addresses...
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="card rounded-xl p-4 text-center">
                    <MapPin size={20} className="text-neutral-500 mx-auto mb-2" />
                    <p className="text-neutral-400 text-sm">No delivery address saved</p>
                    <Link to="/profile" className="text-white text-xs hover:underline inline-flex items-center gap-1 mt-1">
                      <PlusCircle size={12} /> Add address
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-4">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      const Icon = addr.label === 'Home' ? Home : addr.label === 'Work' ? Briefcase : MapPin;
                      return (
                        <button
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`w-full flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-white bg-neutral-800'
                              : 'border-neutral-800 bg-neutral-900 hover:border-neutral-600'
                          }`}
                        >
                          <Icon size={14} className={`mt-0.5 shrink-0 ${isSelected ? 'text-white' : 'text-neutral-500'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                              {addr.label}{addr.is_default && <span className="text-neutral-500 font-normal ml-1">· Default</span>}
                            </p>
                            <p className="text-neutral-400 text-xs mt-0.5 truncate">
                              {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
                            </p>
                            <p className="text-neutral-500 text-[10px]">
                              {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postcode}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5">
                              <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={guestForm.full_name}
                        onChange={(e) => setGuestForm(f => ({ ...f, full_name: e.target.value }))}
                        className={`input w-full ${formErrors.full_name ? 'border-red-500' : ''}`}
                      />
                      {formErrors.full_name && <p className="text-red-400 text-[10px] mt-1">{formErrors.full_name}</p>}
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={guestForm.phone}
                        onChange={(e) => setGuestForm(f => ({ ...f, phone: e.target.value }))}
                        className={`input w-full ${formErrors.phone ? 'border-red-500' : ''}`}
                      />
                      {formErrors.phone && <p className="text-red-400 text-[10px] mt-1">{formErrors.phone}</p>}
                    </div>
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={guestForm.email}
                      onChange={(e) => setGuestForm(f => ({ ...f, email: e.target.value }))}
                      className={`input w-full ${formErrors.email ? 'border-red-500' : ''}`}
                    />
                    {formErrors.email && <p className="text-red-400 text-[10px] mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Address line 1"
                      value={guestForm.address_line1}
                      onChange={(e) => setGuestForm(f => ({ ...f, address_line1: e.target.value }))}
                      className={`input w-full ${formErrors.address_line1 ? 'border-red-500' : ''}`}
                    />
                    {formErrors.address_line1 && <p className="text-red-400 text-[10px] mt-1">{formErrors.address_line1}</p>}
                  </div>
                  <input
                    type="text"
                    placeholder="Address line 2 (optional)"
                    value={guestForm.address_line2}
                    onChange={(e) => setGuestForm(f => ({ ...f, address_line2: e.target.value }))}
                    className="input w-full"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="City"
                        value={guestForm.city}
                        onChange={(e) => setGuestForm(f => ({ ...f, city: e.target.value }))}
                        className={`input w-full ${formErrors.city ? 'border-red-500' : ''}`}
                      />
                      {formErrors.city && <p className="text-red-400 text-[10px] mt-1">{formErrors.city}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="State"
                        value={guestForm.state}
                        onChange={(e) => setGuestForm(f => ({ ...f, state: e.target.value }))}
                        className={`input w-full ${formErrors.state ? 'border-red-500' : ''}`}
                      />
                      {formErrors.state && <p className="text-red-400 text-[10px] mt-1">{formErrors.state}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="PIN"
                        value={guestForm.postcode}
                        onChange={(e) => setGuestForm(f => ({ ...f, postcode: e.target.value }))}
                        className={`input w-full ${formErrors.postcode ? 'border-red-500' : ''}`}
                      />
                      {formErrors.postcode && <p className="text-red-400 text-[10px] mt-1">{formErrors.postcode}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2 mb-4">
              <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Payment Method</p>
              <button
                onClick={() => setPaymentMethod('online')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                  paymentMethod === 'online'
                    ? 'border-white bg-neutral-800 text-white'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                <CreditCard size={18} className={paymentMethod === 'online' ? 'text-white' : 'text-neutral-500'} />
                <div className="flex-1">
                  <p className="text-sm font-medium">Pay Online</p>
                  <p className="text-xs text-neutral-500">Razorpay - Cards, UPI, Netbanking</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-white' : 'border-neutral-600'}`}>
                  {paymentMethod === 'online' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod('cod')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                  paymentMethod === 'cod'
                    ? 'border-white bg-neutral-800 text-white'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                <Banknote size={18} className={paymentMethod === 'cod' ? 'text-white' : 'text-neutral-500'} />
                <div className="flex-1">
                  <p className="text-sm font-medium">Cash on Delivery</p>
                  <p className="text-xs text-neutral-500">Pay {formatPrice(finalTotal)} when your order arrives</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-white' : 'border-neutral-600'}`}>
                  {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full py-3"
            >
              {checkingOut ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {paymentMethod === 'cod' ? 'Place COD Order' : 'Pay with Razorpay'}
            </Button>
            {paymentMethod === 'online' && (
              <p className="text-neutral-500 text-xs text-center mt-3">
                Secured by Razorpay. Your payment info is never stored.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
