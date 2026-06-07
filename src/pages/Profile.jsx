import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Package, Heart, Settings, LogOut, Loader2, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, profile, signOut, updateProfile, isAuthenticated } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || user?.user_metadata?.full_name || '',
    phone: profile?.phone || user?.user_metadata?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="py-16 sm:py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <User size={48} className="text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Please sign in</h2>
          <p className="text-text-secondary text-sm mb-6">Sign in to view your profile</p>
          <Link to="/login" className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">My Profile</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your account and preferences</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-bg-card border border-border-subtle rounded-xl p-6 text-center">
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-accent text-2xl font-bold">
                  {(profile?.full_name || user?.email)?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-text-primary font-bold">{profile?.full_name || user?.user_metadata?.full_name || 'User'}</h2>
              <p className="text-text-muted text-sm mt-1">{user?.email}</p>
              <button
                onClick={signOut}
                className="mt-4 w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium py-2 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-all"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>

            <div className="mt-4 bg-bg-card border border-border-subtle rounded-xl overflow-hidden">
              <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                <Package size={16} /> My Orders
              </Link>
              <Link to="/community" className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                <Heart size={16} /> Community
              </Link>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                <Settings size={16} /> Settings
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-bg-card border border-border-subtle rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text-primary">Personal Information</h3>
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-accent text-sm font-medium hover:underline"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : editing ? <Save size={14} /> : <Settings size={14} />}
                  {editing ? 'Save' : 'Edit'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-text-muted text-xs mb-1 block">Full Name</label>
                  {editing ? (
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        value={form.full_name}
                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                        className="w-full bg-bg-primary border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-text-primary text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                  ) : (
                    <p className="text-text-primary text-sm">{profile?.full_name || user?.user_metadata?.full_name || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="text-text-muted text-xs mb-1 block">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-bg-primary border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-text-muted text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-text-muted text-xs mb-1 block">Phone</label>
                  {editing ? (
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-bg-primary border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-text-primary text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                  ) : (
                    <p className="text-text-primary text-sm">{profile?.phone || user?.user_metadata?.phone || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="text-text-muted text-xs mb-1 block">Address</label>
                  {editing ? (
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-3 text-text-muted" />
                      <textarea
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        rows={2}
                        className="w-full bg-bg-primary border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-text-primary text-sm focus:outline-none focus:border-accent resize-none"
                      />
                    </div>
                  ) : (
                    <p className="text-text-primary text-sm">{profile?.address || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="text-text-muted text-xs mb-1 block">City</label>
                  {editing ? (
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2 text-text-primary text-sm focus:outline-none focus:border-accent"
                    />
                  ) : (
                    <p className="text-text-primary text-sm">{profile?.city || '—'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
