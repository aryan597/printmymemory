import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Box, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase, TABLES } from '../lib/supabaseClient';
import { formatPrice } from '../lib/utils';

const fallbackCategories = [
  { id: 'f1', name: '3D Face Miniatures', image: '/images/products/miniature.jpg', price: 1299, path: '/shop?category=3D+Face+Miniatures', category: { name: 'Miniatures' }, product_type: 'customised' },
  { id: 'f2', name: 'Lithophane Lamps', image: '/images/products/lamp.jpg', price: 999, path: '/shop?category=Lithophane+Lamps', category: { name: 'Lamps' }, product_type: 'customised' },
  { id: 'f3', name: 'Personalized Name Plates', image: '/images/products/nameplate.jpg', price: 799, path: '/shop?category=Name+Plates', category: { name: 'Decor' }, product_type: 'customised' },
  { id: 'f4', name: 'Custom Keychains', image: '/images/products/keychain.jpg', price: 499, path: '/shop', category: { name: 'Accessories' }, product_type: 'customised' },
  { id: 'f5', name: 'Couple Gifts', image: '/images/products/couple.jpg', price: 1499, path: '/shop', category: { name: 'Gifts' }, product_type: 'customised' },
  { id: 'f6', name: 'Corporate Gifts', image: '/images/products/corporate.jpg', price: 1999, path: '/bulk-orders', category: { name: 'Corporate' }, product_type: 'uncustomised' },
];

export default function BestsellersSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const { data } = await supabase
          .from(TABLES.PRODUCTS)
          .select('*, category:categories(name)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(6);
        if (!cancelled) setProducts(data || []);
      } catch (err) {
        console.error('Failed to load bestsellers:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  const displayProducts = products.length > 0 ? products : fallbackCategories;

  return (
    <section className="section-padding bg-bg-primary" aria-label="Bestselling products">
      <div className="max-w-7xl mx-auto container-padding">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="section-label mb-4">
              <Sparkles size={10} />
              Our Products
            </div>
            <h2 className="text-headline font-black uppercase text-text-primary text-balance">
              Bestselling 3D Gifts
            </h2>
            <p className="text-text-muted text-sm mt-2 max-w-sm">
              Unique, handcrafted gifts for every occasion, personalized just for you.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors text-sm font-semibold group shrink-0"
            aria-label="View all products"
          >
            View all products
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20" role="status">
            <Loader2 size={24} className="animate-spin text-accent" aria-hidden="true" />
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20">
            <Box size={36} className="text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary text-sm">Products coming soon.</p>
          </div>
        ) : (
          /* Asymmetric grid: first card spans 2 rows on desktop */
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" role="list" aria-label="Product list">
            {displayProducts.slice(0, 6).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                role="listitem"
                className={i === 0 ? 'col-span-2 lg:col-span-1 lg:row-span-2' : ''}
              >
                <ProductCard product={product} tall={i === 0} />
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA row */}
        <div className="text-center mt-12">
          <Link to="/shop" className="btn-secondary">
            See all products
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, tall = false }) {
  const image = product.image || '/images/products/placeholder.jpg';
  const price = product.price || 499;
  const path = product.path || `/products/${product.id}`;
  const isCustomised = product.product_type === 'customised';

  return (
    <Link
      to={path}
      className="group block card-hover overflow-hidden"
      aria-label={`${product.name}, from ${formatPrice(price)}`}
    >
      <div className={`relative overflow-hidden bg-bg-elevated ${tall ? 'aspect-[3/4] sm:aspect-[4/5]' : 'aspect-[4/5]'}`}>
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          loading="lazy"
          decoding="async"
          onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.jpg'; }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between" aria-hidden="true">
          {product.category?.name && (
            <span className="tb-sticker">{product.category.name}</span>
          )}
          {isCustomised && (
            <span className="tb-sticker tb-sticker--orange ml-auto">Custom</span>
          )}
        </div>
      </div>

      {/* Info bar */}
      <div className="p-3.5 border-t-2 border-border flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-text-primary font-bold text-sm group-hover:text-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
          <span className="text-text-primary font-mono-tb font-bold text-sm">{formatPrice(price)}</span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 text-[11px] font-bold uppercase text-white bg-accent px-2.5 py-1.5 border-2 border-border shrink-0">
          View <ArrowRight size={10} />
        </div>
      </div>
    </Link>
  );
}
