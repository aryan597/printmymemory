import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Gem, Shield, Clock, Truck } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabaseClient';
import { formatPrice } from '../lib/utils';

const WHATSAPP_NUMBER = '919471725271';

const WaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.72 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const trustBadges = [
  { icon: Gem, label: 'Premium Quality' },
  { icon: Clock, label: 'Ships in 48hrs' },
  { icon: Truck, label: 'Pan India Delivery' },
  { icon: Shield, label: 'Secure Payments' },
];

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentSlide = heroImages[currentImage] ?? null;

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const { data: products } = await supabase
          .from(TABLES.PRODUCTS)
          .select('id, name, image, price')
          .eq('is_active', true)
          .not('image', 'is', null)
          .order('created_at', { ascending: false })
          .limit(6);

        if (!cancelled && products?.length > 0) {
          setHeroImages(products.map(p => ({ src: p.image, alt: p.name, price: p.price || 499 })));
        }
      } catch (err) {
        console.error('Hero data load failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % heroImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <>
      {/* SEO structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "PrintMyMemory",
        "description": "Turn your memories into personalized 3D printed gifts. Custom miniatures, lithophane lamps, and more. Handcrafted in Bangalore.",
        "url": "https://printmymemory.ind.in",
        "logo": "https://printmymemory.ind.in/logo.png",
        "contactPoint": { "@type": "ContactPoint", "telephone": "+91-94717-25271", "contactType": "customer service" },
        "sameAs": ["https://instagram.com/print.my.memory"]
      })}} />

      <section
        className="relative min-h-[100dvh] bg-bg-primary overflow-hidden"
        aria-label="Hero - Personalized 3D Printed Gifts"
      >
        {/* Background: dot grid + glow blobs */}
        <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" aria-hidden="true" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-accent/8 blur-[120px] pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-[100px] pointer-events-none" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-center min-h-[100dvh] pt-24 pb-8 lg:pt-0 lg:pb-0">

            {/* ── Left: Copy ── */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left max-w-2xl mx-auto lg:mx-0 lg:py-24">

              {/* Label pill */}
              <div className="section-label mb-6">
                <Sparkles size={11} aria-hidden="true" />
                Handcrafted in Bangalore, India
              </div>

              {/* Headline */}
              <h1 className="font-black text-white mb-5 leading-[0.96] tracking-tight text-balance" style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5rem)' }}>
                Your Photos,
                <br />
                <span className="gradient-text">Now in 3D</span>
              </h1>

              {/* Sub */}
              <p className="text-base sm:text-lg text-text-secondary max-w-md mb-8 leading-relaxed">
                We turn your cherished photos into stunning 3D printed gifts.
                Miniatures, lamps, keychains and more, handcrafted in Bangalore.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-10 w-full sm:w-auto">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi! I want to order a 3D printed gift.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-green w-full sm:w-auto text-sm"
                  aria-label="Order on WhatsApp"
                >
                  <WaIcon />
                  Order on WhatsApp
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
                <Link
                  to="/shop"
                  className="btn-secondary w-full sm:w-auto text-sm"
                  aria-label="Browse all products"
                >
                  Browse Products
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2.5">
                {trustBadges.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center">
                      <Icon size={10} className="text-accent" aria-hidden="true" />
                    </div>
                    <span className="text-[12px] font-medium text-text-muted">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Product Image ── */}
            <div className="relative w-full lg:w-[480px] xl:w-[520px] shrink-0 order-first lg:order-last">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-bg-card border border-border-subtle shadow-glow-orange">

                {/* Images */}
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                  </div>
                ) : heroImages.length > 0 ? (
                  heroImages.map((img, i) => (
                    <img
                      key={img.src + i}
                      src={img.src}
                      alt={img.alt}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
                        i === currentImage ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                      }`}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      fetchPriority={i === 0 ? 'high' : 'auto'}
                      decoding="async"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.jpg'; }}
                    />
                  ))
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎁</div>
                      <p className="text-text-muted text-sm">Your gift, beautifully 3D printed</p>
                    </div>
                  </div>
                )}

                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" aria-hidden="true" />

                {/* Price badge — updates with each slide */}
                {currentSlide && (
                  <div className="absolute top-4 right-4 glass px-3.5 py-2.5 rounded-xl shadow-xl border border-white/10 transition-all duration-500">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-0.5">From</p>
                    <p key={currentSlide.price} className="text-lg font-black gradient-text leading-none animate-fade-in">
                      {formatPrice(currentSlide.price)}
                    </p>
                  </div>
                )}

                {/* Bottom: current product name */}
                {currentSlide && (
                  <div className="absolute bottom-12 left-4 right-4">
                    <p key={currentSlide.alt} className="text-white/70 text-xs font-medium truncate animate-fade-in">
                      {currentSlide.alt}
                    </p>
                  </div>
                )}

                {/* Image dots */}
                {heroImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5" role="tablist" aria-label="Product images">
                    {heroImages.map((_, i) => (
                      <button
                        key={i}
                        role="tab"
                        aria-selected={i === currentImage}
                        aria-label={`Image ${i + 1}`}
                        onClick={() => setCurrentImage(i)}
                        className={`h-1.5 rounded-full transition-all duration-400 ${
                          i === currentImage ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Decorative glow behind image */}
              <div className="absolute inset-0 rounded-3xl bg-accent/8 blur-3xl scale-110 -z-10 pointer-events-none" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
