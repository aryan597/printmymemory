import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, Box, Truck, Check, ChevronRight, Loader2, ShoppingCart } from 'lucide-react';
import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, title: 'Upload Photo', icon: Image, desc: 'Upload a clear photo of your loved one' },
  { id: 2, title: 'Choose Product', icon: Box, desc: 'Select the type of 3D gift you want' },
  { id: 3, title: 'Place Order', icon: Upload, desc: 'Review and confirm your order' },
  { id: 4, title: 'Get Delivered', icon: Truck, desc: 'Receive your custom 3D print at home' },
];

const products = [
  { id: 1, name: '3D Face Miniature', price: 2499, image: '/images/model1.jpeg', category: 'Personalized' },
  { id: 2, name: 'Lithophane Lamp', price: 1999, image: '/images/globe_front.jpeg', category: 'Lamps' },
  { id: 3, name: 'Name Plate', price: 999, image: '/images/globe_back.jpeg', category: 'Home Decor' },
];

export default function Customize() {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadPreview(reader.result);
      reader.readAsDataURL(file);
      setUploadedImage(file);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }
    setAdding(true);
    try {
      await addToCart({ ...selectedProduct, image: uploadPreview || selectedProduct.image });
      toast.success('Added to cart! Proceed to checkout.');
      navigate('/cart');
    } catch (err) {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <main className="py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            Create Your <span className="text-accent">Custom Gift</span>
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
                  step >= s.id ? 'bg-accent border-accent text-white' : 'bg-bg-card border-border-subtle'
                }`}>
                  {step > s.id ? <Check size={16} /> : s.id}
                </div>
                <span className="text-[10px] mt-1.5 hidden sm:block">{s.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-colors ${step > s.id ? 'bg-accent' : 'bg-border-subtle'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Upload Photo */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">1. Upload Your Photo</h2>
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${uploadPreview ? 'border-accent/40 bg-accent/5' : 'border-border-subtle hover:border-border-hover'}`}>
                {uploadPreview ? (
                  <div className="flex flex-col items-center">
                    <img src={uploadPreview} alt="Preview" className="w-40 h-40 object-cover rounded-xl mb-4 border border-border-subtle" />
                    <button
                      onClick={() => { setUploadPreview(null); setUploadedImage(null); }}
                      className="text-text-secondary hover:text-accent text-sm transition-colors"
                    >
                      Remove & Upload Another
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center">
                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-3">
                      <Upload size={24} className="text-accent" />
                    </div>
                    <p className="text-text-primary font-medium text-sm mb-1">Click to upload photo</p>
                    <p className="text-text-muted text-xs">JPG, PNG up to 10MB</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!uploadPreview}
                  className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
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
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">2. Choose Your Product</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`border rounded-xl p-3 text-left transition-all ${
                      selectedProduct?.id === product.id
                        ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                        : 'border-border-subtle hover:border-border-hover bg-bg-secondary'
                    }`}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-3">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-text-primary font-semibold text-sm">{product.name}</h3>
                    <p className="text-accent font-bold">₹{product.price}</p>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedProduct}
                  className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
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
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">3. Review Your Order</h2>
              <div className="flex gap-4 mb-6">
                <img src={uploadPreview} alt="Your photo" className="w-24 h-24 object-cover rounded-xl border border-border-subtle" />
                <div>
                  <p className="text-text-muted text-xs mb-1">Selected Product</p>
                  <p className="text-text-primary font-semibold">{selectedProduct?.name}</p>
                  <p className="text-accent font-bold text-lg">₹{selectedProduct?.price}</p>
                  <p className="text-text-muted text-xs mt-1">Free shipping across India</p>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
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
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={28} className="text-accent" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Ready to Order!</h2>
              <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
                Your custom {selectedProduct?.name} will be crafted with love and delivered to your doorstep.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {adding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                  Add to Cart & Checkout
                </button>
                <Link
                  to="/shop"
                  className="bg-bg-secondary border border-border-subtle hover:border-border-hover text-text-primary px-6 py-3 rounded-xl font-semibold transition-all inline-flex items-center justify-center gap-2"
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
