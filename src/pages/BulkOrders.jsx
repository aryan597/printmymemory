import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, ArrowRight, Package, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const benefits = [
  'Volume pricing discounts (10+ units)',
  'Custom branding & logo stickers',
  'Dedicated timeline & priority printing',
  'Bulk packaging options',
  'Invoice & GST billing available',
];

export default function BulkOrders() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', quantity: '', product: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = encodeURIComponent(
        `*Bulk Order Enquiry*\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nProduct: ${formData.product}\nQuantity: ${formData.quantity}\nMessage: ${formData.message}`
      );
      window.open(`https://wa.me/917463812249?text=${body}`, '_blank');
      toast.success('Opening WhatsApp with your enquiry!');
      setFormData({ name: '', email: '', phone: '', quantity: '', product: '', message: '' });
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
            Bulk & Corporate <span className="text-accent">Orders</span>
          </h1>
          <p className="text-text-secondary max-w-lg mx-auto">
            Whether it is wedding favours, corporate gifts, or event merchandise — we handle bulk with the same personal care.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 sm:p-8 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Users size={18} className="text-accent" />
                </div>
                <h2 className="text-text-primary font-semibold text-lg">Why Bulk With Us?</h2>
              </div>
              <ul className="space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-text-secondary text-sm">
                    <CheckCircle size={16} className="text-accent shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-400/10 rounded-xl flex items-center justify-center">
                  <Package size={18} className="text-emerald-400" />
                </div>
                <h2 className="text-text-primary font-semibold text-lg">Popular Bulk Products</h2>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Personalized Bookmarks', price: '₹149 - ₹249', desc: 'Perfect for book clubs & schools' },
                  { name: 'Custom Keychains', price: '₹199 - ₹399', desc: 'Corporate events & conferences' },
                  { name: 'Mini Busts (Painted)', price: '₹1,499+', desc: 'Executive gifts & anniversaries' },
                  { name: 'Lithophane Lamps', price: '₹799', desc: 'Wedding favours & special occasions' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                    <div>
                      <p className="text-text-primary text-sm font-medium">{item.name}</p>
                      <p className="text-text-muted text-xs">{item.desc}</p>
                    </div>
                    <span className="text-accent text-sm font-semibold">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-text-primary mb-6">Get a Quote</h2>
            <form onSubmit={handleSubmit} className="bg-bg-card border border-border-subtle rounded-2xl p-5 sm:p-6 space-y-4">
              <div>
                <label className="text-text-secondary text-sm mb-1.5 block">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                  placeholder="Rahul Sharma"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-secondary text-sm mb-1.5 block">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                    placeholder="rahul@company.com"
                  />
                </div>
                <div>
                  <label className="text-text-secondary text-sm mb-1.5 block">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                    placeholder="+91-9876543210"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-secondary text-sm mb-1.5 block">Product</label>
                  <select
                    required
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="">Select...</option>
                    <option value="Bookmarks">Personalized Bookmarks</option>
                    <option value="Keychains">Custom Keychains</option>
                    <option value="Lamps">Lithophane Lamps</option>
                    <option value="Mini Busts">3D Mini Busts</option>
                    <option value="Mixed">Mixed / Custom</option>
                  </select>
                </div>
                <div>
                  <label className="text-text-secondary text-sm mb-1.5 block">Quantity</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                    placeholder="50"
                  />
                </div>
              </div>
              <div>
                <label className="text-text-secondary text-sm mb-1.5 block">Additional Details</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Any specific requirements, branding needs, or deadlines..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                Send via WhatsApp
                <ArrowRight size={16} />
              </button>
              <p className="text-text-muted text-xs text-center">
                This will open WhatsApp with your enquiry pre-filled. You can edit before sending.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
