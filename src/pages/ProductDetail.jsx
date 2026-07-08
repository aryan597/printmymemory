import { useState, useEffect, useRef, useContext, useMemo, lazy, Suspense } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Share2, Truck, ShieldCheck, ChevronRight, ChevronLeft,
  Minus, Plus, Loader2, Package, Star, Sparkles,
  ShoppingCart, MessageCircle, Send, Clock, ArrowRight,
  Box, Layers, Check, Ruler, Flame, Maximize2,
} from 'lucide-react';

const Model3DViewer = lazy(() => import('../components/Model3DViewer'));
import CustomizationForm from '../components/CustomizationForm';
import { supabase, TABLES } from '../lib/supabaseClient';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import PageHead from '../components/PageHead';
import { formatPrice as globalFormatPrice } from '../lib/utils';
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
  return globalFormatPrice(price);
}

function stockStatus(product) {
  if (!product.in_stock || product.stock_quantity <= 0) return { label: 'Out of stock', color: 'text-red-400 bg-red-500/10 border-red-500/20', available: false };
  if (product.stock_quantity < 20) return { label: `Only ${product.stock_quantity} left`, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', available: true };
  return { label: 'In stock', color: 'text-green-400 bg-green-500/10 border-green-500/20', available: true };
}

const WaIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.72 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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
  const [adjustedPrice, setAdjustedPrice] = useState(null);
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
      if (current.category_id) query = query.eq('category_id', current.category_id);
      const { data } = await query;
      setRelated(data || []);
    } catch (err) {
      setRelated([]);
    }
  };

  const loadReviews = async (pid) => {
    setReviewsLoading(true);
    try {
      const { data } = await supabase
        .from(TABLES.REVIEWS)
        .select('*')
        .eq('product_id', pid)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(12);
      setReviews(data || []);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const images = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return ['/images/products/placeholder.jpg'];
  }, [product]);

  // Unified media: photos + an interactive 3D slide (if a model file exists).
  const media = useMemo(() => {
    const list = images.map((url) => ({ type: 'image', url }));
    if (product?.model_file) list.push({ type: '3d', url: product.model_file });
    return list;
  }, [images, product]);

  const handleQuantity = (delta) => {
    setQuantity((q) => Math.max(1, Math.min(q + delta, product?.stock_quantity || 99)));
  };

  const handleAddToCart = async (buyNow = false) => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(product, quantity);
      toast.success(`${product.name} added to cart`);
      if (buyNow) navigate('/cart');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  // Customised products: order only after the customization options are filled.
  const handleCustomizedOrder = async (values) => {
    if (!product) return;
    setAdding(true);
    try {
      // photo_upload fields store a data URL — use it as the custom image.
      const photo = Object.values(values || {}).find(
        (v) => typeof v === 'string' && v.startsWith('data:image')
      );
      await addToCart(product, quantity, {
        customizationValues: values,
        customImage: photo || null,
        unitPrice: adjustedPrice ?? product.price,
      });
      toast.success('Added to cart with your customizations');
      navigate('/cart');
    } catch {
      toast.error('Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name, text: `Check out ${product?.name} on PrintMyMemory`, url });
        return;
      }
    } catch {
      // share dismissed or not supported, fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    } catch {
      // Clipboard API needs HTTPS; fallback with execCommand
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      toast.success('Link copied!');
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
      const { error: revErr } = await supabase.from(TABLES.REVIEWS).insert({
        product_id: productId,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
        user_id: isAuthenticated ? user?.id : null,
        guest_name: isAuthenticated ? null : reviewForm.name.trim(),
        guest_email: isAuthenticated ? null : reviewForm.email.trim(),
      });
      if (revErr) throw revErr;
      toast.success('Review submitted! It will appear after approval.');
      setReviewForm({ name: '', email: '', rating: 5, comment: '' });
      loadReviews(productId);
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const whatsappLink = product
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'm interested in "${product.name}" (${formatPrice(product.price)}). Link: ${window.location.href}`)}`
    : '#';

  // ── Loading / Error states ──
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </main>
    );
  }
  if (error || !product) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <Package size={48} className="text-text-muted mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">{error || 'Product not found'}</h2>
        <Link to="/shop" className="btn-primary mt-4">Browse Products</Link>
      </main>
    );
  }

  const isCustomised = product.product_type === 'customised';
  const status = stockStatus(product);

  // Optional attributes configured in admin — only shown when present.
  const amsColors = Array.isArray(product.ams_colors) ? product.ams_colors : [];
  const hasAMS = product.is_ams_compatible && amsColors.length > 0;
  const tags = Array.isArray(product.tags) ? product.tags : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes.filter((s) => s && (s.size || s.dimensions)) : [];
  const customerNeeds = Array.isArray(product.customer_needs) ? product.customer_needs.filter(Boolean) : [];
  const difficultyLabel = product.difficulty_level
    ? product.difficulty_level.charAt(0).toUpperCase() + product.difficulty_level.slice(1)
    : null;

  return (
    <main className="min-h-screen bg-bg-primary">
      <PageHead
        title={product.name}
        description={product.description?.slice(0, 160) || `${product.name}. Custom 3D printed gift from PrintMyMemory.`}
        image={images[0]}
        path={`/products/${product.id}`}
      />

      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">
        <nav className="flex items-center gap-1.5 text-xs text-text-muted" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-text-primary transition-colors">Shop</Link>
          {product.category?.name && (
            <>
              <ChevronRight size={12} />
              <span className="text-text-secondary">{product.category.name}</span>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-text-primary truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* ── Product Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-[1fr_440px] gap-8 lg:gap-12">

          {/* ── Left: Image Gallery ── */}
          <div className="space-y-3">
            {/* Main media frame (photos + interactive 3D slide) */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-bg-card border border-border-subtle">
              {media[activeImage]?.type === '3d' ? (
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                  </div>
                }>
                  <div className="w-full h-full [&>div]:!h-full [&>div]:!aspect-auto [&>div]:!border-0 [&>div]:!rounded-none">
                    <Model3DViewer url={media[activeImage].url} />
                  </div>
                </Suspense>
              ) : (
                <>
                  <img
                    src={media[activeImage]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                    onError={e => { e.target.onerror = null; e.target.src = '/images/products/placeholder.jpg'; }}
                  />
                  {/* Zoom → open full photo in a new tab (no jumpy hover-zoom) */}
                  <button
                    onClick={() => window.open(media[activeImage]?.url, '_blank', 'noopener')}
                    className="absolute bottom-4 right-4 w-9 h-9 rounded-full glass flex items-center justify-center text-text-primary/80 hover:text-text-primary transition-colors"
                    aria-label="Open full photo in a new tab" title="Open full photo"
                  >
                    <Maximize2 size={16} />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                {isCustomised && <span className="tb-sticker tb-sticker--orange">Customizable</span>}
                {product.is_bestseller && <span className="tb-sticker tb-sticker--ink"><Flame size={11} /> Bestseller</span>}
                {product.is_featured && <span className="tb-sticker tb-sticker--ink"><Star size={11} className="fill-current" /> Featured</span>}
                {hasAMS && <span className="tb-sticker"><Layers size={11} /> Multi-Color</span>}
                {product.stock_quantity > 0 && product.stock_quantity < 20 && <span className="tb-sticker">Only {product.stock_quantity} left</span>}
              </div>

              {/* Nav arrows */}
              {media.length > 1 && (
                <>
                  <button onClick={() => setActiveImage(i => (i - 1 + media.length) % media.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center text-text-primary/70 hover:text-text-primary transition-colors" aria-label="Previous">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setActiveImage(i => (i + 1) % media.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center text-text-primary/70 hover:text-text-primary transition-colors" aria-label="Next">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails (photos + 3D) */}
            {media.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {media.map((m, i) => (
                  <button key={`thumb-${i}`} onClick={() => setActiveImage(i)}
                    className={`w-16 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all flex items-center justify-center bg-bg-elevated ${
                      i === activeImage ? 'border-accent ring-1 ring-accent/30' : 'border-border-subtle hover:border-border'
                    }`}
                    aria-label={m.type === '3d' ? 'View 3D model' : `View photo ${i + 1}`}
                  >
                    {m.type === '3d' ? (
                      <span className="flex flex-col items-center gap-0.5">
                        <Box size={16} className="text-accent" />
                        <span className="text-[8px] font-bold text-text-secondary">3D</span>
                      </span>
                    ) : (
                      <img src={m.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Info ── */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* Category + Share */}
            <div className="flex items-center justify-between">
              {product.category?.name && (
                <span className="text-accent text-xs font-semibold uppercase tracking-widest">{product.category.name}</span>
              )}
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                aria-label="Share"
              >
                <Share2 size={14} />
              </button>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-text-primary leading-tight">{product.name}</h1>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={star <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-text-muted'}
                    />
                  ))}
                </div>
                <span className="text-text-primary text-sm font-semibold">{avgRating}</span>
                <span className="text-text-muted text-sm">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="gradient-text text-3xl font-black">{formatPrice(product.price)}</span>
              {product.compare_price && product.compare_price > product.price && (
                <>
                  <span className="text-text-muted text-lg line-through">{formatPrice(product.compare_price)}</span>
                  <span className="text-green-400 text-sm font-semibold">
                    {Math.round((1 - product.price / product.compare_price) * 100)}% off
                  </span>
                </>
              )}
            </div>

            {/* Stock status */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${status.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${status.available ? 'bg-green-400' : 'bg-red-400'}`} />
              {status.label}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p className={`text-text-secondary text-sm leading-relaxed ${showFullDesc ? '' : 'line-clamp-3'}`}>
                  {product.description}
                </p>
                {product.description.length > 150 && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="text-accent text-xs font-medium mt-1.5 hover:underline"
                  >
                    {showFullDesc ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            {/* Specs chips */}
            <div className="flex flex-wrap gap-2">
              {product.material && (
                <span className="px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-subtle text-xs text-text-secondary">
                  {product.material}
                </span>
              )}
              {product.weight_grams && (
                <span className="px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-subtle text-xs text-text-secondary">
                  {product.weight_grams}g
                </span>
              )}
              {(product.print_time_hours || product.print_time_minutes) && (
                <span className="px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-subtle text-xs text-text-secondary flex items-center gap-1">
                  <Clock size={10} />
                  ~{product.print_time_hours
                    ? `${product.print_time_hours}hrs`
                    : product.print_time_minutes > 60
                      ? `${Math.round(product.print_time_minutes / 60)}hrs`
                      : `${product.print_time_minutes}min`}
                </span>
              )}
              {difficultyLabel && (
                <span className="px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-subtle text-xs text-text-secondary">
                  {difficultyLabel} to make
                </span>
              )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-medium text-accent">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* AMS colors */}
            {hasAMS && (
              <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle">
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={14} className="text-accent" />
                  <p className="text-text-primary text-sm font-semibold">Multi-Color Printing</p>
                  <span className="text-text-muted text-xs">({amsColors.length} colors)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {amsColors.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span
                        className="w-6 h-6 rounded-full border border-white/20 shadow-inner"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available sizes */}
            {sizes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Ruler size={14} className="text-accent" />
                  <p className="text-text-primary text-sm font-semibold">Available Sizes</p>
                </div>
                <div className="space-y-2">
                  {sizes.map((s, i) => (
                    <div key={i} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle">
                      <div className="min-w-0">
                        <p className="text-text-primary text-sm font-medium">{s.size || `Option ${i + 1}`}</p>
                        {s.dimensions && <p className="text-text-muted text-xs">{s.dimensions}</p>}
                      </div>
                      {s.price ? (
                        <span className="text-accent text-sm font-semibold shrink-0">{formatPrice(s.price)}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What we'll need from the customer */}
            {customerNeeds.length > 0 && (
              <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle">
                <p className="text-text-primary text-sm font-semibold mb-3">What we'll need from you</p>
                <ul className="space-y-2">
                  {customerNeeds.map((need, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={10} className="text-accent" />
                      </span>
                      <span className="text-text-secondary text-sm leading-snug">{need}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border-subtle" />

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-text-muted text-sm font-medium">Qty</span>
              <div className="flex items-center bg-bg-card rounded-xl border border-border-subtle">
                <button
                  onClick={() => handleQuantity(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center text-text-primary hover:bg-bg-elevated disabled:opacity-30 rounded-l-xl transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-text-primary font-bold text-sm">{quantity}</span>
                <button
                  onClick={() => handleQuantity(1)}
                  disabled={product.stock_quantity ? quantity >= product.stock_quantity : false}
                  className="w-10 h-10 flex items-center justify-center text-text-primary hover:bg-bg-elevated disabled:opacity-30 rounded-r-xl transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-text-muted text-xs">
                Total: <span className="text-text-primary font-semibold">{formatPrice(product.price * quantity)}</span>
              </span>
            </div>

            {/* Order area */}
            {isCustomised ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-accent/25 bg-accent/[0.04] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={15} className="text-accent" />
                    <p className="text-text-primary text-sm font-semibold">Personalise your order</p>
                  </div>
                  {/* Renders this product's admin-defined options, live price, and
                      "Confirm" → adds to cart with the customization values. */}
                  <CustomizationForm
                    productId={product.id}
                    onPriceChange={setAdjustedPrice}
                    onSubmit={handleCustomizedOrder}
                  />
                </div>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="btn-green w-full py-3.5 flex items-center justify-center gap-2 text-sm font-bold">
                  <WaIcon size={15} /> Prefer to talk? Order on WhatsApp
                </a>
              </div>
            ) : (
              <div className="space-y-2.5">
                <button onClick={() => handleAddToCart(true)} disabled={adding || !status.available}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm font-bold">
                  {adding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                  Buy Now
                </button>
                <button onClick={() => handleAddToCart(false)} disabled={adding || !status.available}
                  className="btn-secondary w-full py-3.5 flex items-center justify-center gap-2 text-sm font-bold">
                  Add to Cart
                </button>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="btn-green w-full py-3.5 flex items-center justify-center gap-2 text-sm font-bold">
                  <WaIcon size={15} /> Order on WhatsApp
                </a>
              </div>
            )}

            {/* Trust row */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: Truck, title: 'Flat ₹50 Shipping', sub: 'On every order' },
                { icon: ShieldCheck, title: 'Quality Assured', sub: 'Hand-finished prints' },
                { icon: Clock, title: 'Ships in 48hrs', sub: 'Fast turnaround' },
                { icon: Package, title: 'Secure Packaging', sub: 'Foam-wrapped delivery' },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-center gap-2.5 p-3 rounded-xl bg-bg-card border border-border-subtle">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text-primary text-[11px] font-semibold leading-tight">{title}</p>
                    <p className="text-text-muted text-[10px]">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reviews Section ── */}
        <div className="mt-16 pt-10 border-t border-border-subtle">
          <div className="grid lg:grid-cols-[340px_1fr] gap-10">
            {/* Review form */}
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-4">Write a Review</h3>
              <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
                <div>
                  <label className="text-text-muted text-xs font-medium mb-1.5 block">Name</label>
                  <input
                    type="text"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-text-muted text-xs font-medium mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={reviewForm.email}
                    onChange={(e) => setReviewForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="text-text-muted text-xs font-medium mb-1.5 block">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                        className="p-0.5"
                      >
                        <Star
                          size={20}
                          className={star <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-text-muted'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-text-muted text-xs font-medium mb-1.5 block">Your Review</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 resize-none h-24"
                    placeholder="Share your experience..."
                  />
                </div>
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm"
                >
                  {submittingReview ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Submit Review
                </button>
              </div>
            </div>

            {/* Reviews list */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text-primary">Customer Reviews</h3>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={12} className={star <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-text-muted'} />
                      ))}
                    </div>
                    <span className="text-text-primary text-sm font-semibold">{avgRating}</span>
                    <span className="text-text-muted text-xs">({reviews.length})</span>
                  </div>
                )}
              </div>

              {reviewsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-accent" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-bg-card border border-border-subtle">
                  <Star size={28} className="text-text-muted mx-auto mb-3" />
                  <p className="text-text-secondary text-sm">No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-2xl bg-bg-card border border-border-subtle">
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent text-xs font-bold">
                          {(review.guest_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primary text-sm font-semibold">{review.guest_name || 'Verified Buyer'}</p>
                          <div className="flex items-center gap-1.5">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} size={10} className={i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-text-muted'} />
                              ))}
                            </div>
                            <span className="text-text-muted text-[10px]">{new Date(review.created_at).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-text-secondary text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border-subtle">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">You May Also Like</h2>
              <Link to="/shop" className="text-accent text-sm font-medium flex items-center gap-1 hover:underline">
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={`/products/${item.id}`}
                  className="group rounded-2xl overflow-hidden bg-bg-card border border-border-subtle hover:border-accent/30 transition-all"
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={(Array.isArray(item.images) && item.images[0]) || item.image || '/images/products/placeholder.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={e => { e.target.onerror = null; e.target.src = '/images/products/placeholder.jpg'; }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-text-primary text-sm font-semibold line-clamp-1">{item.name}</p>
                    <p className="gradient-text text-sm font-bold mt-0.5">{formatPrice(item.price)}</p>
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
