import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';

const contactInfo = [
  { icon: Phone, label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
  { icon: Mail, label: 'Email', value: 'hello@printmymemory.in', href: 'mailto:hello@printmymemory.in' },
  { icon: MapPin, label: 'Address', value: 'Mumbai, Maharashtra, India', href: '#' },
  { icon: Clock, label: 'Working Hours', value: 'Mon - Sat: 10AM - 7PM', href: '#' },
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
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
            Get In <span className="text-accent">Touch</span>
          </h1>
          <p className="text-text-secondary max-w-md mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-text-primary mb-6">Contact Information</h2>
            <div className="space-y-4 mb-8">
              {contactInfo.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-4 bg-bg-card border border-border-subtle rounded-xl p-4 hover:border-border-hover transition-colors"
                >
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text-muted text-xs">{item.label}</p>
                    <p className="text-text-primary text-sm font-medium">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden border border-border-subtle">
              <img
                src="/images/model1_raw_generated.jpeg"
                alt="Our Work"
                className="w-full h-48 sm:h-64 object-cover"
              />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-text-primary mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="bg-bg-card border border-border-subtle rounded-2xl p-5 sm:p-6">
              {isSubmitted && (
                <div className="bg-success/10 border border-success/30 text-success rounded-lg p-3 mb-4 text-sm">
                  Thank you! Your message has been sent successfully.
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
                    placeholder="John Doe"
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
                    placeholder="john@example.com"
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
                    placeholder="How can we help?"
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
                    placeholder="Tell us more about your requirements..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Send Message
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
