import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Layers, Sparkles } from 'lucide-react';
import { formatPrice } from '../lib/utils';

export default function ProductCard({ product, index = 0 }) {
  const amsColors = product.ams_colors || [];
  const hasAMS = product.is_ams_compatible && amsColors.length > 0;
  const isCustomised = product.product_type === 'customised';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/products/${product.id}`}
        className="group block"
        aria-label={`${product.name}, ${formatPrice(product.price)}`}
      >
        <div className="card-hover overflow-hidden">
          {/* AMS filament color strip */}
          {hasAMS && (
            <div className="flex h-[3px]" aria-hidden="true">
              {amsColors.slice(0, 6).map((c, i) => (
                <div key={i} className="flex-1" style={{ backgroundColor: c }} />
              ))}
            </div>
          )}

          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-bg-elevated">
            <img
              src={product.image || '/images/products/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              loading="lazy"
              decoding="async"
              width={400}
              height={500}
              onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.jpg'; }}
            />

            {/* Top badges */}
            <div className="absolute top-3 inset-x-3 flex items-start justify-between gap-2" aria-hidden="true">
              {product.category?.name && (
                <span className="text-[10px] font-semibold text-white/90 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
                  {product.category.name}
                </span>
              )}
              <div className="flex gap-1 ml-auto">
                {isCustomised && (
                  <span className="text-[10px] font-bold text-white bg-accent px-2 py-1 rounded-md flex items-center gap-1">
                    <Sparkles size={9} />
                    Custom
                  </span>
                )}
                {hasAMS && (
                  <span className="text-[10px] font-semibold text-white bg-purple-600/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                    <Layers size={9} />
                    Multi-Color
                  </span>
                )}
              </div>
            </div>

            {/* Hover overlay — slide-up reveal */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex flex-col justify-end p-4">
              <p className="text-white text-xs leading-relaxed line-clamp-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                {product.description || 'Handcrafted with precision 3D printing.'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-base">{formatPrice(product.price)}</span>
                <div className="flex items-center gap-1.5 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full">
                  View
                  <ArrowUpRight size={12} />
                </div>
              </div>
            </div>
          </div>

          {/* Info below image */}
          <div className="p-4">
            <h3 className="text-text-primary font-semibold text-[13px] mb-0.5 group-hover:text-accent transition-colors duration-200 line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-text-primary font-bold text-sm">
                {formatPrice(product.price)}
              </span>
              {isCustomised && (
                <span className="text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full font-semibold">
                  Personalizable
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
