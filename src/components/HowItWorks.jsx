import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Printer, Truck } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: MessageSquare,
    title: 'Tell us your idea',
    description: 'Describe it or drop a photo in the chat. Our AI concierge figures out exactly what you want to print.',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'We find or design it',
    description: 'From our own catalogue, our library of print-ready designs, or custom-made just for you. You always see it first.',
  },
  {
    number: '03',
    icon: Printer,
    title: 'We 3D print it',
    description: 'Precision-printed and hand-finished in our Bangalore studio with premium materials.',
  },
  {
    number: '04',
    icon: Truck,
    title: 'Delivered to your door',
    description: 'Securely packed and shipped across India, usually within 48 hours. Prepaid, no surprises.',
  },
];

export default function HowItWorks() {
  return (
    <section className="section-padding bg-bg-secondary relative overflow-hidden" aria-label="How it works">
      {/* Background grid */}
      <div className="absolute inset-0 line-grid opacity-40 pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto container-padding relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="section-label mx-auto mb-4 w-fit">The Process</div>
          <h2 className="text-headline font-black uppercase text-text-primary">
            How It Works
          </h2>
          <p className="text-text-muted text-sm mt-3 max-w-md mx-auto leading-relaxed">
            Four simple steps to turn your photo into a stunning 3D memory.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 relative">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px pointer-events-none z-0" aria-hidden="true">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-border-strong to-transparent" />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center text-center lg:items-center lg:text-center"
            >
              {/* Step icon ring */}
              <div className="relative mb-5 z-10">
                <div className="w-20 h-20 bg-bg-card border-2 border-border flex items-center justify-center tb-shadow">
                  <step.icon size={24} className="text-accent" aria-hidden="true" />
                </div>
                {/* Step number */}
                <div className="absolute -top-2.5 -right-2.5 w-8 h-8 bg-accent text-white text-[12px] font-black flex items-center justify-center border-2 border-border">
                  {step.number.slice(-1)}
                </div>
              </div>

              {/* Large number watermark */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[6rem] font-black text-text-primary/[0.04] select-none pointer-events-none leading-none" aria-hidden="true">
                {step.number}
              </div>

              <h3 className="text-text-primary font-bold uppercase text-[15px] mb-2 leading-snug">{step.title}</h3>
              <p className="text-text-muted text-[13px] leading-relaxed max-w-[200px]">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-14"
        >
          <a
            href={`https://wa.me/919471725271?text=Hi! I want to create a personalized 3D gift.`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Start Your Order
          </a>
        </motion.div>
      </div>
    </section>
  );
}
