import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Loader2, Package, RefreshCw, X, ShoppingCart, Eye, ArrowRight } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';
import { supabase, TABLES } from '../lib/supabaseClient';
import { formatPrice } from '../lib/utils';
import PageHead from '../components/PageHead';
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
        supabase
          .from(TABLES.PRODUCTS)
          .select('*, category:categories(name)')
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from(TABLES.CATEGORIES)
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
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

  useEffect(() => { loadData(); }, []);

  const handleAddToCart = async (product) => {
    setAddingId(product.id);
    try {
      await addToCart(product);
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setTimeout(() => setAddingId(null), 600);
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

  const hasFilters = activeCategory !== 'All' || searchQuery.trim() !== '';

  return (
    <main className="min-h-screen bg-bg-primary">
      <PageHead
        title="Shop"
        description="Browse our collection of personalized 3D printed gifts. Face miniatures, lithophane lamps, keychains, couple gifts and more. Handcrafted in Bangalore."
        path="/shop"
      />
      {/* ── Page header ── */}
      <div className="pt-28 pb-10 bg-bg-secondary border-b border-border-subtle relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-label mb-4">Shop</div>
            <h1 className="text-display-sm font-black text-white">All Products</h1>
            <p className="text-text-muted text-sm mt-2 max-w-sm">
              {products.length > 0 ? `${products.length} handcrafted products` : 'Handcrafted personalized gifts'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 sticky top-[96px] z-30 py-3 bg-bg-primary/95 backdrop-blur-xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 border-b border-border-subtle/50">
          {/* Search */}
          <div className="relative flex-1 max-w-xs" role="search" aria-label="Search products">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input rounded-xl pl-10 text-sm"
              aria-label="Search products"
              enterKeyHint="search"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide flex-1">
            <SlidersHorizontal size={14} className="text-text-muted shrink-0" aria-hidden="true" />
            {['All', ...categories.map(c => c.name)].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  activeCategory === cat
                    ? 'bg-accent text-white shadow-glow-orange'
                    : 'bg-bg-card border border-border-subtle text-text-secondary hover:text-white hover:border-border'
                }`}
              >
                {cat}
              </button>
            ))}

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="ml-1 px-3 py-1.5 rounded-full text-[12px] font-medium text-text-muted hover:text-white border border-border-subtle hover:border-border transition-all duration-200 flex items-center gap-1 shrink-0"
                aria-label="Clear all filters"
              >
                <X size={11} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Product grid ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4" role="status">
            <Loader2 size={28} className="animate-spin text-accent" />
            <p className="text-text-muted text-sm">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-28">
            <Package size={40} className="text-text-muted mx-auto mb-4" />
            <h3 className="text-text-primary font-semibold mb-2">Something went wrong</h3>
            <p className="text-text-secondary text-sm mb-6">{error}</p>
            <button onClick={loadData} className="btn-primary">
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-28">
            <Package size={40} className="text-text-muted mx-auto mb-4" />
            <h3 className="text-text-primary font-semibold mb-2">No products found</h3>
            <p className="text-text-secondary text-sm mb-6">
              {searchQuery ? `No results for "${searchQuery}"` : 'Nothing here yet. Check back soon.'}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-secondary">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
              role="list"
              aria-label="Products"
              aria-live="polite"
              aria-atomic="false"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  role="listitem"
                >
                  <ShopProductCard
                    product={product}
                    addingId={addingId}
                    onAddToCart={handleAddToCart}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}

function ShopProductCard({ product, addingId, onAddToCart }) {
  const isAdding = addingId === product.id;
  const isCustomised = product.product_type === 'customised';

  return (
    <div className="group card-hover overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-bg-elevated">
        <Link
          to={`/products/${product.id}`}
          aria-label={`View ${product.name}`}
          tabIndex={-1}
        >
          <img
            src={product.image || '/images/products/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            loading="lazy"
            decoding="async"
            onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.jpg'; }}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-start justify-between gap-1.5">
          {product.category?.name && (
            <span className="text-[9px] sm:text-[10px] font-semibold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded truncate max-w-[70px]">
              {product.category.name}
            </span>
          )}
          {isCustomised && (
            <span className="text-[9px] sm:text-[10px] font-bold text-white bg-accent px-2 py-0.5 rounded ml-auto shrink-0">
              Custom
            </span>
          )}
        </div>

        {/* Hover action buttons */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-250">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 h-8 bg-white/90 backdrop-blur-sm text-black rounded-lg flex items-center justify-center text-[11px] font-semibold hover:bg-white transition-colors gap-1"
            aria-label={`View ${product.name} details`}
          >
            <Eye size={12} />
            View
          </Link>
          <button
            onClick={() => onAddToCart(product)}
            disabled={isAdding}
            aria-label={`Add ${product.name} to cart`}
            className="flex-1 h-8 bg-accent text-white rounded-lg flex items-center justify-center text-[11px] font-semibold hover:brightness-110 disabled:opacity-60 transition-all gap-1"
          >
            {isAdding ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <>
                <ShoppingCart size={12} />
                Add
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col flex-1">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-text-primary font-semibold text-[13px] mb-0.5 group-hover:text-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="text-text-muted text-[11px] line-clamp-1 mb-2 flex-1">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-subtle/50">
          <span className="text-white font-bold text-[13px]">{formatPrice(product.price)}</span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={isAdding}
            aria-label={`Add ${product.name} to cart`}
            className="text-[11px] font-semibold text-accent hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            {isAdding ? <Loader2 size={11} className="animate-spin" /> : <ShoppingCart size={11} />}
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
