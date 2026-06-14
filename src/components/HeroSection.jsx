import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ImageIcon, MessageCircle, Printer, Truck } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabaseClient';
import { formatPrice } from '../lib/utils';

const WHATSAPP_NUMBER = '919471725271';

const trustBadges = [
  { icon: Sparkles, label: 'Premium Quality', sub: 'High quality 3D prints' },
  { icon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ), label: 'Secure Payments', sub: 'Razorpay powered' },
  { icon: Printer, label: 'Custom Made', sub: 'Personalized just for you' },
  { icon: Truck, label: 'Fast Delivery', sub: 'Pan India shipping' },
];

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);
  const [heroImages, setHeroImages] = useState([]);
  const [startingPrice, setStartingPrice] = useState(499);
  const [loading, setLoading] = useState(true);

  // Fetch hero images and starting price from Supabase
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        // Get products with images for hero carousel
        const { data: products, error } = await supabase
          .from(TABLES.PRODUCTS)
          .select('id, name, image, price')
          .eq('is_active', true)
          .not('image', 'is', null)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!cancelled) {
          if (products && products.length > 0) {
            const images = products.map(p => ({
              src: p.image,
              alt: p.name,
            }));
            setHeroImages(images);
            // Find minimum price
            const minPrice = Math.min(...products.map(p => p.price || 0));
            if (minPrice > 0) setStartingPrice(minPrice);
          } else {
            setHeroImages([
              { src: '/images/products/hero-1.jpg', alt: '3D printed keepsake' },
              { src: '/images/products/hero-2.jpg', alt: 'Lithophane lamp' },
              { src: '/images/products/hero-3.jpg', alt: 'Custom miniature' },
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to load hero data:', err);
        if (!cancelled) {
          setHeroImages([
            { src: '/images/products/hero-1.jpg', alt: '3D printed keepsake' },
            { src: '/images/products/hero-2.jpg', alt: 'Lithophane lamp' },
            { src: '/images/products/hero-3.jpg', alt: 'Custom miniature' },
          ]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true };
  }, []);

  // Image carousel timer
  useEffect(() => {
    if (heroImages.length === 0) return;
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <section className="relative min-h-screen bg-bg-primary overflow-hidden pt-28" aria-label="Hero section">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 via-transparent to-transparent pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-7rem)] py-8 lg:py-0">

          {/* Left: Text Content */}
          <div className="flex flex-col justify-center order-2 lg:order-1">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="px-3 py-1 rounded-full border border-brand-orange/30 text-brand-orange text-xs font-medium uppercase tracking-wider">
                Personalized 3D Printed Gifts
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-display font-bold text-white mb-5">
              Turn Your Memories
              <br />
              Into Unique{' '}
              <span className="text-brand-orange">3D Gifts</span>
            </h1>

            {/* Subheadline */}
            <p className="text-subhead text-text-secondary max-w-md mb-8">
              We transform your precious moments into beautiful 3D printed keepsakes that last forever.
            </p>

            {/* Process mini-steps */}
            <div className="flex items-center gap-2 mb-8 flex-wrap">
              {[
                { icon: ImageIcon, label: 'Upload Photo' },
                { icon: MessageCircle, label: 'Chat on WhatsApp' },
                { icon: () => (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                ), label: 'Get Design Done' },
                { icon: Truck, label: 'We Print, Ship & Deliver' },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <step.icon size={14} />
                    <span className="text-xs font-medium">{step.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="text-text-muted/50 text-xs">{'>'}</span>
                  )}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent"
              >
                <MessageCircle size={16} aria-hidden="true" />
                Chat on WhatsApp
                <ArrowRight size={16} aria-hidden="true" />
              </a>
              <Link to="/shop" className="btn-secondary">
                View Products
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </Link>
            </div>

            {/* Trust message */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2" aria-label="Customer avatars">
                {['/images/avatars/avatar1.jpg', '/images/avatars/avatar2.jpg', '/images/avatars/avatar3.jpg', '/images/avatars/avatar4.jpg'].map((src, i) => (
                  <div
                    key={`avatar-${i}`}
                    className="w-8 h-8 rounded-full bg-bg-card border-2 border-bg-primary overflow-hidden"
                    aria-hidden="true"
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#333'; }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Let's Build Trust</span>
                <span className="text-xs text-text-muted">One memory at a time</span>
              </div>
            </div>
          </div>

          {/* Right: Product Showcase */}
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden bg-bg-card">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                </div>
              ) : heroImages.length > 0 ? (
                heroImages.map((img, i) => (
                  <img
                    key={img.src + i}
                    src={img.src}
                    alt={img.alt}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      i === currentImage ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    decoding="async"
                    width={600}
                    height={750}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/products/placeholder-hero.jpg';
                    }}
                  />
                ))
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm">
                  No images available
                </div>
              )}

              {/* Dark gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" aria-hidden="true" />

              {/* Floating price tag - dynamic from Supabase */}
              <div className="absolute top-4 right-4 bg-brand-orange text-white rounded-xl px-3 py-2 shadow-lg shadow-brand-orange/20">
                <p className="text-[10px] font-medium opacity-90">Starting at</p>
                <p className="text-lg font-bold">{formatPrice(startingPrice)}</p>
              </div>
            </div>

            {/* Decorative glow */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Trust badges bar */}
      <div className="border-t border-white/5 bg-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center shrink-0">
                  <badge.icon size={18} className="text-brand-orange" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{badge.label}</p>
                  <p className="text-xs text-text-muted">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
