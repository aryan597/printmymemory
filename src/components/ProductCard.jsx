import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group card-hover overflow-hidden"
    >
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/model1.jpeg'; }}
        />
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-text-muted text-xs mb-1">{product.category?.name || 'Product'}</p>
            <Link to={`/products/${product.id}`}>
              <h3 className="text-text-primary font-medium text-sm group-hover:text-white transition-colors">{product.name}</h3>
            </Link>
          </div>
          <span className="text-white font-medium text-sm shrink-0">₹{Number(product.price).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </motion.div>
  );
}
