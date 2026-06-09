import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Package, CheckCircle, Loader2, Upload, Image, XCircle,
  MapPin, CreditCard, Banknote, Truck,
  MessageSquare, Star,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase, TABLES } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const statusConfig = {
  order_placed: { icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', label: 'Order Placed' },
  pending_photo: { icon: Image, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', label: 'Pending Photo' },
  design_ready: { icon: Image, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30', label: 'Design Ready' },
  approved: { icon: CheckCircle, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/30', label: 'Approved' },
  printing: { icon: Loader2, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', label: 'Printing' },
  qc: { icon: CheckCircle, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/30', label: 'Quality Check' },
  packed: { icon: Package, color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/30', label: 'Packed' },
  shipped: { icon: Truck, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', label: 'Cancelled' },
};

const CANCELABLE_STATUSES = ['order_placed', 'pending_photo'];
const MAX_FILE_SIZE_MB = 10;

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [approving, setApproving] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const loadCounter = useRef(0);

  const loadOrder = useCallback(async () => {
    const currentLoad = ++loadCounter.current;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLES.ORDERS)
        .select(`*, items:${TABLES.ORDER_ITEMS}(*, product:products(*)), customizations:${TABLES.ORDER_CUSTOMIZATIONS}(*)`)
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();
      if (error) throw error;

      // Only update if this is still the most recent load
      if (currentLoad !== loadCounter.current) return;
      setOrder(data);

      const { data: historyData } = await supabase
        .from(TABLES.ORDER_STATUS_HISTORY)
        .select('*')
        .eq('order_id', id)
        .order('created_at', { ascending: false });

      if (currentLoad === loadCounter.current) {
        setHistory(historyData || []);
      }
    } catch (err) {
      if (currentLoad === loadCounter.current) {
        toast.error('Failed to load order');
        navigate('/orders');
      }
    } finally {
      if (currentLoad === loadCounter.current) {
        setLoading(false);
      }
    }
  }, [id, user?.id, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !id) return;
    loadOrder();
  }, [loadOrder, isAuthenticated, user?.id, id]);

  // Real-time subscription (only when authenticated)
  useEffect(() => {
    if (!id || !isAuthenticated || !user?.id) return;
    const channel = supabase
      .channel(`order-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.ORDERS, filter: `id=eq.${id}` }, () => {
        loadOrder();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLES.ORDER_STATUS_HISTORY, filter: `order_id=eq.${id}` }, () => {
        loadOrder();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.ORDER_CUSTOMIZATIONS, filter: `order_id=eq.${id}` }, () => {
        loadOrder();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, isAuthenticated, user?.id, loadOrder]);

  const handleUploadPhoto = async (file) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `customer-photos/${id}/${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('customer-photos').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('customer-photos').getPublicUrl(data.path);

      const { error: upsertError } = await supabase
        .from(TABLES.ORDER_CUSTOMIZATIONS)
        .upsert({ order_id: id, customer_photo_url: publicUrl }, { onConflict: 'order_id' });
      if (upsertError) throw upsertError;

      toast.success('Photo uploaded successfully!');
      loadOrder();
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleApproveDesign = async () => {
    setApproving(true);
    try {
      const { error } = await supabase
        .from(TABLES.ORDER_CUSTOMIZATIONS)
        .upsert({ order_id: id, customer_approved_at: new Date().toISOString() }, { onConflict: 'order_id' });
      if (error) throw error;
      // Auto-advance order status to approved
      await supabase.from(TABLES.ORDERS).update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', id);
      await supabase.from(TABLES.ORDER_STATUS_HISTORY).insert({ order_id: id, status: 'approved', note: 'Design approved by customer' });
      toast.success('Design approved!');
      loadOrder();
    } catch (err) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setApproving(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNote.trim()) {
      toast.error('Please describe what needs to change');
      return;
    }
    setApproving(true);
    try {
      const { error } = await supabase
        .from(TABLES.ORDER_CUSTOMIZATIONS)
        .upsert({ order_id: id, customer_notes: revisionNote.trim() }, { onConflict: 'order_id' });
      if (error) throw error;
      toast.success('Revision request sent!');
      setRevisionNote('');
      setShowRevisionForm(false);
      loadOrder();
    } catch (err) {
      toast.error(err.message || 'Failed to send request');
    } finally {
      setApproving(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { error } = await supabase
        .from(TABLES.ORDERS)
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;

      await supabase.from(TABLES.ORDER_STATUS_HISTORY).insert({
        order_id: id,
        status: 'cancelled',
        note: 'Cancelled by customer',
      });

      toast.success('Order cancelled');
      loadOrder();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleUploadPhoto(file);
    else toast.error('Please drop an image file');
  };

  if (!isAuthenticated) {
    return (
      <main className="py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <Package size={48} className="text-text-muted mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Please sign in</h2>
        <Link to="/login" className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-semibold transition-all mt-4">Sign In</Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="py-16 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent" />
      </main>
    );
  }

  if (!order) return null;

  const status = statusConfig[order.status] || statusConfig.order_placed;
  const StatusIcon = status.icon;
  const isCustomised = order.items?.[0]?.product?.product_type === 'customised';
  const customization = order.customizations?.[0];
  const needsPhoto = isCustomised && order.status === 'pending_photo';
  const needsApproval = isCustomised && order.status === 'design_ready' && customization?.design_preview_url && !customization?.customer_approved_at;
  const canCancel = CANCELABLE_STATUSES.includes(order.status);

  const statusMessages = {
    cancelled: 'This order has been cancelled.',
    delivered: 'Your order has been delivered. Enjoy!',
    shipped: 'Your order is on the way! Track it for updates.',
    order_placed: 'We have received your order and will start processing soon.',
    pending_photo: 'Please upload your reference photo so we can start designing.',
    design_ready: 'Please review the design preview and approve or request changes.',
    approved: 'Design approved! Your order is now being prepared for printing.',
    printing: 'Your custom gift is currently being 3D printed with love.',
    qc: 'Quality check in progress. We ensure every product is perfect.',
    packed: 'Your order is packed and ready for dispatch.',
  };

  return (
    <main className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/orders')} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-card rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-text-secondary text-sm">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Status Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-xl border ${status.bg} ${status.border}`}>
          <div className="flex items-center gap-3">
            <StatusIcon size={20} className={status.color + (order.status === 'printing' ? ' animate-spin' : '')} />
            <div>
              <p className={`text-sm font-semibold ${status.color}`}>{status.label}</p>
              <p className="text-text-secondary text-xs mt-0.5">
                {statusMessages[order.status] || 'We are working on your order. You will be notified of updates.'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action: Cancel */}
        {canCancel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="w-full flex items-center justify-center gap-2 bg-red-400/10 hover:bg-red-400/20 text-red-400 border border-red-400/30 px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
            >
              {cancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Cancel Order
            </button>
          </motion.div>
        )}

        {/* Items */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-bg-card border border-border-subtle rounded-xl p-5 mb-6">
          <h3 className="text-text-primary font-semibold mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id || `${item.product_id}-${item.price}`} className="flex items-center gap-3 pb-3 border-b border-border-subtle last:border-0 last:pb-0">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-bg-secondary border border-border-subtle shrink-0 flex items-center justify-center">
                  {item.product?.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product?.name || ''}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : null}
                  {!item.product?.image && <Package size={16} className="text-text-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium truncate">{item.product?.name}</p>
                  <p className="text-text-muted text-xs">Qty: {item.quantity}</p>
                </div>
                <span className="text-text-primary text-sm font-semibold">₹{Number(item.price).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between">
            <span className="text-text-secondary text-sm">Total</span>
            <span className="text-accent font-bold text-lg">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
          </div>
        </motion.div>

        {/* Shipping & Payment */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-bg-card border border-border-subtle rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className="text-accent" />
              <h3 className="text-text-primary font-semibold text-sm">Delivery Address</h3>
            </div>
            <div className="text-sm space-y-1">
              <p className="text-text-primary font-medium">{order.shipping_address?.full_name || '—'}</p>
              <p className="text-text-secondary">{order.shipping_address?.address_line1 || '—'}</p>
              {order.shipping_address?.address_line2 && <p className="text-text-secondary">{order.shipping_address.address_line2}</p>}
              <p className="text-text-muted">
                {order.shipping_address?.city}{order.shipping_address?.state ? `, ${order.shipping_address.state}` : ''} {order.shipping_address?.postcode}
              </p>
              {order.shipping_address?.phone && <p className="text-text-muted">{order.shipping_address.phone}</p>}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-bg-card border border-border-subtle rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              {order.payment_method === 'cod' ? <Banknote size={14} className="text-accent" /> : <CreditCard size={14} className="text-accent" />}
              <h3 className="text-text-primary font-semibold text-sm">Payment</h3>
            </div>
            <div className="text-sm space-y-1">
              <p className="text-text-primary font-medium">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)'}
              </p>
              {order.razorpay_payment_id && (
                <p className="text-text-muted text-xs font-mono">ID: {order.razorpay_payment_id}</p>
              )}
              <p className="text-accent font-bold mt-2">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
            </div>
          </motion.div>
        </div>

        {/* Action: Upload Photo */}
        {needsPhoto && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-bg-card border border-border-subtle rounded-xl p-5 mb-6">
            <h3 className="text-text-primary font-semibold mb-2 flex items-center gap-2">
              <Upload size={16} className="text-yellow-400" />
              Upload Reference Photo
            </h3>
            <p className="text-text-secondary text-sm mb-4">Drag and drop or click to upload a clear photo for your customised print. Max {MAX_FILE_SIZE_MB}MB.</p>

            {customization?.customer_photo_url ? (
              <div className="mb-4">
                <p className="text-text-muted text-xs mb-2">Uploaded photo:</p>
                <img
                  src={customization.customer_photo_url}
                  alt="Your reference"
                  className="w-full max-w-xs rounded-lg border border-border-subtle"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            ) : (
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragOver ? 'border-accent bg-accent/5' : 'border-border-subtle bg-bg-secondary'
                }`}
              >
                <Image size={28} className="text-text-muted mx-auto mb-2" />
                <p className="text-text-secondary text-sm">Drag & drop your photo here</p>
                <p className="text-text-muted text-xs mt-1">or click to browse</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadPhoto(e.target.files?.[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}
            {uploadingPhoto && <p className="text-accent text-xs mt-2 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Uploading...</p>}
          </motion.div>
        )}

        {/* Action: Design Approval */}
        {needsApproval && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-bg-card border border-border-subtle rounded-xl p-5 mb-6">
            <h3 className="text-text-primary font-semibold mb-2 flex items-center gap-2">
              <Star size={16} className="text-purple-400" />
              Design Preview
            </h3>
            <p className="text-text-secondary text-sm mb-4">Review the design preview below. Approve it or request changes.</p>

            <img
              src={customization.design_preview_url}
              alt="Design preview"
              className="w-full max-w-sm rounded-lg mb-4 border border-border-subtle"
              onError={(e) => { e.target.style.display = 'none'; }}
            />

            {customization?.customer_notes && (
              <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3 mb-4">
                <p className="text-yellow-400 text-xs font-medium">Your revision request:</p>
                <p className="text-text-secondary text-sm mt-1">{customization.customer_notes}</p>
              </div>
            )}

            {showRevisionForm ? (
              <div className="space-y-3">
                <textarea
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  rows={3}
                  placeholder="Describe what needs to change..."
                  className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleRequestRevision}
                    disabled={approving}
                    className="bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    {approving ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                    Send Revision Request
                  </button>
                  <button onClick={() => setShowRevisionForm(false)} className="text-text-muted hover:text-text-primary text-sm px-3 py-2">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleApproveDesign}
                  disabled={approving}
                  className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {approving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Approve Design
                </button>
                <button
                  onClick={() => setShowRevisionForm(true)}
                  className="bg-bg-secondary hover:bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <MessageSquare size={14} /> Request Changes
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Timeline */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-bg-card border border-border-subtle rounded-xl p-5">
          <h3 className="text-text-primary font-semibold mb-4">Order Timeline</h3>
          {history.length === 0 ? (
            <p className="text-text-muted text-sm">No updates yet.</p>
          ) : (
            <div className="space-y-0">
              {history.map((h, i) => {
                const s = statusConfig[h.status] || statusConfig.order_placed;
                const SIcon = s.icon;
                const isLast = i === history.length - 1;
                return (
                  <div key={h.id || `${h.status}-${i}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${s.bg}`}>
                        <SIcon size={12} className={s.color + (h.status === 'printing' ? ' animate-spin' : '')} />
                      </div>
                      {!isLast && <div className="w-0.5 flex-1 bg-border-subtle my-1" />}
                    </div>
                    <div className={`pb-4 ${!isLast ? '' : ''}`}>
                      <p className="text-text-primary text-sm font-medium">{s.label}</p>
                      {h.note && <p className="text-text-secondary text-sm mt-0.5">{h.note}</p>}
                      <p className="text-text-muted text-xs mt-1">{new Date(h.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
