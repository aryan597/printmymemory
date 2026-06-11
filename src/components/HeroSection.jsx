import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight, Sparkles, Zap, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, TABLES } from '../lib/supabaseClient';
import Button from './ui/Button';
import IconButton from './ui/IconButton';

const fallbackImages = [
  { src: '/images/products/globe_front.jpeg', alt: 'Moon Lamp Lithophane', label: 'Moon Lamp Lithophane' },
  { src: '/images/products/model1_raw.jpeg', alt: '3D Printed Bust', label: '3D Face Miniature' },
  { src: '/images/products/model1.jpeg', alt: 'Painted Miniature', label: 'Hand-Painted Finish' },
  { src: '/images/products/model1_raw_generated.jpeg', alt: 'AI Preview', label: 'AI Design Preview' },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [productSlides, setProductSlides] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const slides = productSlides || fallbackImages;

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from(TABLES.PRODUCTS)
          .select('id, name, image')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(6);
        if (!cancelled) {
          if (error) throw error;
          if (data && data.length > 0) {
            setProductSlides(
              data.map((p) => ({
                src: p.image,
                alt: p.name,
                label: p.name,
                productId: p.id,
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to load hero products:', err);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }
    loadProducts();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative overflow-hidden pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-16 lg:pb-20">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-accent/10 rounded-full blur-[150px] animate-blob" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] animate-blob" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '-8s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
              <Sparkles size={12} className="text-accent" />
              <span className="text-accent text-[11px] font-semibold tracking-wide">
                BOUTIQUE 3D PRINTING STUDIO
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold leading-[1.08] mb-5">
              Your Photos,{' '}
              <span className="gradient-text">Sculpted</span>
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
              <div className="inline-flex items-center gap-1.5 glass rounded-full px-3.5 py-1.5 border-accent/20">
                <Zap size={12} className="text-accent" />
                <span className="text-accent text-xs font-semibold">WELCOME10 — 10% OFF</span>
              </div>
              <div className="inline-flex items-center gap-1.5 glass rounded-full px-3.5 py-1.5 border-pink-400/20">
                <Gift size={12} className="text-pink-400" />
                <span className="text-pink-400 text-xs font-semibold">Free Premium Packaging</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Button asChild>
                <Link to="/customize">
                  Start Customizing
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/shop">
                  Browse Collection
                  <ShoppingBag size={16} />
                </Link>
              </Button>
            </div>

            {/* Trust Line */}
            <div className="flex flex-wrap items-center gap-4 text-text-muted text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                Made in India
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                Pan-India Shipping
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                Premium PLA
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
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-accent/10 rounded-full blur-[120px]" />

              {/* Main Image Frame */}
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden gradient-border shadow-glass-lg">
                <div className="absolute inset-0 bg-bg-primary/30 backdrop-blur-sm" />
                <AnimatePresence mode="wait">
                  {slides.map((img, index) =>
                    index === currentSlide ? (
                      <motion.img
                        key={img.src + index}
                        src={img.src}
                        alt={img.alt}
                        className="absolute inset-0 w-full h-full object-cover"
                        initial={{ opacity: 0, scale: 1.08 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.7, ease: 'easeInOut' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/products/model1.jpeg';
                        }}
                      />
                    ) : null
                  )}
                </AnimatePresence>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bg-primary/95 via-bg-primary/40 to-transparent p-5">
                  <p className="text-text-primary font-semibold text-sm">{slides[currentSlide].label}</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <IconButton onClick={prevSlide} aria-label="Previous slide">
                  <ChevronLeft size={18} />
                </IconButton>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <IconButton onClick={nextSlide} aria-label="Next slide">
                  <ChevronRight size={18} />
                </IconButton>
              </div>

              {/* Dots */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-accent w-7 shadow-glow-sm' : 'bg-glass-border-strong w-2 hover:bg-white/30'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Floating info cards */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-3 -left-4 sm:-left-10 glass-strong p-3.5 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center">
                  <span className="text-accent text-xs font-bold">FDM</span>
                </div>
                <div>
                  <p className="text-text-primary text-xs font-bold">Bambu Lab</p>
                  <p className="text-text-muted text-[10px]">Premium PLA Prints</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -top-4 -right-4 sm:-right-8 glass-strong p-3.5 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400/20 to-emerald-400/5 border border-emerald-400/20 flex items-center justify-center">
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
