import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Loader2, ArrowRight } from 'lucide-react';
import { getCategorySampleModels, filterLoadable } from '../lib/cgtrader';

const MODELS_PER_LEVEL = 12;
const MAX_PAGES = 3;

/**
 * Grid of print-ready designs (recommendations) we can make to order. Driven by
 * `category` and/or free-text `searchQuery` (debounced). Each card opens a full
 * print-idea page (not a modal). Source is intentionally unbranded in the UI.
 */
export default function CGTraderModelsSection({ category = 'All', searchQuery = '', embedded = false, showHeader = true }) {
  const [models, setModels] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [pagesToScan, setPagesToScan] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const requestIdRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const queryKey = `${category} ${debouncedQuery}`;
  const prevKeyRef = useRef(queryKey);

  useEffect(() => {
    if (prevKeyRef.current !== queryKey) {
      prevKeyRef.current = queryKey;
      if (pagesToScan !== 1) { setPagesToScan(1); return; }
    }

    const requestId = ++requestIdRef.current;
    let cancelled = false;
    const isFirstLoad = pagesToScan === 1;

    async function load() {
      if (isFirstLoad) { setLoading(true); setFailed(false); } else { setLoadingMore(true); }
      try {
        const res = await getCategorySampleModels(category, { pagesToScan, searchOverride: debouncedQuery });
        if (cancelled || requestId !== requestIdRef.current) return;
        // Drop designs whose photo won't load (no broken/placeholder cards).
        const batch = await filterLoadable(res.models || [], { limit: MODELS_PER_LEVEL * pagesToScan + 6 });
        if (cancelled || requestId !== requestIdRef.current) return;
        if (!(res.error && !isFirstLoad)) { setModels(batch); setHasMore(Boolean(res.hasMore)); }
        if (isFirstLoad) setFailed(Boolean(res.error) || batch.length === 0);
      } catch {
        if (!cancelled && requestId === requestIdRef.current && isFirstLoad) { setModels([]); setFailed(true); }
      } finally {
        if (!cancelled && requestId === requestIdRef.current) { setLoading(false); setLoadingMore(false); }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [queryKey, category, debouncedQuery, pagesToScan]);

  const handleShowMore = () => {
    if (loadingMore || loading || pagesToScan >= MAX_PAGES) return;
    setPagesToScan((p) => Math.min(p + 1, MAX_PAGES));
  };

  if (!loading && (failed || models.length === 0)) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted text-sm">
          No designs found{debouncedQuery ? ` for “${debouncedQuery}”` : ''}. Try another idea, or ask our concierge.
        </p>
      </div>
    );
  }

  const visibleModels = models.slice(0, MODELS_PER_LEVEL * pagesToScan);
  const showMoreVisible = !loading && hasMore && pagesToScan < MAX_PAGES;

  return (
    <section className={embedded ? '' : 'mt-16 pt-12 border-t border-border-subtle'} aria-label="Print-ready design ideas">
      {showHeader && (
        <div className="mb-8">
          <h2 className="text-headline font-bold text-text-primary tracking-tight">More designs we can print</h2>
          <p className="text-text-secondary text-sm mt-2 max-w-md">Ready-to-print designs, made to order in Bangalore.</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5" role="status" aria-label="Loading designs">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card-hover overflow-hidden animate-pulse" aria-hidden="true">
              <div className="aspect-[4/5] bg-bg-elevated" />
              <div className="p-3.5 space-y-2 border-t border-border-subtle">
                <div className="h-3 bg-bg-elevated rounded w-3/4" />
                <div className="h-3 bg-bg-elevated rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5" role="list" aria-label="Print-ready designs">
            {visibleModels.map((model, index) => (
              <motion.div key={model.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.3, delay: (index % MODELS_PER_LEVEL) * 0.03, ease: [0.16, 1, 0.3, 1] }}
                role="listitem">
                <IdeaCard model={model} />
              </motion.div>
            ))}
          </div>

          {showMoreVisible && (
            <div className="text-center mt-10">
              <button onClick={handleShowMore} disabled={loadingMore} className="btn-secondary disabled:opacity-60" aria-label="Show more designs">
                {loadingMore ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                Show more designs
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function IdeaCard({ model }) {
  return (
    <Link
      to={`/idea/print/${model.id}`}
      state={{ model }}
      className="group card-hover overflow-hidden flex flex-col h-full"
      aria-label={`${model.title} — view and order`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-bg-elevated rounded-t-2xl">
        <img
          src={model.image || '/images/products/placeholder.jpg'}
          alt={model.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          loading="lazy" decoding="async"
          onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.jpg'; }}
        />
        {model.printReady && (
          <div className="absolute top-2.5 left-2.5"><span className="tb-sticker">Print ready</span></div>
        )}
      </div>
      <div className="p-3.5 flex flex-col flex-1 border-t border-border-subtle">
        <h3 className="text-text-primary font-semibold text-[13px] mb-1 group-hover:text-accent transition-colors line-clamp-1">{model.title}</h3>
        <div className="flex items-center justify-between mt-auto pt-1.5">
          <span className="text-text-muted text-[11px]">Made to order</span>
          <span className="text-[12px] font-semibold text-accent flex items-center gap-1">View <ArrowRight size={12} /></span>
        </div>
      </div>
    </Link>
  );
}
