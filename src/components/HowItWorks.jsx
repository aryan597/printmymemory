import { motion } from 'framer-motion';
import { MessageCircle, ImageIcon, CreditCard, Printer, Truck } from 'lucide-react';

const steps = [
  {
    icon: MessageCircle,
    title: 'DM Us on Instagram',
    description: 'Slide into our DMs or use this site to tell us what you want',
  },
  {
    icon: ImageIcon,
    title: 'Upload Your Photo',
    description: 'Share a high-res photo + any text or font preferences',
  },
  {
    icon: CreditCard,
    title: 'Pay 100% Upfront',
    description: 'Secure UPI/Card payment. No COD for custom orders.',
  },
  {
    icon: Printer,
    title: 'We Print It',
    description: 'Your design is sliced, printed on our Bambu Lab, and quality-checked',
  },
  {
    icon: Truck,
    title: 'Delivered in 5-7 Days',
    description: 'Packed with eco-friendly materials and shipped pan-India',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-20 bg-bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-14"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            How It <span className="text-accent">Works</span>
          </h2>
          <p className="text-text-secondary text-sm sm:text-base max-w-md mx-auto">
            Simple. Transparent. No corporate BS.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative text-center group"
            >
              <div className="relative inline-flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center mb-4 group-hover:border-accent/40 group-hover:bg-accent/5 transition-all">
                  <step.icon size={22} className="text-accent" />
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-full w-full h-px bg-border-subtle" />
                )}
              </div>
              <h3 className="text-text-primary font-semibold text-sm sm:text-base mb-1">
                {step.title}
              </h3>
              <p className="text-text-secondary text-xs sm:text-sm max-w-[180px] mx-auto leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
