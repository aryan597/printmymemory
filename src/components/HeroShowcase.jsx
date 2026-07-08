import { useState, useEffect } from 'react';
import { supabase, TABLES } from '../lib/supabaseClient';
import { formatPrice } from '../lib/utils';

/**
 * Rotating product images with a price banner — the visual anchor on the left
 * of the hero. Fetches recent active products and cross-fades between them.
 */
export default function HeroShowcase() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  const slide = slides[current] ?? null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from(TABLES.PRODUCTS)
          .select('id, name, image, images, price')
          .eq('is_active', true)
          .not('image', 'is', null)
          .order('created_at', { ascending: false })
          .limit(6);
        if (!cancelled && data?.length) {
          setSlides(data.map((p) => ({
            src: (Array.isArray(p.images) && p.images[0]) || p.image,
            alt: p.name,
            price: p.price || 499,
          })));
        }
      } catch (err) {
        console.error('Hero showcase load failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 3500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-bg-card border border-border shadow-glow-orange-lg">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : slides.length ? (
          slides.map((img, i) => (
            <img
              key={img.src + i}
              src={img.src}
              alt={img.alt}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
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

        {/* Price banner */}
        {slide && (
          <div className="absolute top-3.5 right-3.5 rounded-2xl bg-accent text-white px-3.5 py-2 shadow-lg">
            <p className="text-[9px] font-semibold uppercase tracking-widest opacity-80 leading-none">From</p>
            <p key={slide.price} className="font-mono-tb text-lg font-bold leading-none mt-1 animate-fade-in">{formatPrice(slide.price)}</p>
          </div>
        )}

        {/* Name + gradient */}
        {slide && (
          <>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            <p key={slide.alt} className="absolute bottom-9 left-4 right-4 text-white text-sm font-semibold truncate animate-fade-in">{slide.alt}</p>
          </>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
