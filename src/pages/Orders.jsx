import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, ShoppingBag, Upload, Image, Loader2, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase, TABLES } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const statusConfig = {
  order_placed: { icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Order Placed' },
  pending_photo: { icon: Image, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Pending Photo' },
  design_ready: { icon: Image, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Design Ready' },
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

export default function Orders() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!isAuthenticated) return;
    loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
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

  const getSteps = (order) => {
    const type = order.items?.[0]?.product?.product_type || 'uncustomised';
    return type === 'customised' ? CUSTOMISED_STEPS : UNCUSTOMISED_STEPS;
  };

  if (!isAuthenticated) {
    return (
      <main className="py-16 sm:py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Package size={48} className="text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Please sign in</h2>
          <p className="text-text-secondary text-sm mb-6">Sign in to view your orders</p>
          <Link to="/login" className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="py-16 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="py-16 sm:py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <ShoppingBag size={48} className="text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">No orders yet</h2>
          <p className="text-text-secondary text-sm mb-6">Start shopping to see your orders here</p>
          <Link to="/shop" className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-semibold transition-all">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">My Orders</h1>
          <p className="text-text-secondary text-sm mt-1">Track and manage your orders</p>
        </motion.div>

        <div className="space-y-4">
          {orders.map((order, index) => {
            const status = statusConfig[order.status] || statusConfig.order_placed;
            const StatusIcon = status.icon;
            const steps = getSteps(order);
            const currentStepIndex = steps.indexOf(order.status);
            const isCustomised = order.items?.[0]?.product?.product_type === 'customised';
            const customization = order.customizations?.[0];
            const needsPhoto = isCustomised && order.status === 'pending_photo';
            const needsApproval = isCustomised && order.status === 'design_ready' && customization?.design_preview_url && !customization?.customer_approved_at;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-bg-card border border-border-subtle rounded-xl p-5 cursor-pointer hover:border-border-default transition-colors"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-text-muted text-xs">Order ID</p>
                    <p className="text-text-primary font-mono text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bg}`}>
                    <StatusIcon size={14} className={status.color} />
                    <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                  </div>
                </div>

                {/* Pipeline Stepper */}
                <div className="mb-4">
                  <div className="flex items-center justify-between relative">
                    {steps.map((step, i) => (
                      <div key={step} className="flex flex-col items-center flex-1 relative">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                          i <= currentStepIndex && order.status !== 'cancelled'
                            ? 'bg-accent text-white'
                            : 'bg-bg-elevated text-text-muted'
                        }`}>
                          {i < currentStepIndex ? (
                            <CheckCircle size={10} />
                          ) : (
                            i + 1
                          )}
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`absolute top-3 left-1/2 w-full h-0.5 ${
                            i < currentStepIndex ? 'bg-accent/40' : 'bg-border-subtle'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {steps.map((step) => (
                      <span key={step} className="text-[9px] text-text-muted text-center flex-1">
                        {statusConfig[step]?.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Order Info */}
                <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                  <div>
                    <p className="text-text-muted text-xs">Total Amount</p>
                    <p className="text-text-primary font-bold">₹{order.total_amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-muted text-xs">Date</p>
                    <p className="text-text-primary text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-text-muted text-xs flex items-center gap-1">
                    View details <ChevronRight size={12} />
                  </span>
                  {needsPhoto && (
                    <span className="text-yellow-400 text-xs font-medium bg-yellow-400/10 px-2 py-0.5 rounded-full">Action needed</span>
                  )}
                  {needsApproval && (
                    <span className="text-purple-400 text-xs font-medium bg-purple-400/10 px-2 py-0.5 rounded-full">Review design</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
