import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Loader2, Search, SlidersHorizontal, Package, RefreshCw, Eye } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';
import { supabase, TABLES } from '../lib/supabaseClient';
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
    } catch (err) {
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

  const formatPrice = (price) => {
    return 'Rs. ' + Number(price).toLocaleString('en-IN');
  };

  return (
    <main className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-text-muted text-xs font-medium uppercase tracking-wide mb-2">Shop</p>
          <h1 className="section-title">All Products</h1>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input rounded-lg pl-10"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <SlidersHorizontal size={16} className="text-text-muted shrink-0" />
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === 'All'
                  ? 'bg-white text-black'
                  : 'border border-border-subtle text-text-secondary hover:text-white hover:border-text-secondary'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.name
                    ? 'bg-white text-black'
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
          <div className="flex justify-center py-20">
            <Loader2 size={24} className="animate-spin text-text-secondary" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <Package size={40} className="text-text-muted mx-auto mb-4" />
            <h3 className="text-text-primary font-medium mb-1">Something went wrong</h3>
            <p className="text-text-secondary text-sm mb-4">{error}</p>
            <button
              onClick={loadData}
              className="btn-primary"
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package size={40} className="text-text-muted mx-auto mb-4" />
            <h3 className="text-text-primary font-medium mb-1">No products found</h3>
            <p className="text-text-secondary text-sm">Check back soon or try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group card-hover overflow-hidden"
              >
                <div className="relative aspect-square overflow-hidden bg-bg-secondary">
                  <Link to={`/products/${product.id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/products/model1.jpeg';
                      }}
                    />
                  </Link>
                  <span className="absolute top-2.5 left-2.5 bg-black/70 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded">
                    {product.category?.name || product.category}
                  </span>
                  {product.product_type === 'customised' && (
                    <span className="absolute top-2.5 right-2.5 bg-white text-black text-[10px] sm:text-xs px-2 py-0.5 rounded font-medium">
                      Custom
                    </span>
                  )}
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link
                      to={`/products/${product.id}`}
                      className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center"
                      aria-label={`View ${product.name}`}
                    >
                      <Eye size={14} />
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingId === product.id}
                      aria-label={`Add ${product.name} to cart`}
                      className="w-8 h-8 bg-black text-white border border-white rounded-lg flex items-center justify-center disabled:opacity-50"
                    >
                      {addingId === product.id ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="text-text-primary font-medium text-sm mb-1 group-hover:text-white transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-text-muted text-xs mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium text-sm">{formatPrice(product.price)}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingId === product.id}
                      aria-label={`Add ${product.name} to cart`}
                      className="inline-flex items-center gap-1 text-text-secondary hover:text-white text-xs font-medium transition-colors sm:hidden"
                    >
                      Add <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingId === product.id}
                      aria-label={`Add ${product.name} to cart`}
                      className="hidden sm:inline-flex items-center gap-1.5 border border-border-subtle hover:border-text-secondary text-text-secondary hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {addingId === product.id ? <Loader2 size={12} className="animate-spin" /> : <ShoppingCart size={12} />}
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
