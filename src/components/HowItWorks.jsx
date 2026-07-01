import { motion } from 'framer-motion';
import { Image, MessageCircle, PenTool, PackageCheck } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Image,
    title: 'Upload Your Photo',
    description: 'Share a clear, high-resolution photo of your loved one. The better the photo, the better the print.',
  },
  {
    number: '02',
    icon: MessageCircle,
    title: 'Chat with Us on WhatsApp',
    description: 'Our team contacts you to discuss your design preferences, size, and any customizations.',
  },
  {
    number: '03',
    icon: PenTool,
    title: 'We Design & Approve',
    description: 'Our experts craft the 3D model. You get a preview for approval before we hit print.',
  },
  {
    number: '04',
    icon: PackageCheck,
    title: 'Print, Pack & Deliver',
    description: 'Premium 3D printing with high-quality materials, carefully packed and delivered across India.',
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
          <h2 className="text-headline font-black text-white">
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
                <div className="w-20 h-20 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center shadow-card transition-all duration-300 hover:border-accent/40 hover:shadow-glow-orange group">
                  <step.icon size={24} className="text-accent" aria-hidden="true" />
                </div>
                {/* Step number */}
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-white text-[11px] font-black flex items-center justify-center shadow-lg">
                  {step.number.slice(-1)}
                </div>
              </div>

              {/* Large number watermark */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[6rem] font-black text-white/[0.02] select-none pointer-events-none leading-none" aria-hidden="true">
                {step.number}
              </div>

              <h3 className="text-white font-bold text-[15px] mb-2 leading-snug">{step.title}</h3>
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
