import { motion } from 'framer-motion';
import { Truck, Package, MapPin, Clock, AlertTriangle } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <main className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
            Shipping <span className="text-accent">Policy</span>
          </h1>
          <p className="text-text-secondary">How we get your custom print from Bangalore to your door</p>
        </motion.div>

        <div className="space-y-8">
          <Section icon={Clock} title="Production Timeline" color="text-accent">
            <p className="text-text-secondary text-sm leading-relaxed mb-3">
              Every product is made to order. We do not hold inventory because every piece is unique to you.
            </p>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span><span><strong>Design Preview:</strong> Sent within 24 hours of order + photo upload</span></li>
              <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span><span><strong>Approval Window:</strong> 48 hours to request changes. No response = automatic approval</span></li>
              <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span><span><strong>Print Time:</strong> 1.5 hours (bookmarks) to 11 hours (moon lamps)</span></li>
              <li className="flex items-start gap-2"><span className="text-accent mt-1">•</span><span><strong>Total Dispatch:</strong> 5-7 business days from order confirmation</span></li>
            </ul>
          </Section>

          <Section icon={Truck} title="Shipping Partners & Costs" color="text-cyan-400">
            <p className="text-text-secondary text-sm leading-relaxed mb-3">
              We ship pan-India using Shiprocket, which aggregates multiple courier partners (Delhivery, India Post Speed Post, etc.).
            </p>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li className="flex items-start gap-2"><span className="text-cyan-400 mt-1">•</span><span><strong>Standard Shipping:</strong> ₹60 - ₹85 per order (weight-based, under 500g)</span></li>
              <li className="flex items-start gap-2"><span className="text-cyan-400 mt-1">•</span><span><strong>Delivery Time:</strong> 3-7 business days after dispatch (metro cities faster)</span></li>
              <li className="flex items-start gap-2"><span className="text-cyan-400 mt-1">•</span><span><strong>Tracking:</strong> Provided via WhatsApp/Email once dispatched</span></li>
            </ul>
          </Section>

          <Section icon={Package} title="Packaging" color="text-pink-400">
            <p className="text-text-secondary text-sm leading-relaxed mb-3">
              We care about the unboxing experience as much as the product itself.
            </p>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li className="flex items-start gap-2"><span className="text-pink-400 mt-1">•</span><span>Brown kraft paper box (12×12×12 cm) — locally sourced from Bangalore</span></li>
              <li className="flex items-start gap-2"><span className="text-pink-400 mt-1">•</span><span>Internal paper shred cushioning</span></li>
              <li className="flex items-start gap-2"><span className="text-pink-400 mt-1">•</span><span>Organic jute twine exterior styling</span></li>
              <li className="flex items-start gap-2"><span className="text-pink-400 mt-1">•</span><span>Custom die-cut logo sticker</span></li>
              <li className="flex items-start gap-2"><span className="text-pink-400 mt-1">•</span><span>Premium heavy-cardstock care note</span></li>
            </ul>
          </Section>

          <Section icon={AlertTriangle} title="Important Notes" color="text-yellow-400">
            <ul className="space-y-2 text-text-secondary text-sm">
              <li className="flex items-start gap-2"><span className="text-yellow-400 mt-1">•</span><span>We do NOT offer Cash on Delivery (COD). All orders require 100% upfront payment.</span></li>
              <li className="flex items-start gap-2"><span className="text-yellow-400 mt-1">•</span><span>Custom products cannot be returned. Please review your design preview carefully.</span></li>
              <li className="flex items-start gap-2"><span className="text-yellow-400 mt-1">•</span><span>In case of transit damage, a continuous unedited unboxing video is required for replacement.</span></li>
            </ul>
          </Section>
        </div>
      </div>
    </main>
  );
}

function Section({ icon: Icon, title, color, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-bg-card border border-border-subtle rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('400', '400/10').replace('accent', 'accent/10')}`}>
          <Icon size={18} className={color} />
        </div>
        <h2 className="text-text-primary font-semibold text-lg">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}
