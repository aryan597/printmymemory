import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Sparkles, Printer, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

export default function Customize() {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [adding, setAdding] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProductId = Number(searchParams.get('productId')) || null;

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('is_customizable', true)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (!cancelled) {
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
  }, [preselectedProductId]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image too large. Max 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result);
      setUploadedImage(file);
    };
    reader.readAsDataURL(file);
  };

  const handleAddToCart = async () => {
    if (!selectedProduct || !uploadedImage) return;
    setAdding(true);
    try {
      // Upload image to storage
      const fileName = `customizations/${Date.now()}_${uploadedImage.name}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, uploadedImage);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      // Add to cart with customization
      const cartItem = {
        product: selectedProduct,
        quantity: 1,
        customization: {
          imageUrl: urlData.publicUrl,
          type: 'photo_upload',
        },
      };
      
      // Get existing cart
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      existingCart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(existingCart));
      
      toast.success('Added to cart!');
      navigate('/cart');
    } catch (err) {
      console.error('Add to cart error:', err);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Sparkles size={16} className="text-accent" aria-hidden="true" />
              <span className="text-accent text-sm font-medium">Create Your Own</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Customize Your <span className="gradient-text">3D Print</span>
            </h1>
            <p className="text-text-secondary text-lg">
              Upload your photo and we'll transform it into a stunning 3D printed keepsake.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Progress Indicator */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-center gap-4" aria-label="Customization progress">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-accent' : 'text-text-muted'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-accent text-white' : 'bg-bg-card border border-border-subtle'}`}>1</div>
            <span className="text-sm font-medium hidden sm:inline">Select Product</span>
          </div>
          <div className="w-8 h-px bg-border-subtle" aria-hidden="true" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-accent' : 'text-text-muted'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-accent text-white' : 'bg-bg-card border border-border-subtle'}`}>2</div>
            <span className="text-sm font-medium hidden sm:inline">Upload Photo</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {productsLoading ? (
          <div className="flex justify-center py-16" role="status" aria-label="Loading products">
            <Loader2 size={32} className="animate-spin text-accent" aria-hidden="true" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Printer size={48} className="text-text-muted mx-auto mb-4" aria-hidden="true" />
            <p className="text-text-muted">No customizable products available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Customizable products">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => {
                  setSelectedProduct(product);
                  setStep(2);
                }}
                selected={selectedProduct?.id === product.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Customization Step */}
      {step >= 2 && selectedProduct && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-12 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="card p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-6">Upload Your Photo</h2>
            
            <div className="space-y-6">
              <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${uploadPreview ? 'border-white bg-bg-card' : 'border-border-subtle hover:border-border-hover'}`}>
                {uploadPreview ? (
                  <div className="flex flex-col items-center">
                    <img src={uploadPreview} alt="Preview" className="w-48 h-48 object-cover rounded-xl mb-4 border border-border-subtle" />
                    <button
                      onClick={() => { setUploadPreview(null); setUploadedImage(null); }}
                      className="text-text-muted hover:text-white text-sm transition-colors"
                      aria-label="Remove and upload another photo"
                    >
                      Remove & Upload Another
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center" aria-label="Upload your photo">
                    <div className="w-16 h-16 card rounded-2xl flex items-center justify-center mb-4">
                      <ArrowRight size={28} className="text-white" aria-hidden="true" />
                    </div>
                    <p className="text-white font-medium mb-1">Click to upload photo</p>
                    <p className="text-text-muted text-sm">JPG, PNG up to 10MB</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" aria-label="Upload your photo" />
                  </label>
                )}
              </div>

              {uploadPreview && (
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="w-full btn-primary btn-gradient-shimmer py-4 rounded-xl font-semibold text-lg"
                  aria-label="Add customized product to cart"
                >
                  {adding ? (
                    <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      <Sparkles size={20} aria-hidden="true" />
                      Add to Cart — {formatPrice(selectedProduct.price)}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.section>
      )}
    </main>
  );
}
