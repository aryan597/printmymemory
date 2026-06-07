import { motion } from 'framer-motion';

const galleryItems = [
  { id: 1, image: '/images/model1.jpeg', title: 'Painted 3D Face Miniature', category: 'Face Miniatures' },
  { id: 2, image: '/images/model1_raw.jpeg', title: 'Raw 3D Print Bust', category: 'Raw Prints' },
  { id: 3, image: '/images/model1_raw_generated.jpeg', title: 'AI Generated Preview', category: 'Previews' },
  { id: 4, image: '/images/globe_front.jpeg', title: 'Lithophane Lamp Front', category: 'Lamps' },
  { id: 5, image: '/images/globe_back.jpeg', title: 'Lithophane Lamp Back', category: 'Lamps' },
  { id: 6, image: '/images/model1.jpeg', title: 'Corporate Gift Set', category: 'Corporate' },
];

export default function Gallery() {
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-border-subtle"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-text-muted text-xs">{item.category}</p>
                <h3 className="text-text-primary font-semibold text-sm">{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
