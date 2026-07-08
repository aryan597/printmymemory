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
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/products/${product.id}`}
        className="group block"
        aria-label={`${product.name}, ${formatPrice(product.price)}`}
      >
        <div className="card-hover overflow-hidden">
          {/* AMS filament color strip */}
          {hasAMS && (
            <div className="flex h-[6px] border-b-2 border-border" aria-hidden="true">
              {amsColors.slice(0, 6).map((c, i) => (
                <div key={i} className="flex-1" style={{ backgroundColor: c }} />
              ))}
            </div>
          )}

          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-bg-elevated">
            <img
              src={(Array.isArray(product.images) && product.images[0]) || product.image || '/images/products/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
              loading="lazy"
              decoding="async"
              width={400}
              height={500}
              onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.jpg'; }}
            />

            {/* Top badges */}
            <div className="absolute top-2.5 inset-x-2.5 flex items-start justify-between gap-2" aria-hidden="true">
              {product.category?.name && (
                <span className="tb-sticker">{product.category.name}</span>
              )}
              <div className="flex flex-col gap-1.5 ml-auto items-end">
                {isCustomised && (
                  <span className="tb-sticker tb-sticker--orange"><Sparkles size={9} /> Custom</span>
                )}
                {hasAMS && (
                  <span className="tb-sticker tb-sticker--ink"><Layers size={9} /> Multi-Color</span>
                )}
              </div>
            </div>

            {/* Hover overlay — slide-up reveal */}
            <div className="absolute inset-x-0 bottom-0 bg-bg-primary border-t-2 border-border translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex flex-col justify-end p-3">
              <p className="text-text-secondary text-xs leading-relaxed line-clamp-2 mb-2.5">
                {product.description || 'Handcrafted with precision 3D printing.'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-text-primary font-mono-tb font-bold text-base">{formatPrice(product.price)}</span>
                <div className="flex items-center gap-1.5 bg-accent text-white text-xs font-bold uppercase px-2.5 py-1 border-2 border-border">
                  View
                  <ArrowUpRight size={12} />
                </div>
              </div>
            </div>
          </div>

          {/* Info below image */}
          <div className="p-3.5 border-t-2 border-border">
            <h3 className="text-text-primary font-bold text-[13px] mb-1 group-hover:text-accent transition-colors line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-text-primary font-mono-tb font-bold text-sm">{formatPrice(product.price)}</span>
              {isCustomised && (
                <span className="text-[10px] text-accent border border-accent px-1.5 py-0.5 font-bold uppercase">
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
