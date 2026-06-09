import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight, Sparkles, Zap, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

const productImages = [
  { src: '/images/products/globe_front.jpeg', alt: 'Moon Lamp Lithophane', label: 'Moon Lamp Lithophane' },
  { src: '/images/products/model1_raw.jpeg', alt: '3D Printed Bust', label: '3D Face Miniature' },
  { src: '/images/products/model1.jpeg', alt: 'Painted Miniature', label: 'Hand-Painted Finish' },
  { src: '/images/products/model1_raw_generated.jpeg', alt: 'AI Preview', label: 'AI Design Preview' },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % productImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % productImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + productImages.length) % productImages.length);

  return (
    <section className="relative overflow-hidden pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-16 lg:pb-20">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-accent/[0.03] rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3.5 py-1.5 mb-6">
              <Sparkles size={12} className="text-accent" />
              <span className="text-accent text-[11px] font-semibold tracking-wide">
                BOUTIQUE 3D PRINTING STUDIO
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-text-primary leading-[1.08] mb-5">
              Your Photos,{' '}
              <span className="text-accent">Sculpted</span>
              <br />
              Into Reality
            </h1>

            {/* Subheadline */}
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-6 max-w-lg">
              A two-person studio in Bangalore & Bhubaneswar turning your digital memories into tangible, 
              high-quality 3D art pieces — printed on a Bambu Lab printer with love.
            </p>

            {/* Offer Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <div className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 rounded-lg px-3 py-1.5">
                <Zap size={12} className="text-accent" />
                <span className="text-accent text-xs font-semibold">WELCOME10 — 10% OFF</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-pink-400/10 border border-pink-400/20 rounded-lg px-3 py-1.5">
                <Gift size={12} className="text-pink-400" />
                <span className="text-pink-400 text-xs font-semibold">Free Premium Packaging (First 50)</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                to="/customize"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5"
              >
                Start Customizing
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-bg-card hover:bg-bg-elevated text-text-primary border border-border-subtle hover:border-border-hover px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300"
              >
                Browse Collection
                <ShoppingBag size={16} />
              </Link>
            </div>

            {/* Trust Line */}
            <div className="flex items-center gap-4 text-text-muted text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Made in India
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Pan-India Shipping
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                100% Upfront — No COD
              </span>
            </div>
          </motion.div>

          {/* Right - Image Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />

              {/* Main Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border-subtle/60 shadow-2xl shadow-black/50">
                {productImages.map((img, index) => (
                  <motion.img
                    key={img.src}
                    src={img.src}
                    alt={img.alt}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={false}
                    animate={{
                      opacity: index === currentSlide ? 1 : 0,
                      scale: index === currentSlide ? 1 : 1.08,
                    }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                  />
                ))}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bg-primary/95 via-bg-primary/40 to-transparent p-5">
                  <p className="text-text-primary font-semibold text-sm">{productImages[currentSlide].label}</p>
                </div>
              </div>

              {/* Navigation */}
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-bg-primary/90 backdrop-blur-sm border border-border-subtle rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors shadow-lg"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-bg-primary/90 backdrop-blur-sm border border-border-subtle rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors shadow-lg"
              >
                <ChevronRight size={16} />
              </button>

              {/* Dots */}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex gap-2">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-accent w-6' : 'bg-border-subtle w-1.5'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Floating info cards */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-3 -left-4 sm:-left-10 bg-bg-card border border-border-subtle rounded-xl p-3 shadow-xl shadow-black/30"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-accent/15 rounded-lg flex items-center justify-center">
                  <span className="text-accent text-xs font-bold">FDM</span>
                </div>
                <div>
                  <p className="text-text-primary text-xs font-bold">Bambu Lab</p>
                  <p className="text-text-muted text-[10px]">Premium PLA Prints</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -top-4 -right-4 sm:-right-8 bg-bg-card border border-border-subtle rounded-xl p-3 shadow-xl shadow-black/30"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-emerald-400/15 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-400 text-xs font-bold">5-7</span>
                </div>
                <div>
                  <p className="text-text-primary text-xs font-bold">Days Dispatch</p>
                  <p className="text-text-muted text-[10px]">Custom-crafted per order</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
