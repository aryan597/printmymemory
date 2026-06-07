import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const products = [
  {
    id: 1,
    name: '3D Face Miniatures',
    price: '₹2,499',
    image: '/images/model1.jpeg',
    category: 'Personalized',
  },
  {
    id: 2,
    name: 'Lithophane Lamps',
    price: '₹1,999',
    image: '/images/globe_front.jpeg',
    category: 'Lamps',
  },
  {
    id: 3,
    name: 'Personalized Name Plates',
    price: '₹999',
    image: '/images/globe_back.jpeg',
    category: 'Home Decor',
  },
  {
    id: 4,
    name: 'Custom Keychains',
    price: '₹499',
    image: '/images/model1_raw.jpeg',
    category: 'Accessories',
  },
  {
    id: 5,
    name: 'Couple Gifts Set',
    price: '₹3,499',
    image: '/images/model1_raw_generated.jpeg',
    category: 'Couple',
  },
  {
    id: 6,
    name: 'Corporate Gift Box',
    price: '₹4,999',
    image: '/images/globe_front.jpeg',
    category: 'Corporate',
  },
];

export default function Shop() {
  return (
    <main className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
            Our <span className="text-accent">Products</span>
          </h1>
          <p className="text-text-secondary">Browse our collection of personalized 3D printed gifts</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="group bg-bg-card border border-border-subtle rounded-2xl overflow-hidden hover:border-accent/40 transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden bg-bg-secondary">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-bg-primary/80 backdrop-blur-sm text-text-secondary text-xs px-2 py-1 rounded-full">
                  {product.category}
                </span>
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="text-text-primary font-semibold text-base sm:text-lg mb-1">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-accent font-bold text-lg">{product.price}</span>
                  <button className="inline-flex items-center gap-1.5 text-accent text-sm font-medium hover:gap-2 transition-all">
                    Add to Cart
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
