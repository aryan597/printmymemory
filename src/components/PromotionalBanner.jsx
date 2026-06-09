import { motion } from 'framer-motion';
import { Percent, Gift, Truck, Package } from 'lucide-react';

const promos = [
  {
    icon: Percent,
    label: 'WELCOME10',
    title: '10% OFF First Order',
    desc: 'Use code WELCOME10 at checkout',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/20',
  },
  {
    icon: Gift,
    label: 'LIMITED',
    title: 'Free Premium Packaging',
    desc: 'For the first 50 customers only',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/20',
  },
  {
    icon: Truck,
    label: 'PAN-INDIA',
    title: 'Ships All Over India',
    desc: 'From Bangalore to your doorstep',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
  },
  {
    icon: Package,
    label: 'MADE-TO-ORDER',
    title: '100% Custom Made',
    desc: 'No mass production. Every piece is unique.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
];

export default function PromotionalBanner() {
  return (
    <section className="py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {promos.map((promo) => (
            <div
              key={promo.label}
              className={`relative overflow-hidden rounded-xl border ${promo.border} ${promo.bg} p-4 sm:p-5 hover:border-opacity-50 transition-colors`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg ${promo.bg} flex items-center justify-center shrink-0`}>
                  <promo.icon size={18} className={promo.color} />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-text-muted uppercase mb-0.5">
                    {promo.label}
                  </p>
                  <p className="text-text-primary font-semibold text-sm leading-tight">{promo.title}</p>
                  <p className="text-text-muted text-[11px] mt-0.5">{promo.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
