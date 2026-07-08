import { useState, useEffect } from 'react';
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
          .select('id, name, image, images, price')
          .eq('is_active', true)
          .not('image', 'is', null)
          .order('created_at', { ascending: false })
          .limit(6);

        if (!cancelled && products?.length > 0) {
          setHeroImages(products.map(p => ({
            src: (Array.isArray(p.images) && p.images[0]) || p.image,
            alt: p.name,
            price: p.price || 499,
          })));
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

      <section className="relative min-h-[100dvh] bg-bg-primary overflow-hidden" aria-label="Hero - Personalized 3D Printed Gifts">
        {/* Structural grid backdrop */}
        <div className="absolute inset-0 line-grid pointer-events-none" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-center min-h-[100dvh] pt-28 pb-8 lg:pt-0 lg:pb-0">

            {/* ── Left: Copy ── */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left max-w-2xl mx-auto lg:mx-0 lg:py-24">

              <div className="section-label mb-6">
                <Sparkles size={11} aria-hidden="true" />
                Handcrafted in Bangalore, India
              </div>

              <h1 className="font-black uppercase text-text-primary mb-5 leading-[0.9] tracking-tight text-balance" style={{ fontSize: 'clamp(2.6rem, 6.8vw, 5.2rem)' }}>
                Your Photos,
                <br />
                <span className="text-accent">Now in 3D</span>
              </h1>

              <p className="text-base sm:text-lg text-text-secondary max-w-md mb-8 leading-relaxed">
                We turn your cherished photos into stunning 3D printed gifts.
                Miniatures, lamps, keychains and more, handcrafted in Bangalore.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 mb-10 w-full sm:w-auto">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi! I want to order a 3D printed gift.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-green w-full sm:w-auto"
                  aria-label="Order on WhatsApp"
                >
                  <WaIcon />
                  Order on WhatsApp
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
                <Link to="/shop" className="btn-primary w-full sm:w-auto" aria-label="Browse all products">
                  Browse Products
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
                <Link
                  to="/shop3d"
                  className="btn-secondary relative w-full sm:w-auto"
                  aria-label="Walk through our 3D shop (beta)"
                >
                  <Sparkles size={14} aria-hidden="true" />
                  Walk Into Our 3D Shop
                  <span className="absolute -top-2.5 -right-2.5 px-1.5 py-0.5 bg-accent text-white text-[10px] font-bold border-2 border-border">BETA</span>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2.5">
                {trustBadges.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-6 h-6 border-2 border-border bg-bg-card flex items-center justify-center">
                      <Icon size={11} className="text-accent" aria-hidden="true" />
                    </div>
                    <span className="text-[12px] font-bold uppercase tracking-wide text-text-secondary">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Product Specimen ── */}
            <div className="relative w-full lg:w-[480px] xl:w-[520px] shrink-0 order-first lg:order-last">
              <div className="relative aspect-[4/5] overflow-hidden bg-bg-card border-2 border-border shadow-glow-orange-lg">

                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent animate-spin" />
                  </div>
                ) : heroImages.length > 0 ? (
                  heroImages.map((img, i) => (
                    <img
                      key={img.src + i}
                      src={img.src}
                      alt={img.alt}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === currentImage ? 'opacity-100' : 'opacity-0'}`}
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

                {/* Price sticker */}
                {currentSlide && (
                  <div className="absolute top-3 right-3 tb-sticker tb-sticker--orange flex-col !items-start !py-1.5">
                    <span className="text-[8px] tracking-widest opacity-80">FROM</span>
                    <span key={currentSlide.price} className="font-mono-tb text-base font-bold leading-none animate-fade-in">
                      {formatPrice(currentSlide.price)}
                    </span>
                  </div>
                )}

                {/* Product name label */}
                {currentSlide && (
                  <div className="absolute bottom-0 inset-x-0 bg-bg-primary border-t-2 border-border px-3 py-2">
                    <p key={currentSlide.alt} className="text-text-primary text-xs font-bold uppercase tracking-wide truncate animate-fade-in">
                      {currentSlide.alt}
                    </p>
                  </div>
                )}

                {/* Image dots */}
                {heroImages.length > 1 && (
                  <div className="absolute bottom-11 left-1/2 -translate-x-1/2 flex gap-1.5" role="tablist" aria-label="Product images">
                    {heroImages.map((_, i) => (
                      <button
                        key={i}
                        role="tab"
                        aria-selected={i === currentImage}
                        aria-label={`Image ${i + 1}`}
                        onClick={() => setCurrentImage(i)}
                        className={`h-2 border border-border transition-all ${i === currentImage ? 'w-6 bg-accent' : 'w-2 bg-bg-card'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
