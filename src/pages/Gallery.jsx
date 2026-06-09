import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabaseClient';

const fallbackItems = [
  { id: 1, image: '/images/products/model1.jpeg', title: 'Painted 3D Face Miniature', category: 'Face Miniatures' },
  { id: 2, image: '/images/products/model1_raw.jpeg', title: 'Raw 3D Print Bust', category: 'Raw Prints' },
  { id: 3, image: '/images/products/model1_raw_generated.jpeg', title: 'AI Generated Preview', category: 'Previews' },
  { id: 4, image: '/images/products/globe_front.jpeg', title: 'Lithophane Lamp Front', category: 'Lamps' },
  { id: 5, image: '/images/products/globe_back.jpeg', title: 'Lithophane Lamp Back', category: 'Lamps' },
  { id: 6, image: '/images/products/model1.jpeg', title: 'Corporate Gift Set', category: 'Corporate' },
];

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadGallery() {
      try {
        const { data, error } = await supabase
          .from(TABLES.PRODUCTS)
          .select('id, name, image, category:categories(name)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(12);
        if (!cancelled) {
          if (error) throw error;
          if (data && data.length > 0) {
            setItems(data.map(p => ({
              id: p.id,
              image: p.image,
              title: p.name,
              category: p.category?.name || 'Product',
            })));
          } else {
            setItems(fallbackItems);
          }
        }
      } catch (err) {
        console.error('Failed to load gallery:', err);
        if (!cancelled) setItems(fallbackItems);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadGallery();
    return () => { cancelled = true; };
  }, []);

  // Keyboard support for lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox(prev => (prev + 1) % items.length);
      if (e.key === 'ArrowLeft') setLightbox(prev => (prev - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox, items.length]);

  return (
    <main className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
            Our <span className="text-accent">Gallery</span>
          </h1>
          <p className="text-text-secondary max-w-md mx-auto">
            See the beautiful 3D printed creations we've made for our customers
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {items.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setLightbox(index)}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-border-subtle text-left"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = '/images/products/model1.jpeg'; }}
                />
                {/* Always visible overlay on mobile, hover-only on md+ */}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/30 to-transparent flex flex-col justify-end p-4 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-text-muted text-xs">{item.category}</p>
                  <h3 className="text-text-primary font-semibold text-sm">{item.title}</h3>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-bg-primary/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 p-2 bg-bg-card rounded-full text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(prev => (prev - 1 + items.length) % items.length); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-bg-card rounded-full text-text-secondary hover:text-text-primary transition-colors hidden sm:block"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(prev => (prev + 1) % items.length); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-bg-card rounded-full text-text-secondary hover:text-text-primary transition-colors hidden sm:block"
              aria-label="Next image"
            >
              →
            </button>
            <motion.img
              key={lightbox}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={items[lightbox]?.image}
              alt={items[lightbox]?.title}
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => { e.target.src = '/images/products/model1.jpeg'; }}
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
              <p className="text-text-primary font-medium text-sm">{items[lightbox]?.title}</p>
              <p className="text-text-muted text-xs">{items[lightbox]?.category}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
