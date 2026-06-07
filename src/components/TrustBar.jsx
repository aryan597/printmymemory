import { motion } from 'framer-motion';
import { Award, Settings, Truck, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'High quality 3D prints',
  },
  {
    icon: Settings,
    title: 'Custom Made',
    description: 'Personalized just for you',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Pan India shipping',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: '100% secure checkout',
  },
];

export default function TrustBar() {
  return (
    <section className="py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-bg-card border border-border-subtle rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:border-border-hover transition-colors"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <feature.icon size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="text-text-primary font-semibold text-sm sm:text-base">{feature.title}</h3>
                <p className="text-text-muted text-xs sm:text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
