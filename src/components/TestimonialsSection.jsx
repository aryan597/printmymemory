import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Loader2 } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabaseClient';

const fallbackTestimonials = [
  {
    id: 1,
    name: 'Priya S.',
    location: 'Mumbai',
    rating: 5,
    text: 'The lithophane lamp turned out beyond my expectations. It\'s so beautiful and brings back memories every day.',
    productImage: '/images/products/lamp.jpg',
    avatar: '/images/avatars/avatar1.jpg',
  },
  {
    id: 2,
    name: 'Rahul M.',
    location: 'Bangalore',
    rating: 5,
    text: 'The 3D miniature of my son is so cute! Amazing quality and perfect detailing.',
    productImage: '/images/products/miniature.jpg',
    avatar: '/images/avatars/avatar2.jpg',
  },
  {
    id: 3,
    name: 'Ankit D.',
    location: 'Delhi',
    rating: 5,
    text: 'Got a name plate for my desk and everyone loved it. Super premium finish.',
    productImage: '/images/products/nameplate.jpg',
    avatar: '/images/avatars/avatar3.jpg',
  },
  {
    id: 4,
    name: 'Neha & Karan',
    location: 'Pune',
    rating: 5,
    text: 'Perfect anniversary gift! The couple lamp is just magical.',
    productImage: '/images/products/couple.jpg',
    avatar: '/images/avatars/avatar4.jpg',
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(1);

  // Fetch reviews from Supabase
  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        const { data, error } = await supabase
          .from(TABLES.REVIEWS)
          .select('*, product:products(name, image)')
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!cancelled) {
          if (data && data.length > 0) {
            // Map Supabase reviews to testimonial format
            const mapped = data.map((review, index) => ({
              id: review.id,
              name: review.customer_name || 'Happy Customer',
              location: review.customer_location || 'India',
              rating: review.rating || 5,
              text: review.comment || review.review_text || 'Great product!',
              productImage: review.product?.image || review.product_image || '/images/products/placeholder.jpg',
              avatar: review.customer_avatar || `/images/avatars/avatar${(index % 4) + 1}.jpg`,
            }));
            setTestimonials(mapped);
          } else {
            setTestimonials(fallbackTestimonials);
          }
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
        if (!cancelled) {
          setTestimonials(fallbackTestimonials);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadReviews();
    return () => { cancelled = true };
  }, []);

  // Handle responsive visible count
  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(window.innerWidth >= 1024 ? 2 : 1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const visible = [];
  for (let i = 0; i < visibleCount; i++) {
    visible.push(testimonials[(current + i) % testimonials.length]);
  }

  return (
    <section className="section-padding bg-bg-primary" aria-label="Customer testimonials">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-headline font-bold text-white">
            What Our <span className="text-brand-orange">Customers Say</span>
          </h2>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center py-16" role="status" aria-label="Loading reviews">
            <Loader2 size={28} className="animate-spin text-brand-orange" aria-hidden="true" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-sm">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <>
            {/* Testimonials */}
            <div className="relative">
              <div className="grid lg:grid-cols-2 gap-4">
                {visible.map((t) => (
                  <div
                    key={t.id}
                    className="bg-bg-card rounded-2xl border border-border-subtle overflow-hidden flex flex-col sm:flex-row"
                  >
                    {/* Product image */}
                    <div className="sm:w-2/5 aspect-square sm:aspect-auto relative bg-bg-secondary">
                      <img
                        src={t.productImage}
                        alt={`Product by ${t.name}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/products/placeholder.jpg';
                        }}
                      />
                    </div>
                    {/* Content */}
                    <div className="sm:w-3/5 p-5 flex flex-col justify-center">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(Math.min(t.rating, 5))].map((_, i) => (
                          <Star key={`star-${t.id}-${i}`} size={12} className="text-brand-orange fill-brand-orange" />
                        ))}
                      </div>
                      <p className="text-text-secondary text-sm leading-relaxed mb-4">"{t.text}"</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-bg-secondary overflow-hidden">
                          <img
                            src={t.avatar}
                            alt={t.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.style.background = '#333';
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{t.name}</p>
                          <p className="text-text-muted text-xs">{t.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation arrows */}
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full bg-bg-card border border-border-subtle flex items-center justify-center text-text-secondary hover:text-white hover:border-border transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full bg-bg-card border border-border-subtle flex items-center justify-center text-text-secondary hover:text-white hover:border-border transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
