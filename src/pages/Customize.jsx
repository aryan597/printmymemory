import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, Box, Truck, Check, ChevronRight, Loader2, ShoppingCart } from 'lucide-react';
import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, TABLES } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, title: 'Upload Photo', icon: Image, desc: 'Upload a clear photo of your loved one' },
  { id: 2, title: 'Choose Product', icon: Box, desc: 'Select the type of 3D gift you want' },
  { id: 3, title: 'Place Order', icon: Upload, desc: 'Review and confirm your order' },
  { id: 4, title: 'Get Delivered', icon: Truck, desc: 'Receive your custom 3D print at home' },
];

const MAX_FILE_SIZE_MB = 10;

export default function Customize() {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [adding, setAdding] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProductId = Number(searchParams.get('productId')) || null;

  // Load customised products from DB
  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from(TABLES.PRODUCTS)
          .select('*, category:categories(name)')
          .eq('is_active', true)
          .eq('product_type', 'customised')
          .order('created_at', { ascending: false });
        if (!cancelled) {
          if (error) throw error;
          setProducts(data || []);
          if (preselectedProductId) {
            const preselected = data?.find((p) => p.id === preselectedProductId);
            if (preselected) setSelectedProduct(preselected);
          }
        }
      } catch (err) {
        console.error('Failed to load customised products:', err);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    }
    loadProducts();
    return () => { cancelled = true; };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG).');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setUploadPreview(reader.result);
    reader.readAsDataURL(file);
    setUploadedImage(file);
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }
    setAdding(true);
    try {
      // Pass the uploaded photo as custom_image so it's preserved for authenticated users
      await addToCart(
        { ...selectedProduct, image: uploadPreview || selectedProduct.image },
        1,
        uploadPreview || null
      );
      toast.success('Added to cart! Proceed to checkout.');
      navigate('/cart');
    } catch (err) {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const displayProducts = products.length > 0 ? products : [];

  return (
    <main className="py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            Create Your <span className="gradient-text">Custom Gift</span>
          </h1>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            Follow these simple steps to turn your memories into personalized 3D gifts
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex flex-col items-center ${step >= s.id ? 'text-accent' : 'text-text-muted'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  step >= s.id ? 'bg-gradient-to-br from-accent to-amber-500 border-accent text-white shadow-glow-sm' : 'glass border-glass-border'
                }`}>
                  {step > s.id ? <Check size={16} /> : s.id}
                </div>
                <span className="text-[10px] mt-1.5 hidden sm:block">{s.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-colors ${step > s.id ? 'bg-accent' : 'bg-glass-border-strong'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Upload Photo */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <div className="glass-strong rounded-[2rem] p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">1. Upload Your Photo</h2>
              <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${uploadPreview ? 'border-accent/40 bg-accent/5' : 'border-glass-border hover:border-glass-border-strong'}`}>
                {uploadPreview ? (
                  <div className="flex flex-col items-center">
                    <img src={uploadPreview} alt="Preview" className="w-40 h-40 object-cover rounded-2xl mb-4 border border-glass-border" />
                    <button
                      type="button"
                      onClick={() => { setUploadPreview(null); setUploadedImage(null); }}
                      className="text-text-secondary hover:text-accent text-sm transition-colors"
                    >
                      Remove & Upload Another
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center">
                    <div className="w-14 h-14 glass-strong rounded-2xl flex items-center justify-center mb-3">
                      <Upload size={24} className="text-accent" />
                    </div>
                    <p className="text-text-primary font-medium text-sm mb-1">Click to upload photo</p>
                    <p className="text-text-muted text-xs">JPG, PNG up to {MAX_FILE_SIZE_MB}MB</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!uploadPreview}
                  className="bg-gradient-to-r from-accent to-amber-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 shadow-glow-sm hover:shadow-glow"
                >
                  Next Step <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Choose Product */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <div className="glass-strong rounded-[2rem] p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">2. Choose Your Product</h2>
              {productsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-accent" />
                </div>
              ) : displayProducts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-text-muted text-sm">No customised products available right now.</p>
                  <Link to="/shop" className="text-accent text-sm hover:underline mt-2 inline-block">Browse our shop</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {displayProducts.map((product) => (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`border rounded-xl p-3 text-left transition-all ${
                        selectedProduct?.id === product.id
                          ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                          : 'border-border-subtle hover:border-border-hover bg-bg-secondary'
                      }`}
                    >
                      <div className="aspect-square rounded-xl overflow-hidden mb-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/images/products/model1.jpeg'; }}
                        />
                      </div>
                      <h3 className="text-text-primary font-semibold text-sm">{product.name}</h3>
                      <p className="text-accent font-bold">₹{Number(product.price).toLocaleString('en-IN')}</p>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors px-4 py-2 rounded-full hover:bg-glass"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!selectedProduct}
                  className="bg-gradient-to-r from-accent to-amber-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 shadow-glow-sm hover:shadow-glow"
                >
                  Next Step <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <div className="glass-strong rounded-[2rem] p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">3. Review Your Order</h2>
              <div className="flex gap-4 mb-6">
                <img
                  src={uploadPreview}
                  alt="Your photo"
                  className="w-24 h-24 object-cover rounded-2xl border border-glass-border"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div>
                  <p className="text-text-muted text-xs mb-1">Selected Product</p>
                  <p className="text-text-primary font-semibold">{selectedProduct?.name}</p>
                  <p className="text-accent font-bold text-lg">₹{Number(selectedProduct?.price).toLocaleString('en-IN')}</p>
                  <p className="text-text-muted text-xs mt-1">Free shipping across India</p>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors px-4 py-2 rounded-full hover:bg-glass"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="bg-gradient-to-r from-accent to-amber-500 hover:opacity-90 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 shadow-glow-sm hover:shadow-glow"
                >
                  Confirm <Check size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Checkout */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 sm:p-8 text-center">
              <div className="w-16 h-16 glass-strong rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={28} className="text-accent" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Ready to Order!</h2>
              <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
                Your custom {selectedProduct?.name} will be crafted with love and delivered to your doorstep.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="bg-gradient-to-r from-accent to-amber-500 hover:opacity-90 disabled:opacity-60 text-white px-6 py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow"
                >
                  {adding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                  Add to Cart & Checkout
                </button>
                <Link
                  to="/shop"
                  className="glass hover:border-glass-border-strong text-text-primary px-6 py-3 rounded-full font-semibold transition-all inline-flex items-center justify-center gap-2"
                >
                  Browse More
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {!isAuthenticated && (
          <p className="text-center text-text-muted text-xs">
            <Link to="/login" className="text-accent hover:underline">Sign in</Link> to save your customization and track your order
          </p>
        )}
      </div>
    </main>
  );
}
