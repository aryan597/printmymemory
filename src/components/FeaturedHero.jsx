import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase, TABLES } from '../lib/supabaseClient';
import { CartContext } from '../contexts/CartContext';
import { formatPrice } from '../lib/utils';

const WHATSAPP_NUMBER = '919471725271';

const WaIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.72 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function FeaturedHero() {
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Prefer an explicitly featured product, else bestseller, else newest.
        const base = () => supabase
          .from(TABLES.PRODUCTS)
          .select('*, category:categories(name)')
          .eq('is_active', true)
          .limit(1);

        let { data } = await base().eq('is_featured', true).order('created_at', { ascending: false });
        if (!data?.length) ({ data } = await base().eq('is_bestseller', true).order('created_at', { ascending: false }));
        if (!data?.length) ({ data } = await base().order('created_at', { ascending: false }));

        if (!cancelled) setProduct(data?.[0] || null);
      } catch (err) {
        console.error('Featured hero load failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const image = product && ((Array.isArray(product.images) && product.images[0]) || product.image) || '/images/products/placeholder.jpg';
  const isCustomised = product?.product_type === 'customised';

  const handleAdd = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(product);
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const waLink = product
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'm interested in "${product.name}" (${formatPrice(product.price)}).`)}`
    : `https://wa.me/${WHATSAPP_NUMBER}?text=Hi! I want to order a 3D printed gift.`;

  return (
    <section className="relative bg-bg-primary overflow-hidden border-b-2 border-border" aria-label="Featured product">
      <div className="absolute inset-0 line-grid pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center min-h-[calc(100dvh-96px)] pt-28 pb-14 lg:py-24">

          {/* ── Left: copy ── */}
          <div className="order-2 lg:order-1">
            <div className="section-label mb-6">
              <Sparkles size={11} /> Featured · Handcrafted in Bangalore
            </div>

            {loading ? (
              <div className="space-y-4">
                <div className="h-14 w-3/4 bg-bg-card border-2 border-border animate-pulse" />
                <div className="h-4 w-full bg-bg-card animate-pulse" />
                <div className="h-4 w-2/3 bg-bg-card animate-pulse" />
              </div>
            ) : product ? (
              <>
                <h1 className="font-black uppercase text-text-primary leading-[0.9] tracking-tight text-balance mb-5" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}>
                  {product.name}
                </h1>

                <p className="text-text-secondary text-base sm:text-lg max-w-md leading-relaxed mb-6">
                  {product.description?.slice(0, 160) || 'A handcrafted 3D-printed keepsake, made to order in Bangalore.'}
                </p>

                {/* Price block */}
                <div className="flex items-end gap-3 mb-8">
                  <span className="font-mono-tb font-black text-text-primary" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)' }}>
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_price > product.price && (
                    <span className="font-mono-tb text-text-muted line-through text-lg mb-1.5">
                      {formatPrice(product.compare_price)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Link to={`/products/${product.id}`} className="btn-primary">
                    {isCustomised ? 'Personalise & Order' : 'View Product'}
                    <ArrowRight size={15} />
                  </Link>
                  <button onClick={handleAdd} disabled={adding} className="btn-secondary">
                    {adding ? <Loader2 size={15} className="animate-spin" /> : <ShoppingCart size={15} />}
                    Add to Cart
                  </button>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-green">
                    <WaIcon size={15} /> WhatsApp
                  </a>
                </div>
              </>
            ) : (
              <>
                <h1 className="font-black uppercase text-text-primary leading-[0.9] tracking-tight mb-5" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}>
                  Your Photos,<br /><span className="text-accent">Now in 3D</span>
                </h1>
                <p className="text-text-secondary text-lg max-w-md mb-8">
                  Handcrafted 3D-printed gifts from your memories. Made to order in Bangalore.
                </p>
                <Link to="/shop" className="btn-primary">Browse Products <ArrowRight size={15} /></Link>
              </>
            )}
          </div>

          {/* ── Right: specimen ── */}
          <div className="order-1 lg:order-2">
            <div className="relative aspect-square lg:aspect-[4/5] w-full max-w-lg mx-auto bg-bg-card border-2 border-border tb-shadow-lg overflow-hidden">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={28} className="animate-spin text-accent" />
                </div>
              ) : (
                <img
                  src={image}
                  alt={product?.name || 'Featured product'}
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.jpg'; }}
                />
              )}

              {product && (
                <>
                  {isCustomised && (
                    <div className="absolute top-3 left-3">
                      <span className="tb-sticker tb-sticker--orange">Customizable</span>
                    </div>
                  )}
                  {product.category?.name && (
                    <div className="absolute bottom-0 inset-x-0 bg-bg-primary border-t-2 border-border px-3 py-2">
                      <p className="font-mono-tb text-[11px] uppercase tracking-widest text-text-secondary truncate">
                        {product.category.name}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
