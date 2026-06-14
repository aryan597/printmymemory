import { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, Share2, Truck, ShieldCheck, RotateCcw, ChevronRight,
  Minus, Plus, Loader2, Package, Star, ArrowLeft,
  Sparkles, ShoppingCart, MessageCircle, Send
} from 'lucide-react';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';
import { supabase, TABLES } from '../lib/supabaseClient';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const SESSION_KEY = 'pmm_session_id';
const WHATSAPP_NUMBER = '919471725271';

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
  const [reviewsLoading, setReviewsLoading] = useState(false);
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
      // Fire and forget - don't await these so loading state resolves quickly
      trackView(data.id);
      loadRelated(data);
      loadReviews(productId);
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
      const { data, error } = await supabase
        .from(TABLES.REVIEWS)
        .select('*')
        .eq('product_id', pid)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Reviews query error:', error);
        setReviews([]);
      } else {
        setReviews(data || []);
      }
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
    setQuantity((q) => Math.max(1, Math.min(q + delta, product?.stock_quantity || 99)));
  };

  const handleAddToCart = async (buyNow = false) => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(product, quantity);
      toast.success(`${product.name} added to cart`);
      if (buyNow) {
        navigate('/cart');
      }
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
    } catch {
      // ignore
    }
  };

  const handleSubmitReview = async () => {
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
        user_id: isAuthenticated ? user?.id : null,
        guest_name: isAuthenticated ? null : reviewForm.name.trim(),
        guest_email: isAuthenticated ? null : reviewForm.email.trim(),
      };
      const { error: revErr } = await supabase.from(TABLES.REVIEWS).insert(payload);
      if (revErr) throw revErr;
      toast.success('Review submitted! It will appear after approval.');
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
      <main className="section-padding flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-white" />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="section-padding flex flex-col items-center justify-center min-h-[60vh]">
        <Package size={48} className="text-neutral-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">{error || 'Product not found'}</h2>
        <Link to="/shop" className="btn-primary mt-4">Browse Products</Link>
      </main>
    );
  }

  const isCustomised = product.product_type === 'customised';
  const status = stockStatus(product);

  return (
    <main className="section-padding">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
          <ChevronRight size={14} />
          <span className="text-white">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Images */}
          <div className="space-y-4">
            <div
              ref={imageRef}
              className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 cursor-zoom-in"
              onMouseMove={(e) => {
                const rect = imageRef.current.getBoundingClientRect();
                setZoom({
                  active: true,
                  x: ((e.clientX - rect.left) / rect.width) * 100,
                  y: ((e.clientY - rect.top) / rect.height) * 100,
                });
              }}
              onMouseLeave={() => setZoom({ active: false, x: 50, y: 50 })}
            >
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300"
                style={zoom.active ? {
                  transform: 'scale(2)',
                  transformOrigin: `${zoom.x}% ${zoom.y}%`,
                } : {}}
                loading="eager"
                decoding="async"
              />
              {product.product_type === 'customised' && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-brand-orange text-white text-xs font-medium">
                  Customizable
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={`thumb-${i}`}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                      i === activeImage ? 'border-white' : 'border-transparent hover:border-neutral-600'
                    }`}
                    aria-label={`View image ${i + 1} of ${images.length}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-neutral-500 text-xs uppercase tracking-wide mb-1">{product.category?.name}</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{product.name}</h1>
              </div>
              <div className="flex gap-2">
                <IconButton onClick={handleShare} ariaLabel="Share product">
                  <Share2 size={18} />
                </IconButton>
              </div>
            </div>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={`header-star-${star}`}
                      size={16}
                      className={star <= Math.round(avgRating) ? 'text-brand-orange fill-brand-orange' : 'text-neutral-600'}
                    />
                  ))}
                </div>
                <span className="text-white text-sm font-medium">{avgRating}</span>
                <span className="text-neutral-400 text-sm">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}

            {/* Price */}
            <div className="mb-4">
              <p className="text-3xl font-bold text-white">{formatPrice(product.price)}</p>
              {product.compare_price && (
                <p className="text-neutral-500 text-sm line-through">{formatPrice(product.compare_price)}</p>
              )}
            </div>

            {/* Status */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium w-fit mb-4 ${status.color}`}>
              <Package size={12} />
              {status.label}
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className={`text-neutral-400 text-sm leading-relaxed ${showFullDesc ? '' : 'line-clamp-3'}`}>
                {product.description}
              </p>
              {product.description && product.description.length > 150 && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="text-white text-xs font-medium mt-1 hover:underline"
                >
                  {showFullDesc ? 'Show less' : 'Read more'}
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
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:opacity-90 text-white py-3 rounded-full font-semibold transition-all hover:-translate-y-0.5"
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
                  <Package size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Secure Packaging</p>
                  <p className="text-neutral-500 text-[10px]">Protective foam wrap</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Review form */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-bold text-white mb-4">Write a review</h3>
              <div className="card p-5 space-y-4">
                <div>
                  <label className="text-neutral-400 text-xs mb-1 block">Name</label>
                  <input
                    type="text"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                    className="input w-full"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-xs mb-1 block">Email</label>
                  <input
                    type="email"
                    value={reviewForm.email}
                    onChange={(e) => setReviewForm((f) => ({ ...f, email: e.target.value }))}
                    className="input w-full"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-xs mb-1 block">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`form-star-${star}`}
                        onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                        className="p-1"
                      >
                        <Star
                          size={18}
                          className={star <= reviewForm.rating ? 'text-white fill-white' : 'text-neutral-600'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-neutral-400 text-xs mb-1 block">Review</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    className="input w-full h-24 resize-none"
                    placeholder="Share your experience..."
                  />
                </div>
                <Button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="w-full"
                >
                  {submittingReview ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Submit Review
                </Button>
              </div>
            </div>

            {/* Reviews list */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Customer Reviews</h3>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={`reviews-header-star-${star}`}
                          size={14}
                          className={star <= Math.round(avgRating) ? 'text-brand-orange fill-brand-orange' : 'text-neutral-600'}
                        />
                      ))}
                    </div>
                    <span className="text-white text-sm font-medium">{avgRating}</span>
                    <span className="text-neutral-400 text-sm">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                  </div>
                )}
              </div>

              {reviewsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-white" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-neutral-400 text-sm">No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="card p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-white text-xs font-bold">
                          {(review.guest_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{review.guest_name || 'Verified Buyer'}</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={`star-${review.id}-${i}`}
                                size={10}
                                className={i <= review.rating ? 'text-white fill-white' : 'text-neutral-600'}
                              />
                            ))}
                            <span className="text-neutral-500 text-xs ml-1">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-neutral-400 text-sm">{review.comment || 'No comment'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-12 pt-8 border-t border-neutral-800">
            <h2 className="text-xl font-bold text-white mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={`/products/${item.id}`}
                  className="group card-hover overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden bg-neutral-900">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-white text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-neutral-400 text-xs mt-0.5">{formatPrice(item.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
