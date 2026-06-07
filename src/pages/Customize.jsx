import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, Box, Truck, Check } from 'lucide-react';

const steps = [
  { id: 1, title: 'Upload Photo', icon: Image, desc: 'Upload a clear photo of your loved one' },
  { id: 2, title: 'Choose Product', icon: Box, desc: 'Select the type of 3D gift you want' },
  { id: 3, title: 'Place Order', icon: Upload, desc: 'Review and confirm your order' },
  { id: 4, title: 'Get Delivered', icon: Truck, desc: 'Receive your custom 3D print at home' },
];

const products = [
  { id: 1, name: '3D Face Miniature', price: '₹2,499', image: '/images/model1.jpeg' },
  { id: 2, name: 'Lithophane Lamp', price: '₹1,999', image: '/images/globe_front.jpeg' },
  { id: 3, name: 'Name Plate', price: '₹999', image: '/images/globe_back.jpeg' },
];

export default function Customize() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <main className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
            Create Your <span className="text-accent">Custom Gift</span>
          </h1>
          <p className="text-text-secondary max-w-md mx-auto">
            Follow these simple steps to turn your memories into personalized 3D gifts
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-bg-card border border-border-subtle rounded-xl p-5 text-center"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <step.icon size={20} className="text-accent" />
              </div>
              <h3 className="text-text-primary font-semibold mb-1">{step.title}</h3>
              <p className="text-text-muted text-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Product Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold text-text-primary mb-6">1. Choose Your Product</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product.id)}
                className={`bg-bg-card border rounded-xl p-4 text-left transition-all ${
                  selectedProduct === product.id
                    ? 'border-accent shadow-lg shadow-accent/10'
                    : 'border-border-subtle hover:border-border-hover'
                }`}
              >
                <div className="aspect-square rounded-lg overflow-hidden mb-3">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-text-primary font-semibold">{product.name}</h3>
                <p className="text-accent font-bold">{product.price}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold text-text-primary mb-6">2. Upload Your Photo</h2>
          <div className="bg-bg-card border border-dashed border-border-subtle rounded-xl p-8 text-center">
            {uploadedImage ? (
              <div className="flex flex-col items-center">
                <img src={uploadedImage} alt="Uploaded" className="w-48 h-48 object-cover rounded-lg mb-4" />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="text-text-secondary hover:text-accent text-sm"
                >
                  Remove & Upload Another
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Upload size={24} className="text-accent" />
                </div>
                <p className="text-text-primary font-medium mb-1">Click to upload photo</p>
                <p className="text-text-muted text-xs">JPG, PNG up to 10MB</p>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <button
            disabled={!selectedProduct || !uploadedImage}
            className="bg-accent hover:bg-accent-hover disabled:bg-bg-elevated disabled:text-text-muted disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
          >
            {selectedProduct && uploadedImage ? 'Proceed to Checkout' : 'Select Product & Photo to Continue'}
          </button>
        </motion.div>
      </div>
    </main>
  );
}
