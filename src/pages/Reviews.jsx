import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: 'Priya S.',
    location: 'Mumbai',
    rating: 5,
    text: 'The name lamp turned out better than expectations. It\'s so beautiful and brings back memories every day. The quality is outstanding and the packaging was very secure.',
    product: 'Lithophane Lamp',
    image: '/images/globe_front.jpeg',
  },
  {
    id: 2,
    name: 'Rahul M.',
    location: 'Bangalore',
    rating: 5,
    text: 'The 3D miniature of my son is so cute! Amazing quality and perfect detailing. Everyone who sees it wants one for themselves. Highly recommended!',
    product: '3D Face Miniature',
    image: '/images/model1_raw.jpeg',
  },
  {
    id: 3,
    name: 'Ankit D.',
    location: 'Delhi',
    rating: 5,
    text: 'Got a name plate for my desk and everyone loved it! Super premium finish. The delivery was fast and customer service was very helpful throughout.',
    product: 'Name Plate',
    image: '/images/globe_back.jpeg',
  },
  {
    id: 4,
    name: 'Neha & Karan',
    location: 'Pune',
    rating: 5,
    text: 'Perfect anniversary gift! The couple lamp is just magical ❤️ We gifted it to our parents for their 25th anniversary and they were in tears. Thank you PrintMyMemory!',
    product: 'Couple Lamp',
    image: '/images/model1.jpeg',
  },
  {
    id: 5,
    name: 'Vikram P.',
    location: 'Chennai',
    rating: 5,
    text: 'Ordered corporate gifts for my team and they were all blown away. The keychains were detailed and the packaging was professional. Will definitely order again.',
    product: 'Corporate Keychains',
    image: '/images/model1_raw.jpeg',
  },
  {
    id: 6,
    name: 'Sneha R.',
    location: 'Hyderabad',
    rating: 5,
    text: 'I was skeptical at first but the AI preview feature convinced me. The final product looked even better than the preview. My husband loved his birthday gift!',
    product: '3D Face Miniature',
    image: '/images/model1_raw_generated.jpeg',
  },
];

export default function Reviews() {
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
            Customer <span className="text-accent">Reviews</span>
          </h1>
          <p className="text-text-secondary max-w-md mx-auto">
            See what our happy customers have to say about their 3D printed gifts
          </p>
        </motion.div>

        {/* Rating Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-bg-card border border-border-subtle rounded-2xl p-6 sm:p-8 mb-10 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-bold text-text-primary">4.9</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={20} className="text-accent fill-accent" />
              ))}
            </div>
          </div>
          <p className="text-text-secondary text-sm">Based on 5000+ reviews</p>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-bg-card border border-border-subtle rounded-2xl p-5 sm:p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                    {review.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-text-primary font-medium text-sm">{review.name}</p>
                    <p className="text-text-muted text-xs">{review.location}</p>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={12} className="text-accent fill-accent" />
                  ))}
                </div>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                "{review.text}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border-subtle">
                <img
                  src={review.image}
                  alt={review.product}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="text-text-muted text-xs">Purchased</p>
                  <p className="text-text-primary text-sm font-medium">{review.product}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
