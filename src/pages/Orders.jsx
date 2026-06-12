import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Clock, CheckCircle, ShoppingBag, Loader2, ChevronRight, Search, ArrowLeft, Printer } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase, TABLES } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';

const statusConfig = {
  order_placed: { icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Order Placed' },
  pending_photo: { icon: ShoppingBag, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Pending Photo' },
  design_ready: { icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Design Ready' },
  approved: { icon: CheckCircle, color: 'text-indigo-400', bg: 'bg-indigo-400/10', label: 'Approved' },
  printing: { icon: Loader2, color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'Printing' },
  qc: { icon: CheckCircle, color: 'text-pink-400', bg: 'bg-pink-400/10', label: 'Quality Check' },
  packed: { icon: Package, color: 'text-teal-400', bg: 'bg-teal-400/10', label: 'Packed' },
  shipped: { icon: Package, color: 'text-cyan-400', bg: 'bg-cyan-400/10', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Delivered' },
  cancelled: { icon: Clock, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Cancelled' },
};

const CUSTOMISED_STEPS = ['order_placed', 'pending_photo', 'design_ready', 'approved', 'printing', 'qc', 'shipped', 'delivered'];
const UNCUSTOMISED_STEPS = ['order_placed', 'packed', 'shipped', 'delivered'];

function formatPrice(price) {
  return 'Rs. ' + Number(price).toLocaleString('en-IN');
}

function OrderCard({ order, onClick, phone }) {
  const status = statusConfig[order.status] || statusConfig.order_placed;
  const StatusIcon = status.icon;
  const type = order.items?.[0]?.product?.product_type || 'uncustomised';
  const steps = type === 'customised' ? CUSTOMISED_STEPS : UNCUSTOMISED_STEPS;
  const currentStepIndex = steps.indexOf(order.status);
  const isCustomised = type === 'customised';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 cursor-pointer hover:border-neutral-600 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-neutral-500 text-xs">Order ID</p>
          <p className="text-white font-mono text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bg}`}>
          <StatusIcon size={14} className={status.color} />
          <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between relative">
          {steps.map((step, i) => (
            <div key={step} className="flex flex-col items-center flex-1 relative">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                i <= currentStepIndex && order.status !== 'cancelled'
                  ? 'bg-white text-black'
                  : 'bg-neutral-800 text-neutral-500'
              }`}>
                {i < currentStepIndex ? <CheckCircle size={10} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`absolute top-3 left-1/2 w-full h-0.5 ${
                  i < currentStepIndex ? 'bg-white/40' : 'bg-neutral-800'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {steps.map((step) => (
            <span key={step} className="text-[9px] text-neutral-500 text-center flex-1">
              {statusConfig[step]?.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
        <div>
          <p className="text-neutral-500 text-xs">Total Amount</p>
          <p className="text-white font-bold">{formatPrice(order.total_amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-neutral-500 text-xs">Date</p>
          <p className="text-white text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {isCustomised && (
        <div className="mt-3 text-xs text-neutral-400">
          Customised order: photo/design details will be coordinated over WhatsApp.
        </div>
      )}
      <div className="mt-4 pt-3 border-t border-neutral-800">
        <Link
          to={`/receipt?orderId=${order.id}${phone ? `&phone=${phone.replace(/\D/g, '')}` : ''}`}
          className="inline-flex items-center gap-1.5 text-xs text-white hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <Printer size={12} /> Print receipt / packing slip
        </Link>
      </div>
    </motion.div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [lookupId, setLookupId] = useState(searchParams.get('id') || '');
  const [lookupPhone, setLookupPhone] = useState(searchParams.get('phone') || '');
  const [guestOrder, setGuestOrder] = useState(null);
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      setLoading(false);
      if (searchParams.get('id') && searchParams.get('phone')) {
        fetchGuestOrder(searchParams.get('id'), searchParams.get('phone'));
      }
    }
  }, [isAuthenticated, searchParams]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLES.ORDERS)
        .select(`*, items:${TABLES.ORDER_ITEMS}(*, product:products(*)), customizations:${TABLES.ORDER_CUSTOMIZATIONS}(*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestOrder = async (id, phone) => {
    if (!id || !phone) return;
    setGuestLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const { data, error } = await supabase.rpc('get_guest_order_with_items', {
        order_id: id,
        phone: cleanPhone,
      });
      if (error) throw error;
      if (!data || !data.length || !data[0]?.order) {
        toast.error('Order not found. Please check the ID and phone number.');
        setGuestOrder(null);
        return;
      }
      const row = data[0]?.order_data;
      if (!row?.order) {
        toast.error('Order not found. Please check the ID and phone number.');
        setGuestOrder(null);
        return;
      }
      setGuestOrder({ ...row.order, items: row.items || [] });
    } catch (err) {
      console.error('Guest order lookup error:', err);
      toast.error(err.message || 'Failed to look up order');
    } finally {
      setGuestLoading(false);
    }
  };

  const handleLookup = (e) => {
    e.preventDefault();
    const cleanPhone = lookupPhone.replace(/\D/g, '');
    if (!lookupId.trim() || cleanPhone.length < 10) {
      toast.error('Please enter a valid order ID and phone number');
      return;
    }
    setSearchParams({ id: lookupId.trim(), phone: cleanPhone });
  };

  if (loading) {
    return (
      <main className="py-16 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-white" />
      </main>
    );
  }

  // Guest lookup view
  if (!isAuthenticated) {
    return (
      <main className="py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Track Your Order</h1>
            <p className="text-neutral-400 text-sm mt-1">Enter your order ID and phone number to see the latest status.</p>
          </motion.div>

          <form onSubmit={handleLookup} className="card p-5 mb-6">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Order ID</label>
                <input
                  type="text"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="e.g. abc123..."
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Phone number</label>
                <input
                  type="tel"
                  value={lookupPhone}
                  onChange={(e) => setLookupPhone(e.target.value)}
                  placeholder="10-digit phone"
                  className="input w-full"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={guestLoading} className="w-full sm:w-auto">
              {guestLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Track Order
            </Button>
          </form>

          {guestLoading && (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-white" />
            </div>
          )}

          {guestOrder && !guestLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <OrderCard order={guestOrder} onClick={() => {}} phone={lookupPhone} />
              <div className="card p-5 mt-4">
                <h3 className="text-white font-semibold mb-3">Items</h3>
                <div className="space-y-3">
                  {guestOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.product?.image || '/images/products/model1.jpeg'}
                        alt={item.product?.name}
                        className="w-14 h-14 rounded-lg object-cover bg-neutral-900"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{item.product?.name || 'Product'}</p>
                        <p className="text-neutral-500 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-white text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-neutral-800 mt-4 pt-4">
                  <p className="text-neutral-400 text-sm">Shipping to</p>
                  <p className="text-white text-sm mt-1">
                    {guestOrder.shipping_address?.full_name}<br />
                    {guestOrder.shipping_address?.address_line1}
                    {guestOrder.shipping_address?.address_line2 ? `, ${guestOrder.shipping_address.address_line2}` : ''}
                    <br />
                    {guestOrder.shipping_address?.city}, {guestOrder.shipping_address?.state} {guestOrder.shipping_address?.postcode}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {!guestOrder && !guestLoading && (
            <p className="text-neutral-500 text-sm text-center py-6">
              Have an account? <Link to="/login" className="text-white hover:underline">Sign in</Link> to see all your orders.
            </p>
          )}
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="py-16 sm:py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <ShoppingBag size={48} className="text-neutral-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No orders yet</h2>
          <p className="text-neutral-400 text-sm mb-6">Start shopping to see your orders here</p>
          <Link to="/shop" className="bg-white hover:bg-neutral-200 text-black px-6 py-3 rounded-full font-semibold transition-all">
            Browse Products
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Orders</h1>
          <p className="text-neutral-400 text-sm mt-1">Track and manage your orders</p>
        </motion.div>

        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onClick={() => navigate(`/orders/${order.id}`)} phone="" />
          ))}
        </div>
      </div>
    </main>
  );
}
