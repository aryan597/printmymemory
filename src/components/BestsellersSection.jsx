import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const products = [
  {
    id: 1,
    name: '3D Face Miniatures',
    image: '/images/model1.jpeg',
  },
  {
    id: 2,
    name: 'Lithophane Lamps',
    image: '/images/globe_front.jpeg',
  },
  {
    id: 3,
    name: 'Personalized Name Plates',
    image: '/images/globe_back.jpeg',
  },
  {
    id: 4,
    name: 'Custom Keychains',
    image: '/images/model1_raw.jpeg',
  },
  {
    id: 5,
    name: 'Couple Gifts',
    image: '/images/model1_raw_generated.jpeg',
  },
  {
    id: 6,
    name: 'Corporate Gifts',
    image: '/images/globe_front.jpeg',
  },
];

export default function BestsellersSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-2">
              Shop Our <span className="text-accent">Bestsellers</span>
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              Unique 3D printed gifts for every occasion
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors text-sm font-medium mt-3 sm:mt-0"
          >
            View All Products
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
