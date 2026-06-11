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

  useEffect(() => {
    loadData();
  }, []);

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

  const handleAddToCart = async (product) => {
    setAddingId(product.id);
    try {
      await addToCart(product);
      toast.success(`${product.name} added to cart!`);
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
    return '₹' + Number(price).toLocaleString('en-IN');
  };

  return (
    <main className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-2">
            Our <span className="gradient-text">Products</span>
          </h1>
          <p className="text-text-secondary text-sm">Browse our collection of personalized 3D printed gifts</p>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass rounded-full pl-10 pr-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <SlidersHorizontal size={16} className="text-text-muted shrink-0" />
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === 'All'
                  ? 'bg-accent text-white shadow-glow-sm'
                  : 'glass text-text-secondary hover:text-text-primary hover:border-accent/40'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.name
                    ? 'bg-accent text-white shadow-glow-sm'
                    : 'glass text-text-secondary hover:text-text-primary hover:border-accent/40'
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
            <Loader2 size={28} className="animate-spin text-accent" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <Package size={40} className="text-text-muted mx-auto mb-4" />
            <h3 className="text-text-primary font-semibold mb-1">Something went wrong</h3>
            <p className="text-text-secondary text-sm mb-4">{error}</p>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-accent to-amber-500 hover:opacity-90 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-glow-sm hover:shadow-glow"
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package size={40} className="text-text-muted mx-auto mb-4" />
            <h3 className="text-text-primary font-semibold mb-1">No products found</h3>
            <p className="text-text-secondary text-sm">Check back soon or try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                whileHover={{ y: -6 }}
                className="group glass-card overflow-hidden"
              >
                <div className="relative aspect-square overflow-hidden bg-bg-secondary/50">
                  <Link to={`/products/${product.id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/products/model1.jpeg';
                      }}
                    />
                  </Link>
                  <span className="absolute top-2.5 left-2.5 glass text-text-secondary text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full">
                    {product.category?.name || product.category}
                  </span>
                  {product.product_type === 'customised' && (
                    <span className="absolute top-2.5 right-2.5 glass-strong text-purple-300 border-purple-400/30 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full">
                      Customised
                    </span>
                  )}
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Link
                      to={`/products/${product.id}`}
                      className="w-9 h-9 glass-strong hover:border-accent/40 text-text-primary rounded-full flex items-center justify-center shadow-lg transition-all hover:-translate-y-0.5"
                      aria-label={`View ${product.name}`}
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingId === product.id}
                      aria-label={`Add ${product.name} to cart`}
                      className="w-9 h-9 bg-gradient-to-br from-accent to-amber-500 hover:opacity-90 text-white rounded-full flex items-center justify-center shadow-lg shadow-accent/25 transition-all hover:-translate-y-0.5 disabled:hover:transform-none"
                    >
                      {addingId === product.id ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                    </button>
                  </div>
                </div>
                <div className="p-3.5 sm:p-5">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="text-text-primary font-semibold text-sm sm:text-base mb-1 hover:text-accent transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-text-muted text-xs mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-accent font-bold text-base sm:text-lg">{formatPrice(product.price)}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingId === product.id}
                      aria-label={`Add ${product.name} to cart`}
                      className="inline-flex items-center gap-1 text-accent text-xs sm:text-sm font-medium hover:gap-1.5 transition-all sm:hidden"
                    >
                      Add <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingId === product.id}
                      aria-label={`Add ${product.name} to cart`}
                      className="hidden sm:inline-flex items-center gap-1.5 glass hover:border-accent/40 text-accent text-xs font-medium px-4 py-1.5 rounded-full transition-all hover:-translate-y-0.5"
                    >
                      {addingId === product.id ? <Loader2 size={12} className="animate-spin" /> : <ShoppingCart size={12} />}
                      Add to Cart
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
