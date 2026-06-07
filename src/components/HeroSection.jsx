import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, PenTool, Printer, Truck, Star, ArrowRight, ShoppingBag, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  { icon: Upload, label: 'Upload Photo' },
  { icon: PenTool, label: 'We Design' },
  { icon: Printer, label: 'We Print' },
  { icon: Truck, label: 'We Deliver' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const productImages = [
  { src: '/images/globe_front.jpeg', alt: 'Lithophane Lamp', label: 'Lithophane Lamp' },
  { src: '/images/model1_raw.jpeg', alt: '3D Printed Bust', label: '3D Face Miniature' },
  { src: '/images/model1.jpeg', alt: 'Painted Miniature', label: 'Hand-Painted Finish' },
  { src: '/images/model1_raw_generated.jpeg', alt: 'AI Preview', label: 'AI Preview' },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % productImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + productImages.length) % productImages.length);

  return (
    <section className="relative overflow-hidden py-10 sm:py-14 lg:py-20">
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-accent/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          {/* Left Content */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <span className="inline-block bg-accent/10 text-accent text-[11px] sm:text-xs font-semibold tracking-wider px-3 py-1.5 rounded-full mb-5 border border-accent/20">
                PERSONALIZED 3D PRINTED GIFTS
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-[48px] xl:text-[56px] font-extrabold text-text-primary leading-[1.05] mb-5">
              Turn Your Memories Into{' '}
              <span className="text-accent relative">
                Unique 3D Gifts
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M2 6C50 2 150 2 198 6" stroke="#f97316" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
                </svg>
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-text-secondary text-sm sm:text-base leading-relaxed mb-7 max-w-lg">
              We transform your precious moments into beautiful 3D printed keepsakes that last forever.
              <span className="hidden sm:inline"> From photo to physical masterpiece in just a few clicks.</span>
            </motion.p>

            {/* Process Steps */}
            <motion.div variants={itemVariants} className="flex items-center gap-1.5 sm:gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {steps.map((step, index) => (
                <div key={step.label} className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-bg-card border border-border-subtle flex items-center justify-center">
                      <step.icon size={16} className="text-accent" />
                    </div>
                    <span className="text-[10px] text-text-muted whitespace-nowrap">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-4 sm:w-6 h-px bg-border-hover mb-4" />
                  )}
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mb-8">
              <Link
                to="/customize"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 sm:px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5"
              >
                Start Customizing
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-bg-card hover:bg-bg-elevated text-text-primary border border-border-subtle hover:border-border-hover px-5 sm:px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300"
              >
                View Products
                <ShoppingBag size={16} />
              </Link>
            </motion.div>

            {/* Trust */}
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['PS', 'RM', 'AD', 'NK'].map((initials) => (
                  <div
                    key={initials}
                    className="w-7 h-7 rounded-full bg-bg-card border-2 border-bg-primary flex items-center justify-center text-[9px] font-bold text-text-secondary"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-text-primary text-xs sm:text-sm font-medium">Trusted by 5000+ happy customers</p>
                <div className="flex items-center gap-1">
                  <span className="text-text-primary font-bold text-xs sm:text-sm">4.9</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={10} className="text-accent fill-accent" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Image Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-accent/8 rounded-full blur-[80px]" />

              {/* Main Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border-subtle shadow-2xl shadow-black/40">
                {productImages.map((img, index) => (
                  <motion.img
                    key={img.src}
                    src={img.src}
                    alt={img.alt}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={false}
                    animate={{
                      opacity: index === currentSlide ? 1 : 0,
                      scale: index === currentSlide ? 1 : 1.05,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                ))}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bg-primary/90 to-transparent p-4">
                  <p className="text-text-primary font-semibold text-sm">{productImages[currentSlide].label}</p>
                </div>
              </div>

              {/* Navigation */}
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-bg-primary/80 backdrop-blur-sm border border-border-subtle rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-bg-primary/80 backdrop-blur-sm border border-border-subtle rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              >
                <ChevronRight size={16} />
              </button>

              {/* Dots */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide ? 'bg-accent w-5' : 'bg-border-subtle'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Floating cards */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 -left-4 sm:-left-8 bg-bg-card border border-border-subtle rounded-xl p-3 shadow-xl shadow-black/30"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                  <Star size={14} className="text-success fill-success" />
                </div>
                <div>
                  <p className="text-text-primary text-xs font-bold">4.9 Rating</p>
                  <p className="text-text-muted text-[10px]">5000+ reviews</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -top-3 -right-3 sm:-right-6 bg-bg-card border border-border-subtle rounded-xl p-3 shadow-xl shadow-black/30"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Printer size={14} className="text-accent" />
                </div>
                <div>
                  <p className="text-text-primary text-xs font-bold">Premium 3D</p>
                  <p className="text-text-muted text-[10px]">High quality prints</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
