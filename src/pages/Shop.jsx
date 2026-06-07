import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingCart, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';
import { supabase, TABLES } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const categories = ['All', 'Face Miniatures', 'Lamps', 'Home Decor', 'Accessories', 'Couple Gifts', 'Corporate'];

export default function Shop() {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase.from(TABLES.PRODUCTS).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      // Fallback to static products if DB is empty
      if (!data || data.length === 0) {
        setProducts([
          { id: 1, name: '3D Face Miniatures', price: 2499, image: '/images/model1.jpeg', category: 'Face Miniatures', description: 'Detailed hand-painted 3D bust of your loved one' },
          { id: 2, name: 'Lithophane Lamps', price: 1999, image: '/images/globe_front.jpeg', category: 'Lamps', description: 'Your photos illuminate beautifully when lit' },
          { id: 3, name: 'Personalized Name Plates', price: 999, image: '/images/globe_back.jpeg', category: 'Home Decor', description: 'Elegant 3D printed name plates for desk or door' },
          { id: 4, name: 'Custom Keychains', price: 499, image: '/images/model1_raw.jpeg', category: 'Accessories', description: 'Carry your memories everywhere' },
          { id: 5, name: 'Couple Gifts Set', price: 3499, image: '/images/model1_raw_generated.jpeg', category: 'Couple Gifts', description: 'Heart-shaped lamps and couple busts' },
          { id: 6, name: 'Corporate Gift Box', price: 4999, image: '/images/globe_front.jpeg', category: 'Corporate', description: 'Premium bulk 3D printed gifts for clients' },
        ]);
      } else {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error loading products:', err);
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
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-2">
            Our <span className="text-accent">Products</span>
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
              className="w-full bg-bg-card border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <SlidersHorizontal size={16} className="text-text-muted shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-accent text-white'
                    : 'bg-bg-card text-text-secondary hover:text-text-primary border border-border-subtle'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-accent" />
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
                className="group bg-bg-card border border-border-subtle rounded-2xl overflow-hidden hover:border-accent/40 transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden bg-bg-secondary">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-bg-primary/80 backdrop-blur-sm text-text-secondary text-[10px] sm:text-xs px-2 py-0.5 rounded-full border border-border-subtle">
                    {product.category}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingId === product.id}
                    className="absolute bottom-2.5 right-2.5 w-9 h-9 bg-accent hover:bg-accent-hover text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                  >
                    {addingId === product.id ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                  </button>
                </div>
                <div className="p-3.5 sm:p-5">
                  <h3 className="text-text-primary font-semibold text-sm sm:text-base mb-1">{product.name}</h3>
                  <p className="text-text-muted text-xs mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-accent font-bold text-base sm:text-lg">₹{product.price}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingId === product.id}
                      className="inline-flex items-center gap-1 text-accent text-xs sm:text-sm font-medium hover:gap-1.5 transition-all sm:hidden"
                    >
                      Add <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingId === product.id}
                      className="hidden sm:inline-flex items-center gap-1.5 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
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
