import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, Loader2, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const contactMethods = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+91-7463812249',
    href: 'https://wa.me/917463812249',
    description: 'Fastest response. Usually replies within minutes.',
    color: 'text-whatsapp',
    bg: 'bg-whatsapp/10',
    border: 'border-whatsapp/20',
  },
  {
    icon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>,
    label: 'Instagram DM',
    value: '@printmymemory.in',
    href: 'https://instagram.com/printmymemory.in',
    description: 'Slide into our DMs. We are always online.',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/20',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@printmymemory.in',
    href: 'mailto:hello@printmymemory.in',
    description: 'For detailed queries and bulk orders.',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/20',
  },
  {
    icon: Phone,
    label: 'Call',
    value: '+91-7463812249',
    href: 'tel:+917463812249',
    description: 'Mon-Sat, 10AM - 7PM. Might go to voicemail.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('contact_submissions').insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      if (error) {
        if (error.message?.includes('does not exist')) {
          const subject = encodeURIComponent(`[PrintMyMemory] ${formData.subject}`);
          const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`);
          window.location.href = `mailto:hello@printmymemory.in?subject=${subject}&body=${body}`;
          toast.success('Opening your email client...');
        } else {
          throw error;
        }
      } else {
        toast.success('Message sent! We will get back to you soon.');
      }
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 4000);
    } catch (err) {
      toast.error(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
            Let's <span className="text-accent">Talk</span>
          </h1>
          <p className="text-text-secondary max-w-md mx-auto">
            No chatbots. No ticket numbers. Just real people who actually care.
          </p>
        </motion.div>

        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.label}
              href={method.href}
              target={method.href.startsWith('http') ? '_blank' : undefined}
              rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`group bg-bg-card border ${method.border} rounded-2xl p-5 hover:border-opacity-50 transition-all hover:-translate-y-1`}
            >
              <div className={`w-11 h-11 ${method.bg} rounded-xl flex items-center justify-center mb-3`}>
                {typeof method.icon === 'function' ? <span className={method.color}><method.icon /></span> : <method.icon size={20} className={method.color} />}
              </div>
              <p className="text-text-muted text-[10px] font-bold tracking-wider uppercase mb-1">{method.label}</p>
              <p className="text-text-primary font-semibold text-sm mb-1">{method.value}</p>
              <p className="text-text-secondary text-xs">{method.description}</p>
            </motion.a>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-text-primary mb-6">Drop a Message</h2>
            <form onSubmit={handleSubmit} className="bg-bg-card border border-border-subtle rounded-2xl p-5 sm:p-6">
              {isSubmitted && (
                <div className="bg-success/10 border border-success/30 text-success rounded-lg p-3 mb-4 text-sm">
                  Thanks! Your message has been sent successfully.
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="text-text-secondary text-sm mb-1.5 block">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                    placeholder="Amit Sharma"
                  />
                </div>
                <div>
                  <label className="text-text-secondary text-sm mb-1.5 block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                    placeholder="amit@example.com"
                  />
                </div>
                <div>
                  <label className="text-text-secondary text-sm mb-1.5 block">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                    placeholder="How do I customize a lamp?"
                  />
                </div>
                <div>
                  <label className="text-text-secondary text-sm mb-1.5 block">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                    placeholder="Tell us what you need..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6">
              <h3 className="text-text-primary font-semibold mb-4">Working Hours</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-text-secondary text-sm">
                  <Clock size={16} className="text-accent shrink-0" />
                  <span>Mon - Sat: 10:00 AM - 7:00 PM IST</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary text-sm">
                  <Clock size={16} className="text-text-muted shrink-0" />
                  <span>Sunday: Closed (printer needs rest too)</span>
                </div>
              </div>
            </div>

            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6">
              <h3 className="text-text-primary font-semibold mb-4">Production Location</h3>
              <div className="flex items-start gap-3 text-text-secondary text-sm">
                <MapPin size={16} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-text-primary font-medium">Jakkur, Bangalore</p>
                  <p className="text-text-muted text-xs">Karnataka 560064, India</p>
                  <p className="text-text-muted text-xs mt-1">Branding & packaging coordinated from Bhubaneswar, Odisha</p>
                </div>
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6">
              <h3 className="text-accent font-semibold mb-2">Pro Tip</h3>
              <p className="text-text-secondary text-sm">
                For fastest response, DM us on Instagram or WhatsApp. We typically reply within a few hours. 
                Email is best for detailed bulk order enquiries.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
