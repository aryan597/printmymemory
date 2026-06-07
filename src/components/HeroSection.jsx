import { motion } from 'framer-motion';
import { Upload, PenTool, Printer, Truck, Star, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  { icon: Upload, label: 'Upload Photo' },
  { icon: PenTool, label: 'We Design' },
  { icon: Printer, label: 'We Print' },
  { icon: Truck, label: 'We Deliver' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const imageVariants = {
  hidden: { opacity: 0, x: 60, rotate: 5 },
  visible: { opacity: 1, x: 0, rotate: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-accent/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-block bg-accent/10 text-accent text-xs font-semibold tracking-wider px-3 py-1.5 rounded-full mb-6 border border-accent/20">
                PERSONALIZED 3D PRINTED GIFTS
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-[56px] font-bold text-text-primary leading-[1.1] mb-5"
            >
              Turn Your Memories Into Unique{' '}
              <span className="text-accent">3D Gifts</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-text-secondary text-base sm:text-lg leading-relaxed mb-8 max-w-lg"
            >
              We transform your precious moments into beautiful 3D printed keepsakes that last forever.
            </motion.p>

            {/* Process Steps */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 sm:gap-4 mb-8 flex-wrap"
            >
              {steps.map((step, index) => (
                <div key={step.label} className="flex items-center gap-2 sm:gap-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-bg-card border border-border-subtle flex items-center justify-center">
                      <step.icon size={18} className="text-accent" />
                    </div>
                    <span className="text-[10px] sm:text-xs text-text-muted">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <span className="text-text-muted text-xs mb-4">&gt;</span>
                  )}
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mb-8">
              <Link
                to="/customize"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5"
              >
                Start Customizing
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-bg-card hover:bg-bg-elevated text-text-primary border border-border-subtle hover:border-border-hover px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                View Products
                <ShoppingBag size={18} />
              </Link>
            </motion.div>

            {/* Trust */}
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-bg-card border-2 border-bg-primary flex items-center justify-center text-[10px] font-medium text-text-secondary"
                  >
                    {['PS', 'RM', 'AD', 'NK'][i - 1]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-text-primary text-sm font-medium">Trusted by 5000+ happy customers</p>
                <div className="flex items-center gap-1">
                  <span className="text-text-primary font-bold text-sm">4.9</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={12} className="text-accent fill-accent" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Images */}
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            className="relative hidden lg:block"
          >
            <div className="relative h-[500px] w-full">
              {/* Glow behind images */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[80px]" />
              
              {/* Globe lamp - main */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 right-0 w-[280px] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-border-subtle"
              >
                <img
                  src="/images/globe_front.jpeg"
                  alt="Lithophane Lamp"
                  className="w-full h-auto object-cover"
                />
              </motion.div>

              {/* Raw model - floating left */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-10 left-0 w-[200px] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-border-subtle"
              >
                <img
                  src="/images/model1_raw.jpeg"
                  alt="3D Printed Bust"
                  className="w-full h-auto object-cover"
                />
              </motion.div>

              {/* Painted model - small floating */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-20 left-10 w-[160px] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-border-subtle"
              >
                <img
                  src="/images/model1.jpeg"
                  alt="Painted 3D Miniature"
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Mobile Image */}
          <div className="lg:hidden">
            <div className="relative rounded-2xl overflow-hidden border border-border-subtle shadow-xl">
              <img
                src="/images/globe_front.jpeg"
                alt="Lithophane Lamp"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
