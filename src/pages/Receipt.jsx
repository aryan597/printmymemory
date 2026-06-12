import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Printer, Package, CheckCircle, Phone, Mail, MapPin } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

function formatPrice(price) {
  return 'Rs. ' + Number(price).toLocaleString('en-IN');
}

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function Receipt() {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const orderId = searchParams.get('orderId') || searchParams.get('id') || '';
  const phone = searchParams.get('phone') || '';

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      toast.error('Order ID is required');
      setLoading(false);
      return;
    }
    loadReceipt();
  }, [orderId, phone, isAuthenticated]);

  const loadReceipt = async () => {
    setLoading(true);
    try {
      if (!isAuthenticated || phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        const { data, error } = await supabase.rpc('get_guest_order_with_items', {
          order_id: orderId,
          phone: cleanPhone || '0000000000',
        });
        if (error) throw error;
        const row = data?.[0]?.order_data;
        if (!row?.order) {
          toast.error('Order not found. Check ID and phone number.');
          setOrder(null);
          setItems([]);
          return;
        }
        setOrder(row.order);
        setItems(row.items || []);
      } else {
        const { data, error } = await supabase
          .from(TABLES.ORDERS)
          .select(`*, items:${TABLES.ORDER_ITEMS}(*, product:products(*))`)
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();
        if (error) throw error;
        setOrder(data);
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Receipt load error:', err);
      toast.error(err.message || 'Failed to load receipt');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <main className="py-20 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-white" />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="py-20 text-center">
        <p className="text-neutral-400">Receipt not found.</p>
      </main>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = 0;
  const discount = order.discount_amount || 0;
  const total = order.total_amount || subtotal;
  const shippingAddr = order.shipping_address || {};

  return (
    <main className="py-10 sm:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 sm:p-10 print:shadow-none print:border-none"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 pb-6 border-b border-neutral-800">
            <div>
              <h1 className="text-2xl font-bold text-white">PrintMyMemory</h1>
              <p className="text-neutral-400 text-sm">Tax Invoice / Receipt</p>
            </div>
            <div className="sm:text-right">
              <p className="text-white font-mono text-sm">Order #{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-neutral-400 text-sm">{formatDate(order.created_at)}</p>
              <p className="text-neutral-500 text-xs mt-1">Payment: {(order.payment_method || 'online').toUpperCase()}</p>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">From</h3>
              <p className="text-white text-sm font-medium">PrintMyMemory</p>
              <p className="text-neutral-400 text-sm">Bangalore, India</p>
              <p className="text-neutral-500 text-sm flex items-center gap-1.5 mt-1">
                <Phone size={12} /> +91-7463812249
              </p>
              <p className="text-neutral-500 text-sm flex items-center gap-1.5">
                <Mail size={12} /> hello@printmymemory.in
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Ship To</h3>
              <p className="text-white text-sm font-medium">{shippingAddr.full_name || order.guest_name || '-'}</p>
              <p className="text-neutral-400 text-sm flex items-start gap-1.5">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span>
                  {shippingAddr.address_line1 || '-'}<br />
                  {shippingAddr.address_line2 ? <>{shippingAddr.address_line2}<br /></> : null}
                  {shippingAddr.city}{shippingAddr.city && shippingAddr.state ? ', ' : ''}{shippingAddr.state} {shippingAddr.postcode}
                </span>
              </p>
              <p className="text-neutral-500 text-sm mt-1">Phone: {shippingAddr.phone || order.guest_phone || '-'}</p>
              <p className="text-neutral-500 text-sm">Email: {shippingAddr.email || order.guest_email || '-'}</p>
            </div>
          </div>

          {/* Items */}
          <div className="mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-left">
                  <th className="pb-2 text-neutral-500 font-medium">Item</th>
                  <th className="pb-2 text-neutral-500 font-medium text-right">Qty</th>
                  <th className="pb-2 text-neutral-500 font-medium text-right">Price</th>
                  <th className="pb-2 text-neutral-500 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-800/50">
                    <td className="py-3 text-white">
                      {item.product?.name || 'Product'}
                      {item.custom_image && (
                        <span className="block text-neutral-500 text-xs">Custom photo</span>
                      )}
                    </td>
                    <td className="py-3 text-white text-right">{item.quantity}</td>
                    <td className="py-3 text-white text-right">{formatPrice(item.price)}</td>
                    <td className="py-3 text-white text-right">{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full sm:w-64 space-y-2 text-sm">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-neutral-400">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-neutral-800">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-800 pt-6 text-center">
            <p className="text-neutral-400 text-sm mb-1">Thank you for shopping with PrintMyMemory!</p>
            <p className="text-neutral-500 text-xs">
              Questions? Reach us on WhatsApp at +91-7463812249 or email hello@printmymemory.in
            </p>
            {order.payment_method === 'cod' && (
              <p className="text-white text-sm font-medium mt-3">
                Please keep {formatPrice(total)} ready as Cash on Delivery.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-center print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-6 py-3 rounded-full font-semibold transition-all"
            >
              <Printer size={18} /> Print Receipt / Packing Slip
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
