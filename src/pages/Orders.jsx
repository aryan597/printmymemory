import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase, TABLES } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const statusConfig = {
  paid: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Delivered' },
  pending: { icon: Clock, color: 'text-accent', bg: 'bg-accent/10', label: 'Processing' },
  cancelled: { icon: Package, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Cancelled' },
};

export default function Orders() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadOrders();
  }, [isAuthenticated, user]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.ORDERS)
        .select(`*, items:${TABLES.ORDER_ITEMS}(*, product:products(*))`)
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
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-bg-card border border-border-subtle rounded-xl p-5"
              >
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
                <div className="border-t border-border-subtle pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-muted text-xs">Total Amount</p>
                      <p className="text-text-primary font-bold">₹{order.total_amount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-text-muted text-xs">Date</p>
                      <p className="text-text-primary text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
