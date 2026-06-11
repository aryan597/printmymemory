import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group glass-card overflow-hidden"
    >
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-bg-secondary/50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/model1.jpeg'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
      <div className="p-4 sm:p-5">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-text-primary font-semibold text-base sm:text-lg mb-1 group-hover:text-accent transition-colors">{product.name}</h3>
        </Link>
        <Link
          to={`/products/${product.id}`}
          className="inline-flex items-center gap-1.5 text-accent text-sm font-medium hover:gap-2.5 transition-all"
        >
          View Product
          <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}
