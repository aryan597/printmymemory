import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';
import CGTraderModelsSection from './CGTraderModelsSection';

// Starter prompts seed the discovery feed and teach people what to type.
const STARTERS = [
  'lithophane lamp with my photo',
  'desk nameplate',
  'cute figurine for my kid',
  'anniversary heart gift',
  'diwali diya',
  'pen holder for my desk',
];

/**
 * Prompt-driven discovery: the visitor describes what they want and we surface
 * print-ready recommendations (CGTrader) in one place, each with a one-tap
 * "Print this" WhatsApp handoff.
 */
export default function PromptDiscovery() {
  const [prompt, setPrompt] = useState('');

  return (
    <section className="section-padding bg-bg-secondary border-b-2 border-border" aria-label="Describe what you want to print">
      <div className="max-w-7xl mx-auto container-padding">

        {/* Heading */}
        <div className="max-w-2xl mb-8">
          <div className="section-label mb-4"><Sparkles size={11} /> Tell us what to print</div>
          <h2 className="font-black uppercase text-text-primary leading-[0.95] tracking-tight text-balance" style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3.25rem)' }}>
            Describe it. We&apos;ll print it.
          </h2>
          <p className="text-text-secondary text-sm sm:text-base mt-3 leading-relaxed">
            Type any idea and browse thousands of print-ready designs — all made-to-order in Bangalore.
            Found the one? Send it over on WhatsApp and we handle the rest.
          </p>
        </div>

        {/* Prompt input */}
        <div className="relative max-w-2xl mb-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. a lamp that glows with my favourite photo…"
            aria-label="Describe what you want to print"
            enterKeyHint="search"
            className="input !pl-11 !pr-11 !py-4 text-base tb-shadow"
          />
          {prompt && (
            <button
              onClick={() => setPrompt('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary border-2 border-transparent hover:border-border transition-colors"
              aria-label="Clear"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Starter chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => setPrompt(s)}
              className={`px-3 py-1.5 text-[12px] font-bold uppercase tracking-wide border-2 border-border transition-all ${
                prompt === s ? 'bg-accent text-white' : 'bg-bg-card text-text-secondary hover:text-text-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Not sure? → AI concierge */}
        <p className="text-text-muted text-xs mb-10">
          Not sure what you want?{' '}
          <Link to="/customize" className="text-accent font-bold hover:underline inline-flex items-center gap-1">
            Chat with our design assistant <ArrowRight size={11} />
          </Link>
        </p>

        {/* Recommendations, consolidated in one place */}
        <CGTraderModelsSection searchQuery={prompt} category="All" embedded showHeader={false} />
      </div>
    </section>
  );
}
