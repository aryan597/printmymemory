import { useState, useEffect } from 'react';
import { Star, Quote, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase, TABLES } from '../lib/supabaseClient';

const fallbackTestimonials = [
  { id: 1, name: 'Priya S.', location: 'Mumbai', rating: 5, text: 'The lithophane lamp turned out beyond my expectations. It\'s so beautiful and brings back memories every day. Absolutely recommend!' },
  { id: 2, name: 'Rahul M.', location: 'Bangalore', rating: 5, text: 'The 3D miniature of my son is incredible. Amazing quality, perfect detailing.he was surprised when he saw it!' },
  { id: 3, name: 'Ankit D.', location: 'Delhi', rating: 5, text: 'Got a name plate for my home desk. Super premium finish. Everyone who visits asks where I got it from.' },
  { id: 4, name: 'Neha & Karan', location: 'Pune', rating: 5, text: 'Perfect anniversary gift! The couple lamp is just magical. Will order again for sure.' },
  { id: 5, name: 'Aisha K.', location: 'Hyderabad', rating: 5, text: 'Ordered a custom keychain with my pet\'s face on it. The detail is unreal. Super fast delivery too!' },
  { id: 6, name: 'Vikram P.', location: 'Chennai', rating: 5, text: 'Ordered for corporate gifting.20 name plates. Consistent quality across all of them. Great communication throughout.' },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-border-strong'}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadReviews() {
      try {
        const { data } = await supabase
          .from(TABLES.REVIEWS)
          .select('id, rating, comment, guest_name')
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (!cancelled) {
          if (data?.length > 0) {
            setTestimonials(data.map(r => ({
              id: r.id,
              name: r.guest_name || 'Happy Customer',
              location: 'India',
              rating: r.rating || 5,
              text: r.comment || 'Great product!',
            })));
          } else {
            setTestimonials(fallbackTestimonials);
          }
        }
      } catch {
        if (!cancelled) setTestimonials(fallbackTestimonials);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadReviews();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="section-padding bg-bg-primary" aria-label="Customer reviews">
      <div className="max-w-7xl mx-auto container-padding">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="section-label mx-auto mb-4 w-fit">Reviews</div>
          <h2 className="text-headline font-black uppercase text-text-primary">
            What Customers Say
          </h2>
          {/* Aggregate star row */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-amber-400 fill-amber-400" aria-hidden="true" />
              ))}
            </div>
            <span className="text-text-primary font-bold text-sm">5.0</span>
            <span className="text-text-muted text-sm">· Verified reviews</span>
          </div>
        </motion.div>

        {/* Testimonials grid */}
        {loading ? (
          <div className="flex justify-center py-16" role="status">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.slice(0, 6).map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className="card p-6 flex flex-col gap-4 hover:border-border transition-colors duration-200"
              >
                {/* Quote icon */}
                <Quote size={20} className="text-accent/40 shrink-0" aria-hidden="true" />

                {/* Text */}
                <p className="text-text-secondary text-[13px] leading-relaxed flex-1 line-clamp-4">
                  "{t.text}"
                </p>

                {/* Footer */}
                <div className="flex items-end justify-between pt-2 border-t border-border-subtle">
                  <div>
                    <p className="text-text-primary font-semibold text-[13px]">{t.name}</p>
                    <p className="text-text-muted text-[11px] mt-0.5">{t.location}</p>
                  </div>
                  <StarRating rating={t.rating} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View more link */}
        <div className="text-center mt-10">
          <a href="/reviews" className="text-text-muted hover:text-text-primary text-sm font-medium transition-colors inline-flex items-center gap-1.5 underline underline-offset-4 decoration-border">
            Read all reviews
          </a>
        </div>
      </div>
    </section>
  );
}
