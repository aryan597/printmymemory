import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Package, Heart, Settings, LogOut, Loader2, Save, Camera, Shield, Home } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AddressManager from '../components/AddressManager';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, profile, signOut, updateProfile, isAuthenticated, loading: authLoading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
  });

  // Sync form with profile data whenever it changes
  useEffect(() => {
    if (profile || user) {
      setForm({
        full_name: profile?.full_name || user?.user_metadata?.full_name || '',
        phone: profile?.phone || user?.user_metadata?.phone || '',
        address: profile?.address || '',
        city: profile?.city || '',
        postcode: profile?.postcode || '',
      });
    }
  }, [profile, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    setAvatarUploading(true);
    try {
      // For now, we'll use a data URL since Supabase Storage bucket may not be set up yet
      // In production, this should upload to Supabase Storage 'avatars' bucket
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        await updateProfile({ avatar_url: base64 });
        toast.success('Avatar updated!');
        setAvatarUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload avatar');
      setAvatarUploading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      full_name: profile?.full_name || user?.user_metadata?.full_name || '',
      phone: profile?.phone || user?.user_metadata?.phone || '',
      address: profile?.address || '',
      city: profile?.city || '',
      postcode: profile?.postcode || '',
    });
    setEditing(false);
  };

  if (authLoading) {
    return (
      <main className="py-16 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-accent" />
      </main>
    );
  }

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

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const displayPhone = profile?.phone || user?.user_metadata?.phone || '—';
  const isAdmin = profile?.role === 'admin';

  return (
    <main className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">My Profile</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your account and preferences</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            {/* Profile Card */}
            <div className="bg-bg-card border border-border-subtle rounded-xl p-6 text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-accent/30"
                  />
                ) : (
                  <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center border-2 border-accent/30">
                    <span className="text-accent text-2xl font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent rounded-full flex items-center justify-center cursor-pointer hover:bg-accent-hover transition-colors shadow-lg"
                  title="Change avatar"
                >
                  {avatarUploading ? (
                    <Loader2 size={12} className="text-white animate-spin" />
                  ) : (
                    <Camera size={12} className="text-white" />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                />
              </div>

              <h2 className="text-text-primary font-bold">{displayName}</h2>
              <p className="text-text-muted text-sm mt-1">{user?.email}</p>

              {isAdmin && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wide rounded-full">
                  <Shield size={10} /> Admin
                </div>
              )}

              <button
                onClick={signOut}
                className="mt-4 w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium py-2 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-all"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden">
              <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                <Package size={16} /> My Orders
              </Link>
              <Link to="/community" className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                <Heart size={16} /> Community
              </Link>
              <Link to="/contact" className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                <Mail size={16} /> Support
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-4">
            {/* Personal Information */}
            <div className="bg-bg-card border border-border-subtle rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text-primary">Personal Information</h3>
                <div className="flex items-center gap-2">
                  {editing && (
                    <button
                      onClick={handleCancel}
                      className="text-text-muted text-sm hover:text-text-primary transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => editing ? handleSave() : setEditing(true)}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-accent/10 hover:bg-accent/20 text-accent text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : editing ? <Save size={14} /> : <Settings size={14} />}
                    {editing ? 'Save Changes' : 'Edit Profile'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Full Name</label>
                  {editing ? (
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        value={form.full_name}
                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                        className="w-full bg-bg-primary border border-border-subtle rounded-lg pl-9 pr-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                  ) : (
                    <p className="text-text-primary text-sm py-2.5">{profile?.full_name || user?.user_metadata?.full_name || '—'}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-bg-primary/50 border border-border-subtle rounded-lg pl-9 pr-4 py-2.5 text-text-muted text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Phone</label>
                  {editing ? (
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-bg-primary border border-border-subtle rounded-lg pl-9 pr-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
                        placeholder="+91-7463812249"
                      />
                    </div>
                  ) : (
                    <p className="text-text-primary text-sm py-2.5">{displayPhone}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="text-text-muted text-xs mb-1.5 block">Address</label>
                  {editing ? (
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-3 text-text-muted" />
                      <textarea
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        rows={2}
                        className="w-full bg-bg-primary border border-border-subtle rounded-lg pl-9 pr-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                        placeholder="Street address, landmark..."
                      />
                    </div>
                  ) : (
                    <p className="text-text-primary text-sm py-2.5">{profile?.address || '—'}</p>
                  )}
                </div>

                {/* City & Postcode - side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-text-muted text-xs mb-1.5 block">City</label>
                    {editing ? (
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
                        placeholder="Bangalore"
                      />
                    ) : (
                      <p className="text-text-primary text-sm py-2.5">{profile?.city || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-text-muted text-xs mb-1.5 block">Postcode</label>
                    {editing ? (
                      <input
                        type="text"
                        value={form.postcode}
                        onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                        className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
                        placeholder="560064"
                      />
                    ) : (
                      <p className="text-text-primary text-sm py-2.5">{profile?.postcode || '—'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Manager */}
            <AddressManager userId={user?.id} />

            {/* Account Info Card */}
            <div className="bg-bg-card border border-border-subtle rounded-xl p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Account Type</span>
                  <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${isAdmin ? 'bg-accent/10 text-accent' : 'bg-bg-elevated text-text-secondary'}`}>
                    {profile?.role || 'Customer'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Member Since</span>
                  <span className="text-text-primary text-sm">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">User ID</span>
                  <span className="text-text-muted text-xs font-mono">{user?.id?.slice(0, 12)}...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
