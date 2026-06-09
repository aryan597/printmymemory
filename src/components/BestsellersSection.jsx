import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, TABLES } from '../lib/supabaseClient';
import ProductCard from './ProductCard';

export default function BestsellersSection() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          supabase.from(TABLES.CATEGORIES).select('*').eq('is_active', true).order('sort_order', { ascending: true }),
          supabase.from(TABLES.PRODUCTS).select('*, category:categories(name)').eq('is_active', true).order('created_at', { ascending: false }).limit(6),
        ]);
        if (!cancelled) {
          setCategories(catRes.data || []);
          setProducts(prodRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load bestsellers:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-2">
              Shop by <span className="text-accent">Category</span>
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              Real categories, real products — no dropshipping nonsense
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors text-sm font-medium mt-3 sm:mt-0"
          >
            View All Products
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Category Pills */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="px-4 py-2 bg-bg-card border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary hover:border-accent/40 hover:bg-accent/5 transition-all text-sm font-medium"
              >
                {cat.name}
              </Link>
            ))}
          </motion.div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-accent" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-sm">Products coming soon. Check back shortly!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
