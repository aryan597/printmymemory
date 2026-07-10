import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const MODELS_PER_LEVEL = 10;

/**
 * Grid of print-ready designs sourced via Google Custom Search (MakerWorld, Printables, etc.)
 */
export default function UniversalModelsSection({ searchQuery = '', embedded = false, showHeader = true }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const requestIdRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (!debouncedQuery) return;
    const requestId = ++requestIdRef.current;
    let cancelled = false;

    async function load() {
      setLoading(true); setFailed(false); setErrorMsg('');
      try {
        const { data, error } = await supabase.functions.invoke('design-search-google', {
          body: { query: debouncedQuery }
        });
        
        if (cancelled || requestId !== requestIdRef.current) return;
        
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        
        const batch = data?.models || [];
        setModels(batch.slice(0, MODELS_PER_LEVEL));
        setFailed(batch.length === 0);
      } catch (err) {
        if (!cancelled && requestId === requestIdRef.current) {
          setModels([]);
          setFailed(true);
          // If the error is 503, it means keys aren't set up yet
          if (err.message?.includes('not configured')) {
            setErrorMsg('Google Custom Search not configured. Falling back to CGTrader (if implemented).');
          }
        }
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  if (!loading && (failed || models.length === 0)) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted text-sm">
          {errorMsg || `No designs found for “${debouncedQuery}”.`}
        </p>
      </div>
    );
  }

  return (
    <section className={embedded ? '' : 'mt-16 pt-12 border-t border-border-subtle'} aria-label="Universal design ideas">
      {showHeader && (
        <div className="mb-8">
          <h2 className="text-headline font-bold text-text-primary tracking-tight">Designs from across the web</h2>
          <p className="text-text-secondary text-sm mt-2 max-w-md">Curated from MakerWorld, Printables, and more.</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-hover overflow-hidden animate-pulse">
              <div className="aspect-[4/5] bg-bg-elevated" />
              <div className="p-3.5 space-y-2 border-t border-border-subtle">
                <div className="h-3 bg-bg-elevated rounded w-3/4" />
                <div className="h-3 bg-bg-elevated rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {models.map((model, index) => (
            <motion.div key={model.id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.3, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}>
              <IdeaCard model={model} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

function IdeaCard({ model }) {
  // Use a generic placeholder if Google CSE didn't find an image
  const imgUrl = model.image || '/images/products/placeholder.jpg';
  
  // We extract the domain name for display
  const domain = model.publisher ? new URL(model.publisher.startsWith('http') ? model.publisher : `https://${model.publisher}`).hostname.replace('www.', '') : 'External Site';

  return (
    <Link
      to={`/idea/print/external`}
      state={{ model }}
      className="group card-hover overflow-hidden flex flex-col h-full"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-bg-elevated rounded-t-2xl">
        <img
          src={imgUrl}
          alt={model.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.jpg'; }}
        />
        <div className="absolute top-2.5 left-2.5"><span className="tb-sticker bg-black/60 text-white border-none">{domain}</span></div>
      </div>
      <div className="p-3.5 flex flex-col flex-1 border-t border-border-subtle">
        <h3 className="text-text-primary font-semibold text-[13px] mb-1 group-hover:text-accent transition-colors line-clamp-2" title={model.title}>{model.title}</h3>
        <div className="flex items-center justify-between mt-auto pt-1.5">
          <span className="text-text-muted text-[11px] truncate mr-2">{model.description?.slice(0,40)}...</span>
          <span className="text-[12px] font-semibold text-accent flex items-center gap-1 shrink-0">View <ArrowRight size={12} /></span>
        </div>
      </div>
    </Link>
  );
}
