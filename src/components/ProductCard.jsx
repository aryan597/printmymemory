import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Layers } from 'lucide-react';
import { formatPrice } from '../lib/utils';

export default function ProductCard({ product, index = 0 }) {
  const amsColors = product.ams_colors || [];
  const hasAMS = product.is_ams_compatible && amsColors.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link 
        to={`/products/${product.id}`} 
        className="group block"
        aria-label={`View ${product.name} details - ${formatPrice(product.price)}`}
      >
        <div className="card-hover overflow-hidden rounded-2xl">
          {/* AMS Color Strip */}
          {hasAMS && (
            <div className="flex h-1.5" aria-hidden="true">
              {amsColors.slice(0, 4).map((c, i) => (
                <div key={`ams-${i}`} className="flex-1" style={{ backgroundColor: c }} />
              ))}
            </div>
          )}
          
          <div className="relative aspect-square overflow-hidden bg-bg-card">
            <img
              src={product.image || '/images/products/model1.jpeg'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
              decoding="async"
              width={400}
              height={400}
              onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/model1.jpeg'; }}
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="text-white text-sm font-medium">View Details</span>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center" aria-hidden="true">
                  <ArrowUpRight size={14} className="text-white" />
                </div>
              </div>
            </div>

            {/* AMS Badge */}
            {hasAMS && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm flex items-center gap-1">
                <Layers size={10} className="text-white" aria-hidden="true" />
                <span className="text-[10px] text-white font-medium">Multi-Color</span>
              </div>
            )}
          </div>
          
          <div className="p-4">
            <p className="text-text-muted text-xs mb-1">{product.category?.name || 'Product'}</p>
            <h3 className="text-text-primary font-medium text-sm mb-2 group-hover:text-brand-orange transition-colors line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-text-primary font-bold text-sm">
                {formatPrice(product.price)}
              </span>
              {product.product_type === 'customised' && (
                <span className="text-[10px] text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full font-medium">
                  Custom
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
