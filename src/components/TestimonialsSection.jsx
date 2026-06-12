import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya S.',
    location: 'Mumbai',
    text: 'The name lamp turned out better than expectations. It\'s so beautiful and brings back memories every day.',
    image: '/images/globe_front.jpeg',
    avatar: 'PS',
    rating: 5,
  },
  {
    id: 2,
    name: 'Rahul M.',
    location: 'Bangalore',
    text: 'The 3D miniature of my son is so cute! Amazing quality and perfect detailing.',
    image: '/images/model1_raw.jpeg',
    avatar: 'RM',
    rating: 5,
  },
  {
    id: 3,
    name: 'Ankit D.',
    location: 'Delhi',
    text: 'Got a name plate for my desk and everyone loved it! Super premium finish.',
    image: '/images/globe_back.jpeg',
    avatar: 'AD',
    rating: 5,
  },
  {
    id: 4,
    name: 'Neha & Karan',
    location: 'Pune',
    text: 'Perfect anniversary gift! The couple lamp is just magical ❤️',
    image: '/images/model1.jpeg',
    avatar: 'NK',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 2;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const visibleTestimonials = [];
  for (let i = 0; i < itemsPerView; i++) {
    visibleTestimonials.push(testimonials[(currentIndex + i) % testimonials.length]);
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary">
            What Our <span className="text-accent">Customers</span> Say
          </h2>
        </motion.div>

        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 bg-bg-card border border-border-subtle rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors hidden sm:flex"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 bg-bg-card border border-border-subtle rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors hidden sm:flex"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </button>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 overflow-hidden">
            <AnimatePresence mode="wait">
              {visibleTestimonials.map((testimonial, index) => (
                <motion.div
                  key={`${testimonial.id}-${currentIndex}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-bg-card border border-border-subtle rounded-2xl p-5 sm:p-6"
                >
                  <p className="text-text-primary text-sm sm:text-base leading-relaxed mb-5">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="text-text-primary text-sm font-medium">{testimonial.name}</p>
                        <p className="text-text-muted text-xs">{testimonial.location}</p>
                      </div>
                    </div>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center gap-2 mt-6 sm:hidden">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-accent' : 'bg-border-subtle'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
