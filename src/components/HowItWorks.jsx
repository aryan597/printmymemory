import { motion } from 'framer-motion';
import { Upload, Box, CreditCard, Printer, Truck } from 'lucide-react';

const steps = [
  { icon: Upload, title: 'Upload Photo', description: 'Share a clear photo you want to preserve.' },
  { icon: Box, title: 'Choose Product', description: 'Pick from lamps, miniatures, keychains, and more.' },
  { icon: CreditCard, title: 'Pay Securely', description: 'Checkout with Razorpay. Cards, UPI, and netbanking.' },
  { icon: Printer, title: 'We Print', description: 'Your design is 3D printed and quality checked.' },
  { icon: Truck, title: 'Delivered', description: 'Packed with care and shipped across India.' },
];

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-20 bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-text-muted text-xs font-medium uppercase tracking-wide mb-2">How It Works</p>
          <h2 className="section-title">Simple. Transparent. Personal.</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 border border-border-subtle rounded-lg flex items-center justify-center mx-auto mb-4">
                <step.icon size={20} className="text-white" />
              </div>
              <h3 className="text-text-primary font-medium text-sm mb-1">{step.title}</h3>
              <p className="text-text-secondary text-xs leading-relaxed max-w-[180px] mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
