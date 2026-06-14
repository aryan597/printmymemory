import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Box } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabaseClient';
import { formatPrice } from '../lib/utils';

const fallbackCategories = [
  {
    id: 'cat-1',
    name: '3D Face Miniatures',
    image: '/images/products/miniature.jpg',
    price: 1299,
    path: '/shop?category=3D+Face+Miniatures',
  },
  {
    id: 'cat-2',
    name: 'Lithophane Lamps',
    image: '/images/products/lamp.jpg',
    price: 999,
    path: '/shop?category=Lithophane+Lamps',
  },
  {
    id: 'cat-3',
    name: 'Personalized Name Plates',
    image: '/images/products/nameplate.jpg',
    price: 799,
    path: '/shop?category=Name+Plates',
  },
  {
    id: 'cat-4',
    name: 'Custom Keychains',
    image: '/images/products/keychain.jpg',
    price: 499,
    path: '/shop?category=Keychains',
  },
  {
    id: 'cat-5',
    name: 'Couple Gifts',
    image: '/images/products/couple.jpg',
    price: 1499,
    path: '/shop?category=Couple+Gifts',
  },
  {
    id: 'cat-6',
    name: 'Corporate Gifts',
    image: '/images/products/corporate.jpg',
    price: 1999,
    path: '/shop?category=Corporate+Gifts',
  },
];

export default function BestsellersSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const { data, error } = await supabase
          .from(TABLES.PRODUCTS)
          .select('*, category:categories(name)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(6);
        if (!cancelled) {
          setProducts(data || []);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true };
  }, []);

  const displayProducts = products.length > 0 ? products : fallbackCategories;

  return (
    <section className="section-padding bg-bg-primary" aria-label="Bestsellers and trending products">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <h2 className="text-headline font-bold text-white">
              Shop Our <span className="text-brand-orange">Bestsellers</span>
            </h2>
            <p className="text-text-muted text-sm mt-2">Unique 3D printed gifts for every occasion</p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-medium mt-4 sm:mt-0 group"
            aria-label="View all products"
          >
            View All Products
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-16" role="status" aria-label="Loading products">
            <Loader2 size={28} className="animate-spin text-brand-orange" aria-hidden="true" />
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-16">
            <Box size={40} className="text-text-muted mx-auto mb-4" aria-hidden="true" />
            <p className="text-text-secondary text-sm">Products coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" role="list" aria-label="Product list">
            {displayProducts.map((product) => (
              <CategoryCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryCard({ product }) {
  const image = product.image || product.category?.image || '/images/products/placeholder.jpg';
  const price = product.price || product.starting_price || 499;
  const path = product.path || `/products/${product.id}`;

  return (
    <Link
      to={path}
      className="group block"
      aria-label={`View ${product.name} - ${formatPrice(price)}`}
    >
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-bg-card mb-3">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/products/placeholder.jpg';
          }}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-white text-sm font-medium flex items-center gap-1">
            Shop Now <ArrowRight size={14} />
          </span>
        </div>
      </div>
      <h3 className="text-white font-medium text-sm group-hover:text-brand-orange transition-colors">
        {product.name}
      </h3>
      <p className="text-brand-orange text-sm font-semibold mt-0.5">
        {formatPrice(price)}
      </p>
    </Link>
  );
}
