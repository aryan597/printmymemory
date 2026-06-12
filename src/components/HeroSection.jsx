import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
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
      }
    }
    loadProducts();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <p className="text-text-muted text-xs font-medium uppercase tracking-wide mb-4">
              3D Printed Photo Keepsakes
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold text-text-primary leading-[1.08] tracking-tight mb-5">
              Your memories, made physical.
            </h1>
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-8 max-w-md">
              Turn your favorite photos into premium 3D printed art. Personal, timeless, and crafted with care.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Button asChild>
                <Link to="/customize">
                  Start Customizing
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/shop">
                  <ShoppingBag size={16} />
                  Browse Shop
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-text-muted text-xs">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Made in India
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Pan-India Shipping
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Premium Finish
              </span>
            </div>
          </motion.div>

          {/* Right - Image Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] bg-surface border border-border-subtle rounded-xl overflow-hidden">
              <AnimatePresence mode="wait">
                {slides.map((img, index) =>
                  index === currentSlide ? (
                    <motion.div
                      key={img.src + index}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/products/model1.jpeg';
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                        <p className="text-white font-medium text-sm">{img.label}</p>
                      </div>
                    </motion.div>
                  ) : null
                )}
              </AnimatePresence>
            </div>

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

            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-white w-6' : 'bg-border-subtle w-1.5'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
