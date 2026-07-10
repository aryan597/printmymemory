import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Loader2, MapPin, Home, Briefcase, PlusCircle, Tag, Check, X } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { supabase, TABLES } from '../lib/supabaseClient';
import { sendOrderConfirmationEmail } from '../lib/notifications';
import UPIPayment from '../components/UPIPayment';
import toast from 'react-hot-toast';
import { useState, useEffect, useMemo } from 'react';
import Button from '../components/ui/Button';

function formatPrice(price) {
  return '₹' + Number(price).toLocaleString('en-IN');
}

/**
 * Turn a cart item's customization_values into a readable summary for the
 * print queue (stored on order_items.ai_printing_instructions).
 */
function summarizeCustomization(values) {
  if (!values || typeof values !== 'object') return null;
  const lines = [];
  for (const [key, val] of Object.entries(values)) {
    if (val == null || val === '') continue;
    if (typeof val === 'string' && val.startsWith('data:image')) {
      lines.push('Reference photo: uploaded');
      continue;
    }
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    lines.push(`${label}: ${Array.isArray(val) ? val.join(', ') : val}`);
  }
  return lines.length > 0 ? lines.join('\n') : null;
}

export default function Cart() {
  const { cartItems, cartTotal, shippingCost, cartCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated, profile } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentRef, setPaymentRef] = useState(null); // client-side ref for the UPI note; real order is created after payment
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
    } catch { /* ignore */ }
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

  // Discount is derived LIVE from the current subtotal, so it recalculates
  // whenever cart contents change (add/remove/qty). Never store a frozen amount.
  const discountAmount = useMemo(() => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.minOrderAmount && cartTotal < appliedVoucher.minOrderAmount) return 0;
    let d = Math.round((cartTotal * appliedVoucher.discountPercent) / 100);
    if (appliedVoucher.maxDiscountAmount && d > appliedVoucher.maxDiscountAmount) {
      d = appliedVoucher.maxDiscountAmount;
    }
    return Math.min(d, cartTotal);
  }, [appliedVoucher, cartTotal]);

  const finalTotal = Math.max(0, cartTotal + shippingCost - discountAmount);

  // If the cart drops below the voucher's minimum after an edit, remove it.
  useEffect(() => {
    if (
      appliedVoucher &&
      appliedVoucher.minOrderAmount &&
      cartTotal < appliedVoucher.minOrderAmount
    ) {
      toast.error(
        `Voucher ${appliedVoucher.code} removed — order is below the ${formatPrice(appliedVoucher.minOrderAmount)} minimum`
      );
      setAppliedVoucher(null);
      setVoucherCode('');
    }
  }, [cartTotal, appliedVoucher]);

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

      // Store the voucher RULE; the actual discount is derived live from the
      // current subtotal (see discountAmount useMemo) so it stays correct as
      // the cart changes.
      let discount = Math.round((cartTotal * data.discount_percent) / 100);
      if (data.max_discount_amount && discount > data.max_discount_amount) {
        discount = data.max_discount_amount;
      }
      discount = Math.min(discount, cartTotal);

      setAppliedVoucher({
        code: data.code,
        discountPercent: data.discount_percent,
        maxDiscountAmount: data.max_discount_amount ?? null,
        minOrderAmount: data.min_order_amount ?? null,
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

  // Validate the delivery details and open the payment step. The order is NOT
  // created here — it is only written to the database once the customer submits
  // their UTR (see createOrderAfterPayment), so we never store unpaid orders.
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!validate()) {
      toast.error('Please fill in all delivery details');
      return;
    }
    setPaymentRef(`PMM${Date.now().toString(36).toUpperCase()}`);
    setShowPayment(true);
  };

  // Called after the customer has paid and entered their UTR. This is the ONLY
  // place an order row is created. Throws on failure so the payment component
  // can surface a WhatsApp fallback (the customer has already paid).
  const createOrderAfterPayment = async ({ utr }) => {
    const shipping = buildShippingAddress();
    // Also stash the UTR inside the shipping_address JSONB so it is never lost,
    // even if the dedicated orders.utr_number column has not been migrated yet.
    const shippingWithUtr = { ...shipping, utr_number: utr };
    const orderPayload = {
      user_id: isAuthenticated ? user.id : null,
      total_amount: finalTotal,
      status: 'pending_payment',
      payment_method: 'phonepe_upi',
      shipping_address: shippingWithUtr,
      voucher_code: appliedVoucher?.code || null,
      discount_amount: discountAmount,
    };
    if (!isAuthenticated) {
      orderPayload.guest_name = shipping.full_name;
      orderPayload.guest_email = shipping.email;
      orderPayload.guest_phone = shipping.phone;
    }

    // Prefer the dedicated utr_number column, but tolerate it being absent from
    // the live schema (PGRST204) so a paid order is never lost.
    let orderData, orderError;
    ({ data: orderData, error: orderError } = await supabase
      .from(TABLES.ORDERS)
      .insert({ ...orderPayload, utr_number: utr })
      .select()
      .single());
    if (orderError?.code === 'PGRST204') {
      console.warn('orders.utr_number column missing — run the migration. UTR stored in shipping_address for now.');
      ({ data: orderData, error: orderError } = await supabase
        .from(TABLES.ORDERS)
        .insert(orderPayload)
        .select()
        .single());
    }
    if (orderError) throw orderError;
    const orderId = orderData.id;

    const baseItems = cartItems.map(item => {
      const unitPrice = item.unit_price ?? item.product?.price ?? item.price ?? 0;
      return {
        order_id: orderId,
        product_id: item.product_id || item.product?.id || item.id,
        quantity: item.quantity,
        price: unitPrice,
        custom_image: item.custom_image || null,
      };
    });
    // Optional columns (only present once the migration is applied).
    const richItems = baseItems.map((it, i) => ({
      ...it,
      ai_printing_instructions: summarizeCustomization(cartItems[i].customization_values),
      agreed_price: it.price,
    }));

    let itemsError;
    ({ error: itemsError } = await supabase.from(TABLES.ORDER_ITEMS).insert(richItems));
    if (itemsError?.code === 'PGRST204') {
      console.warn('order_items customization columns missing — run the migration. Inserting base line items.');
      ({ error: itemsError } = await supabase.from(TABLES.ORDER_ITEMS).insert(baseItems));
    }
    if (itemsError) {
      // Roll back the order so we don't leave a headless order behind.
      await supabase.from(TABLES.ORDERS).delete().eq('id', orderId);
      throw itemsError;
    }

    if (appliedVoucher) {
      try {
        await supabase.rpc('increment_voucher_usage', { code: appliedVoucher.code });
      } catch (vErr) {
        console.debug('Voucher usage increment failed:', vErr);
      }
    }

    // Best-effort confirmation email — never block the order on email failure.
    try {
      await sendOrderConfirmationEmail({
        to_email: shipping.email,
        to_name: shipping.full_name,
        order_id: orderId,
        total_amount: finalTotal,
        payment_method: 'phonepe_upi',
        items: cartItems,
        delivery: shipping,
      });
    } catch (emailErr) {
      console.error('Confirmation email failed:', emailErr);
    }

    await clearCart();
    toast.success('Order placed! We will verify your payment shortly.');
    navigate(`/receipt?orderId=${orderId}&phone=${shipping.phone}`);
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
            <ShoppingBag size={32} className="text-text-muted" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Your cart is empty</h2>
          <p className="text-text-secondary text-sm mb-6">Add some amazing 3D gifts to get started!</p>
          <Link to="/shop" className="btn-primary">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Shopping Cart ({cartCount})</h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => {
              const product = item.product || item;
              const price = item.unit_price ?? product.price ?? 0;
              return (
                <motion.div
                  key={item.id || item.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card p-4 flex gap-4"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-bg-elevated shrink-0">
                    <img
                      src={product.image || '/images/products/model1.jpeg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-text-primary font-semibold text-sm truncate">{product.name}</h3>
                    <p className="text-text-primary font-bold mt-1">{formatPrice(price)}</p>
                    {item.custom_image && (
                      <p className="text-text-muted text-xs mt-1">✓ Custom photo attached</p>
                    )}
                    {item.customization_values && (
                      <div className="mt-1 text-text-muted text-[11px] space-y-0.5">
                        {Object.entries(item.customization_values)
                          .filter(([, v]) => v && typeof v === 'string' && !v.startsWith('data:'))
                          .slice(0, 4)
                          .map(([k, v]) => <p key={k} className="truncate">• {v}</p>)}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id || item.product_id, item.quantity - 1)}
                        className="w-7 h-7 bg-bg-elevated border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-text-primary text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id || item.product_id, item.quantity + 1)}
                        className="w-7 h-7 bg-bg-elevated border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border transition-colors"
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 h-fit">
            {!showPayment ? (
              <>
                <h2 className="text-lg font-bold text-text-primary mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="text-text-primary">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Shipping</span>
                    <span className={shippingCost === 0 ? 'text-green-400' : 'text-text-primary'}>
                      {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Discount</span>
                    <span className={appliedVoucher ? 'text-green-400' : 'text-text-primary'}>
                      {appliedVoucher ? `-${formatPrice(discountAmount)}` : '-Rs. 0'}
                    </span>
                  </div>
                  {appliedVoucher && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-orange font-medium">{appliedVoucher.code}</span>
                      <button onClick={removeVoucher} className="text-text-muted hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="border-t border-border pt-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-text-primary font-semibold">Total</span>
                    <span className="text-text-primary font-bold text-xl">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Voucher Input */}
                <div className="mb-4">
                  <p className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">Voucher Code</p>
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
                        className="px-4 py-2 rounded-xl bg-bg-card hover:bg-bg-elevated text-text-primary text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {voucherLoading ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />}
                      </button>
                    </div>
                  )}
                </div>
                <div className="mb-4">
              <p className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">Deliver To</p>
              {isAuthenticated ? (
                addressesLoading ? (
                  <div className="flex items-center gap-2 text-text-muted text-sm py-3">
                    <Loader2 size={14} className="animate-spin" /> Loading addresses...
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="card rounded-xl p-4 text-center">
                    <MapPin size={20} className="text-text-muted mx-auto mb-2" />
                    <p className="text-text-secondary text-sm">No delivery address saved</p>
                    <Link to="/profile" className="text-text-primary text-xs hover:underline inline-flex items-center gap-1 mt-1">
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
                              ? 'border-accent bg-bg-card'
                              : 'border-border bg-bg-elevated hover:border-border'
                          }`}
                        >
                          <Icon size={14} className={`mt-0.5 shrink-0 ${isSelected ? 'text-text-primary' : 'text-text-muted'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
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
              <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">Payment Method</p>
              <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-accent bg-bg-card text-text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <path d="M2 10h20"/>
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium">Secure Online Payment</p>
                  <p className="text-xs text-text-secondary">UPI, Cards, Wallets, Net Banking</p>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-accent flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={checkingOut}
              className="w-full py-3"
            >
              {checkingOut ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              Proceed to Payment
            </Button>
            <p className="text-text-muted text-xs text-center mt-3">
              Powered by PhonePe. Pay securely via any UPI app.
            </p>
          </>
        ) : (
          <>
          <div className="card p-4 sm:p-6 border-accent/20">
            {showPayment && paymentRef && (
              <UPIPayment
                amount={finalTotal}
                orderId={paymentRef}
                onPaymentComplete={createOrderAfterPayment}
              />
            )}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowPayment(false);
                  setCheckingOut(false);
                }}
                className="text-text-muted text-xs hover:text-text-primary transition-colors"
              >
                Go back to cart
              </button>
            </div>
          </div>
          </>
        )}
      </motion.div>
        </div>
      </div>
    </main>
  );
}
