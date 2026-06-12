import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, Box, Truck, Check, ChevronRight, Loader2, ShoppingCart, MessageCircle } from 'lucide-react';
import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, TABLES } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '917463812249';

const steps = [
  { id: 1, title: 'Upload Photo', icon: Image, desc: 'Upload a clear photo of your loved one' },
  { id: 2, title: 'Choose Product', icon: Box, desc: 'Select the type of 3D gift you want' },
  { id: 3, title: 'Place Order', icon: Upload, desc: 'Review and confirm your order' },
  { id: 4, title: 'Get Delivered', icon: Truck, desc: 'Receive your custom 3D print at home' },
];

const MAX_FILE_SIZE_MB = 10;

function formatPrice(price) {
  return 'Rs. ' + Number(price).toLocaleString('en-IN');
}

function whatsappLink(product) {
  const url = `https://${window.location.host}/products/${product.id}`;
  const text = `Hi PrintMyMemory, I'm interested in ${product.name}. Link: ${url}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export default function Customize() {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [adding, setAdding] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProductId = Number(searchParams.get('productId')) || null;

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

  const displayProducts = products;

  return (
    <main className="py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
            Create Your Custom Gift
          </h1>
          <p className="text-neutral-400 text-sm max-w-md mx-auto">
            Follow these simple steps to turn your memories into personalized 3D gifts
          </p>
          <a
            href={selectedProduct ? whatsappLink(selectedProduct) : `https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-whatsapp hover:opacity-90 text-white px-5 py-2.5 rounded-full text-sm font-semibold mt-4 transition-all"
          >
            <MessageCircle size={16} /> Prefer to chat? Message us on WhatsApp
          </a>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex flex-col items-center ${step >= s.id ? 'text-white' : 'text-neutral-500'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  step >= s.id ? 'bg-white border-white text-black' : 'bg-neutral-900 border-neutral-800'
                }`}>
                  {step > s.id ? <Check size={16} /> : s.id}
                </div>
                <span className="text-[10px] mt-1.5 hidden sm:block">{s.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-colors ${step > s.id ? 'bg-white/40' : 'bg-neutral-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Upload Photo */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <div className="card p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white mb-4">1. Upload Your Photo</h2>
              <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${uploadPreview ? 'border-white bg-neutral-900' : 'border-neutral-800 hover:border-neutral-600'}`}>
                {uploadPreview ? (
                  <div className="flex flex-col items-center">
                    <img src={uploadPreview} alt="Preview" className="w-40 h-40 object-cover rounded-2xl mb-4 border border-neutral-800" />
                    <button
                      type="button"
                      onClick={() => { setUploadPreview(null); setUploadedImage(null); }}
                      className="text-neutral-400 hover:text-white text-sm transition-colors"
                    >
                      Remove & Upload Another
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center">
                    <div className="w-14 h-14 card rounded-2xl flex items-center justify-center mb-3">
                      <Upload size={24} className="text-white" />
                    </div>
                    <p className="text-white font-medium text-sm mb-1">Click to upload photo</p>
                    <p className="text-neutral-500 text-xs">JPG, PNG up to {MAX_FILE_SIZE_MB}MB</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!uploadPreview}>
                  Next Step <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Choose Product */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <div className="card p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white mb-4">2. Choose Your Product</h2>
              {productsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-white" />
                </div>
              ) : displayProducts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-neutral-500 text-sm">No customised products available right now.</p>
                  <Link to="/shop" className="text-white text-sm hover:underline mt-2 inline-block">Browse our shop</Link>
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
                          ? 'border-white bg-neutral-800'
                          : 'border-neutral-800 hover:border-neutral-600 bg-neutral-900'
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
                      <h3 className="text-white font-semibold text-sm">{product.name}</h3>
                      <p className="text-white font-bold">{formatPrice(product.price)}</p>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-neutral-400 hover:text-white text-sm font-medium transition-colors px-4 py-2 rounded-full hover:bg-neutral-900"
                >
                  Back
                </button>
                <Button onClick={() => setStep(3)} disabled={!selectedProduct}>
                  Next Step <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <div className="card p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white mb-4">3. Review Your Order</h2>
              <div className="flex gap-4 mb-6">
                <img
                  src={uploadPreview}
                  alt="Your photo"
                  className="w-24 h-24 object-cover rounded-2xl border border-neutral-800"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div>
                  <p className="text-neutral-500 text-xs mb-1">Selected Product</p>
                  <p className="text-white font-semibold">{selectedProduct?.name}</p>
                  <p className="text-white font-bold text-lg">{formatPrice(selectedProduct?.price)}</p>
                  <p className="text-neutral-500 text-xs mt-1">Free shipping across India</p>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-neutral-400 hover:text-white text-sm font-medium transition-colors px-4 py-2 rounded-full hover:bg-neutral-900"
                >
                  Back
                </button>
                <Button onClick={() => setStep(4)}>
                  Confirm <Check size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Checkout */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <div className="card p-6 sm:p-8 text-center">
              <div className="w-16 h-16 card rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Ready to Order!</h2>
              <p className="text-neutral-400 text-sm mb-6 max-w-sm mx-auto">
                Your custom {selectedProduct?.name} will be crafted with care and delivered to your doorstep.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleAddToCart} disabled={adding}>
                  {adding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                  Add to Cart & Checkout
                </Button>
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 px-6 py-3 rounded-full font-semibold transition-all"
                >
                  Browse More
                </Link>
              </div>
              <a
                href={selectedProduct ? whatsappLink(selectedProduct) : `https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-whatsapp hover:opacity-90 text-white px-5 py-2.5 rounded-full text-sm font-semibold mt-4 transition-all"
              >
                <MessageCircle size={16} /> Questions? Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
