import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Loader2, Search, SlidersHorizontal, Package, RefreshCw, Eye } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';
import { supabase, TABLES } from '../lib/supabaseClient';
import { formatPrice } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Shop() {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addingId, setAddingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from(TABLES.PRODUCTS).select('*, category:categories(name)').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from(TABLES.CATEGORIES).select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
      toast.error('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddToCart = async (product) => {
    setAddingId(product.id);
    try {
      await addToCart(product);
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setTimeout(() => setAddingId(null), 500);
    }
  };

  const filteredProducts = products.filter((p) => {
    const categoryName = p.category?.name || p.category;
    const matchesCategory = activeCategory === 'All' || categoryName === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const clearFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
  };

  return (
    <main className="section-padding">
      <div className="max-w-7xl mx-auto container-padding">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-text-muted text-xs font-medium uppercase tracking-wide mb-2">Shop</p>
          <h1 className="text-headline font-bold text-white">All Products</h1>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="relative flex-1" role="search" aria-label="Product search">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input rounded-lg pl-10"
              aria-label="Search products"
              enterKeyHint="search"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <SlidersHorizontal size={16} className="text-text-muted shrink-0" aria-hidden="true" />
            <button
              onClick={() => setActiveCategory('All')}
              aria-pressed={activeCategory === 'All'}
              className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === 'All'
                  ? 'bg-brand-orange text-white'
                  : 'border border-border-subtle text-text-secondary hover:text-white hover:border-text-secondary'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                aria-pressed={activeCategory === cat.name}
                className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.name
                    ? 'bg-brand-orange text-white'
                    : 'border border-border-subtle text-text-secondary hover:text-white hover:border-text-secondary'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20" role="status" aria-label="Loading products">
            <Loader2 size={24} className="animate-spin text-brand-orange" aria-hidden="true" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <Package size={40} className="text-text-muted mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-text-primary font-medium mb-1">Something went wrong</h3>
            <p className="text-text-secondary text-sm mb-4">{error}</p>
            <button
              onClick={loadData}
              className="btn-primary"
              aria-label="Retry loading products"
            >
              <RefreshCw size={14} aria-hidden="true" /> Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package size={40} className="text-text-muted mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-text-primary font-medium mb-1">No products found</h3>
            <p className="text-text-secondary text-sm mb-4">
              {searchQuery ? `No results for "${searchQuery}"` : 'Check back soon or try a different search.'}
            </p>
            {(searchQuery || activeCategory !== 'All') && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={clearFilters}
                  className="btn-secondary"
                  aria-label="Clear all filters"
                >
                  Clear Filters
                </button>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 text-brand-orange hover:underline text-sm"
                  aria-label="Browse all products"
                >
                  Browse all products
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5" role="list" aria-label="Product list" aria-live="polite">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group card-hover overflow-hidden flex flex-col"
                role="listitem"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-bg-secondary">
                  <Link to={`/products/${product.id}`} aria-label={`View ${product.name}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      decoding="async"
                      width={400}
                      height={500}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/products/placeholder.jpg';
                      }}
                    />
                  </Link>
                  {/* Badges - positioned to not overlap */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1">
                    <span className="bg-black/70 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded shrink-0">
                      {product.category?.name || product.category}
                    </span>
                    {product.product_type === 'customised' && (
                      <span className="bg-brand-orange text-white text-[10px] sm:text-xs px-2 py-0.5 rounded font-medium shrink-0">
                        Custom
                      </span>
                    )}
                  </div>
                  {/* Mobile-visible action buttons */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                    <Link
                      to={`/products/${product.id}`}
                      className="flex-1 h-9 bg-white/90 backdrop-blur-sm text-black rounded-lg flex items-center justify-center text-xs font-medium hover:bg-white transition-colors"
                      aria-label={`View ${product.name} details`}
                    >
                      <Eye size={14} className="mr-1" aria-hidden="true" />
                      View
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingId === product.id}
                      aria-label={`Add ${product.name} to cart`}
                      className="flex-1 h-9 bg-brand-orange text-white rounded-lg flex items-center justify-center text-xs font-medium hover:brightness-110 disabled:opacity-50 transition-colors"
                    >
                      {addingId === product.id ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <ShoppingCart size={14} className="mr-1" aria-hidden="true" />}
                      Add
                    </button>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <Link to={`/products/${product.id}`} aria-label={product.name}>
                    <h3 className="text-white font-medium text-sm mb-1 group-hover:text-brand-orange transition-colors line-clamp-1">{product.name}</h3>
                  </Link>
                  <p className="text-text-muted text-xs mb-3 line-clamp-2 flex-1">{product.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-white font-semibold text-sm">{formatPrice(product.price)}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingId === product.id}
                      aria-label={`Add ${product.name} to cart`}
                      className="inline-flex items-center gap-1.5 border border-border-subtle hover:border-brand-orange text-text-secondary hover:text-brand-orange text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {addingId === product.id ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : <ShoppingCart size={12} aria-hidden="true" />}
                      Add
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
