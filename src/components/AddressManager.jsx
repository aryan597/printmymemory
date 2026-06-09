import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, MapPin, Home, Briefcase, Star, X, Loader2, Check } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const LABEL_ICONS = {
  Home: Home,
  Work: Briefcase,
  Other: MapPin,
};

export default function AddressManager({ userId }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    label: 'Home',
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postcode: '',
    is_default: false,
  });

  useEffect(() => {
    if (userId) loadAddresses();
  }, [userId]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLES.ADDRESSES)
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAddresses(data || []);
    } catch (err) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      label: 'Home',
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postcode: '',
      is_default: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (addr) => {
    setForm({
      label: addr.label || 'Home',
      full_name: addr.full_name || '',
      phone: addr.phone || '',
      address_line1: addr.address_line1 || '',
      address_line2: addr.address_line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      postcode: addr.postcode || '',
      is_default: addr.is_default || false,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.address_line1.trim()) {
      toast.error('Address line 1 is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        user_id: userId,
      };

      // If setting this as default, unset others first
      if (form.is_default) {
        await supabase
          .from(TABLES.ADDRESSES)
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      if (editingId) {
        const { error } = await supabase
          .from(TABLES.ADDRESSES)
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Address updated');
      } else {
        const { error } = await supabase
          .from(TABLES.ADDRESSES)
          .insert(payload);
        if (error) throw error;
        toast.success('Address added');
      }

      resetForm();
      loadAddresses();
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      const { error } = await supabase
        .from(TABLES.ADDRESSES)
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Address deleted');
      loadAddresses();
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  const setDefault = async (id) => {
    try {
      await supabase
        .from(TABLES.ADDRESSES)
        .update({ is_default: false })
        .eq('user_id', userId);
      const { error } = await supabase
        .from(TABLES.ADDRESSES)
        .update({ is_default: true })
        .eq('id', id);
      if (error) throw error;
      loadAddresses();
    } catch (err) {
      toast.error('Failed to set default');
    }
  };

  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-text-primary">Delivery Addresses</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-accent/10 hover:bg-accent/20 text-accent text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={14} /> Add New
          </button>
        )}
      </div>

      {/* Address Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-bg-primary border border-border-subtle rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-text-primary font-semibold text-sm">
                  {editingId ? 'Edit Address' : 'New Address'}
                </h4>
                <button onClick={resetForm} className="text-text-muted hover:text-text-primary">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Label</label>
                  <select
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    className="w-full bg-bg-card border border-border-subtle rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                  >
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full bg-bg-card border border-border-subtle rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                    placeholder="Recipient name"
                  />
                </div>
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1.5 block">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-bg-card border border-border-subtle rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1.5 block">Address Line 1 *</label>
                <input
                  type="text"
                  value={form.address_line1}
                  onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                  className="w-full bg-bg-card border border-border-subtle rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                  placeholder="Street, building, locality..."
                />
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1.5 block">Address Line 2</label>
                <input
                  type="text"
                  value={form.address_line2}
                  onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
                  className="w-full bg-bg-card border border-border-subtle rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                  placeholder="Apartment, floor, landmark (optional)"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-bg-card border border-border-subtle rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                    placeholder="Bangalore"
                  />
                </div>
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full bg-bg-card border border-border-subtle rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                    placeholder="Karnataka"
                  />
                </div>
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Postcode</label>
                  <input
                    type="text"
                    value={form.postcode}
                    onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                    className="w-full bg-bg-card border border-border-subtle rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                    placeholder="560064"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-text-secondary text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  className="accent-accent"
                />
                Set as default delivery address
              </label>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {editingId ? 'Update Address' : 'Save Address'}
                </button>
                <button
                  onClick={resetForm}
                  className="text-text-muted hover:text-text-primary text-sm px-3 py-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin text-accent" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8">
          <MapPin size={28} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary text-sm">No saved addresses yet.</p>
          <p className="text-text-muted text-xs mt-1">Add one to speed up checkout.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const Icon = LABEL_ICONS[addr.label] || MapPin;
            return (
              <div
                key={addr.id}
                className={`relative border rounded-xl p-4 transition-colors ${
                  addr.is_default
                    ? 'border-accent/40 bg-accent/5'
                    : 'border-border-subtle bg-bg-primary hover:border-border-default'
                }`}
              >
                {addr.is_default && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    <Star size={10} /> Default
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-bg-card border border-border-subtle flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} className="text-text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-semibold">
                      {addr.label}
                      {addr.full_name && <span className="text-text-muted font-normal"> · {addr.full_name}</span>}
                    </p>
                    <p className="text-text-secondary text-sm mt-0.5">{addr.address_line1}</p>
                    {addr.address_line2 && <p className="text-text-muted text-xs">{addr.address_line2}</p>}
                    <p className="text-text-muted text-xs mt-1">
                      {addr.city}{addr.city && addr.state ? ', ' : ''}{addr.state} {addr.postcode}
                    </p>
                    {addr.phone && <p className="text-text-muted text-xs mt-0.5">{addr.phone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {!addr.is_default && (
                    <button
                      onClick={() => setDefault(addr.id)}
                      className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(addr)}
                    className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <Pencil size={10} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="flex items-center gap-1 text-xs text-text-secondary hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={10} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
