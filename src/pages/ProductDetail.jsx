import { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, Share2, Truck, ShieldCheck, RotateCcw, ChevronRight,
  Minus, Plus, Loader2, Package, Star, ChevronDown, ChevronUp, ArrowLeft,
  Sparkles, Eye, ShoppingCart, MessageCircle, Send
} from 'lucide-react';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';
import { supabase, TABLES } from '../lib/supabaseClient';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const SESSION_KEY = 'pmm_session_id';
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '917463812249';

function getSessionId() {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = 's_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

function formatPrice(price) {
  return 'Rs. ' + Number(price).toLocaleString('en-IN');
}

function stockStatus(product) {
  if (!product.in_stock || product.stock_quantity <= 0) return { label: 'Out of stock', color: 'text-red-400 bg-red-400/10 border-red-400/20' };
  if (product.stock_quantity < 20) return { label: `Only ${product.stock_quantity} left`, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' };
  return { label: 'In stock', color: 'text-green-400 bg-green-400/10 border-green-400/20' };
}

function whatsappLink(product) {
  const url = `https://${window.location.host}/products/${product.id}`;
  const text = `Hi PrintMyMemory, I'm interested in ${product.name}. Link: ${url}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useContext(CartContext);
  const { user, isAuthenticated } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const imageRef = useRef(null);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });

  const [reviewForm, setReviewForm] = useState({ name: '', email: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const productId = Number(id);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    if (!productId || isNaN(productId)) {
      setError('Invalid product');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: prodErr } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*, category:categories(name, slug)')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (prodErr) throw prodErr;
      if (!data) throw new Error('Product not found');
      setProduct(data);
      setQuantity(1);
      setActiveImage(0);
      trackView(data.id);
      loadRelated(data);
      loadReviews(data.id);
    } catch (err) {
      console.error('Error loading product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (pid) => {
    try {
      const params = new URLSearchParams(location.search);
      await supabase.from(TABLES.PRODUCT_VIEWS).insert({
        product_id: pid,
        viewer_id: isAuthenticated ? user?.id : null,
        session_id: getSessionId(),
        source: params.get('source') || 'direct',
      });
    } catch (err) {
      console.debug('View tracking failed:', err);
    }
  };

  const loadRelated = async (current) => {
    try {
      let query = supabase
        .from(TABLES.PRODUCTS)
        .select('*, category:categories(name)')
        .eq('is_active', true)
        .neq('id', current.id)
        .limit(4);
      if (current.category_id) {
        query = query.eq('category_id', current.category_id);
      }
      const { data, error: relErr } = await query;
      if (relErr) throw relErr;
      setRelated(data || []);
    } catch (err) {
      console.error('Error loading related products:', err);
      setRelated([]);
    }
  };

  const loadReviews = async (pid) => {
    setReviewsLoading(true);
    try {
      const { data, error: revErr } = await supabase
        .from(TABLES.REVIEWS)
        .select('*, profile:profiles(full_name, avatar_url)')
        .eq('product_id', pid)
        .order('created_at', { ascending: false })
        .limit(12);
      if (revErr) throw revErr;
      setReviews(data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const images = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return ['/images/products/model1.jpeg'];
  }, [product]);

  const handleQuantity = (delta) => {
    setQuantity((q) => {
      const next = q + delta;
      if (next < 1) return 1;
      if (product?.stock_quantity && next > product.stock_quantity) return product.stock_quantity;
      return next;
    });
  };

  const handleAddToCart = async (buyNow = false) => {
    if (!product) return;
    if (!product.in_stock || product.stock_quantity <= 0) {
      toast.error('This product is currently out of stock');
      return;
    }
    setAdding(true);
    try {
      await addToCart(product, quantity);
      toast.success(`${product.name} added to cart!`);
      if (buyNow) navigate('/cart');
    } catch (err) {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: product?.name, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success('Product link copied!');
      }
    } catch (_) {
      // user cancelled share
    }
  };

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ active: true, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.email.trim() || !reviewForm.comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewForm.email)) {
      toast.error('Please enter a valid email');
      return;
    }
    setSubmittingReview(true);
    try {
      const payload = {
        product_id: productId,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
        is_approved: true,
        user_id: isAuthenticated ? user?.id : null,
        guest_name: isAuthenticated ? null : reviewForm.name.trim(),
        guest_email: isAuthenticated ? null : reviewForm.email.trim(),
      };
      const { error: revErr } = await supabase.from(TABLES.REVIEWS).insert(payload);
      if (revErr) throw revErr;
      toast.success('Review submitted. Thank you!');
      setReviewForm({ name: '', email: '', rating: 5, comment: '' });
      loadReviews(productId);
    } catch (err) {
      console.error('Review submit error:', err);
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  if (loading) {
    return (
      <main className="py-20 flex items-center justify-center min-h-[60vh]">
        <div className="card p-6 rounded-full">
          <Loader2 size={32} className="animate-spin text-white" />
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="py-16 sm:py-24">
        <div className="max-w-md mx-auto px-4 text-center card p-8 sm:p-10">
          <Package size={48} className="text-neutral-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Product not found</h1>
          <p className="text-neutral-400 text-sm mb-6">{error || "We couldn't find the product you were looking for."}</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-6 py-2.5 rounded-full text-sm font-semibold transition-all">
            <ArrowLeft size={16} /> Browse Products
          </Link>
        </div>
      </main>
    );
  }

  const status = stockStatus(product);
  const categoryName = product.category?.name || 'Shop';
  const isCustomised = product.product_type === 'customised';

  return (
    <main className="py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400 mb-6">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={14} className="text-neutral-600" />
          <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
          <ChevronRight size={14} className="text-neutral-600" />
          <span className="text-neutral-500 truncate max-w-[180px] sm:max-w-xs">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div
              ref={imageRef}
              className="relative aspect-square bg-neutral-900 rounded-2xl overflow-hidden group cursor-crosshair border border-neutral-800"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
            >
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/model1.jpeg'; }}
              />
              {zoom.active && (
                <div
                  className="absolute inset-0 bg-no-repeat opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{
                    backgroundImage: `url(${images[activeImage]})`,
                    backgroundSize: '200%',
                    backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                  }}
                />
              )}
              {isCustomised && (
                <span className="absolute top-3 left-3 bg-white text-black text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Sparkles size={12} /> Customised
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-neutral-900 ${
                      activeImage === idx ? 'border-white' : 'border-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <div className="mb-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-300">
                {categoryName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">{product.name}</h1>

            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 bg-neutral-800 text-white px-2 py-0.5 rounded-lg text-sm font-semibold">
                  <Star size={14} className="fill-white" /> {avgRating}
                </div>
                <span className="text-neutral-400 text-sm">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            <div className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {formatPrice(product.price)}
              <span className="text-neutral-500 text-sm font-normal ml-2">incl. of all taxes</span>
            </div>

            <div className={`inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-xs font-medium border mb-5 ${status.color}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {status.label}
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className={`text-neutral-400 text-sm leading-relaxed ${showFullDesc ? '' : 'line-clamp-3'}`}>
                {product.description || 'No description available.'}
              </p>
              {product.description && product.description.length > 120 && (
                <button
                  onClick={() => setShowFullDesc((s) => !s)}
                  className="inline-flex items-center gap-1 text-white text-xs font-medium mt-2 hover:underline hover:gap-1.5 transition-all"
                >
                  {showFullDesc ? 'Show less' : 'Read more'} {showFullDesc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {product.material && (
                <div className="card p-3 text-center">
                  <p className="text-neutral-500 text-[10px] uppercase tracking-wide">Material</p>
                  <p className="text-white text-sm font-semibold mt-0.5">{product.material}</p>
                </div>
              )}
              {product.weight_grams && (
                <div className="card p-3 text-center">
                  <p className="text-neutral-500 text-[10px] uppercase tracking-wide">Weight</p>
                  <p className="text-white text-sm font-semibold mt-0.5">{product.weight_grams}g</p>
                </div>
              )}
              {product.print_time_minutes && (
                <div className="card p-3 text-center">
                  <p className="text-neutral-500 text-[10px] uppercase tracking-wide">Print Time</p>
                  <p className="text-white text-sm font-semibold mt-0.5">{product.print_time_minutes}m</p>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-neutral-400 text-sm">Quantity</span>
              <div className="flex items-center bg-neutral-900 rounded-full border border-neutral-800">
                <button
                  onClick={() => handleQuantity(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center text-white hover:bg-neutral-800 disabled:opacity-40 rounded-l-full transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-white font-semibold">{quantity}</span>
                <button
                  onClick={() => handleQuantity(1)}
                  disabled={product.stock_quantity ? quantity >= product.stock_quantity : false}
                  className="w-10 h-10 flex items-center justify-center text-white hover:bg-neutral-800 disabled:opacity-40 rounded-r-full transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Button
                onClick={() => handleAddToCart(false)}
                disabled={adding || !product.in_stock || product.stock_quantity <= 0}
                className="flex-1 py-3.5"
              >
                {adding ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                Add to Cart
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleAddToCart(true)}
                disabled={adding || !product.in_stock || product.stock_quantity <= 0}
                className="flex-1 py-3.5"
              >
                Buy Now
              </Button>
            </div>

            {isCustomised && (
              <div className="flex flex-col gap-3 mb-6">
                <Link
                  to={`/customize?productId=${product.id}`}
                  className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 py-3 rounded-full font-semibold transition-all hover:-translate-y-0.5"
                >
                  <Sparkles size={18} /> Customize This Gift
                </Link>
                <a
                  href={whatsappLink(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-whatsapp hover:opacity-90 text-white py-3 rounded-full font-semibold transition-all hover:-translate-y-0.5"
                >
                  <MessageCircle size={18} /> Chat on WhatsApp
                </a>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-start gap-2.5 card p-3">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                  <Truck size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Free Shipping</p>
                  <p className="text-neutral-500 text-[10px]">On orders above Rs. 999</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 card p-3">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Quality Assured</p>
                  <p className="text-neutral-500 text-[10px]">Hand-finished 3D prints</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 card p-3">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                  <RotateCcw size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Easy Returns</p>
                  <p className="text-neutral-500 text-[10px]">7-day return policy</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 card p-3">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                  <Eye size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Design Preview</p>
                  <p className="text-neutral-500 text-[10px]">Approve before printing</p>
                </div>
              </div>
            </div>

            {/* Share / Wishlist */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
              >
                <Share2 size={16} /> Share
              </button>
              <button
                onClick={() => toast('Wishlist coming soon!')}
                className="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
              >
                <Heart size={16} /> Save for later
              </button>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <section className="mt-14 sm:mt-20">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Customer Reviews</h2>

          {/* Review form */}
          <div className="card p-5 sm:p-6 mb-6">
            <h3 className="text-sm font-semibold text-white mb-4">Write a review</h3>
            <form onSubmit={handleReviewSubmit} className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your name"
                value={reviewForm.name}
                onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                className="input"
                required
              />
              <input
                type="email"
                placeholder="Your email"
                value={reviewForm.email}
                onChange={(e) => setReviewForm((f) => ({ ...f, email: e.target.value }))}
                className="input"
                required
              />
              <div className="sm:col-span-2 flex items-center gap-2">
                <span className="text-sm text-neutral-400">Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                      className="p-0.5"
                    >
                      <Star size={18} className={star <= reviewForm.rating ? 'fill-white text-white' : 'text-neutral-600'} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Share your experience..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                className="input sm:col-span-2 min-h-[100px]"
                required
              />
              <div className="sm:col-span-2">
                <Button type="submit" disabled={submittingReview} className="px-6">
                  {submittingReview ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Submit Review
                </Button>
              </div>
            </form>
          </div>

          {reviewsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-white" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="card rounded-2xl p-6 text-center">
              <p className="text-neutral-400 text-sm">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-white text-xs font-bold">
                      {(review.profile?.full_name || review.guest_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{review.profile?.full_name || review.guest_name || 'Verified Buyer'}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={i < review.rating ? 'text-white fill-white' : 'text-neutral-600'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-neutral-400 text-sm">{review.comment || 'No comment'}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-14 sm:mt-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">You May Also Like</h2>
              <Link to="/shop" className="text-white text-sm font-medium hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="group card overflow-hidden hover:border-neutral-600 transition-colors"
                >
                  <div className="relative aspect-square overflow-hidden bg-neutral-900">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/model1.jpeg'; }}
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-neutral-500 text-xs mb-1">{p.category?.name}</p>
                    <h3 className="text-white font-semibold text-sm mb-2 line-clamp-1">{p.name}</h3>
                    <p className="text-white font-bold">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
