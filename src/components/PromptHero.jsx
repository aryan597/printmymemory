import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Store, Paperclip, X, Boxes } from 'lucide-react';
import AssistantPanel from './assistant/AssistantPanel';
import HeroShowcase from './HeroShowcase';

const EXAMPLES = [
  'a custom lithophane lightbox',
  'an articulated flexi toy',
  'a personalized desk organizer',
  'a functional planter pot',
];

/**
 * Hero: rotating product showcase (with price banner) on the left, AI concierge
 * prompt on the right, over a dark matte print-bed texture. The prompt opens the
 * concierge panel seeded with the first message.
 */
export default function PromptHero() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [seed, setSeed] = useState(null);
  const [open, setOpen] = useState(false);
  const fileRef = useRef(null);

  const start = () => {
    if (!text.trim() && !file) return;
    setSeed({ text: text.trim(), file });
    setOpen(true);
    setText('');
    setFile(null);
    setPreview(null);
  };

  const startWith = (t) => { setSeed({ text: t }); setOpen(true); };
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); start(); } };
  const onAttach = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <section className="relative overflow-hidden matte-bed" aria-label="Describe what you want to print">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center min-h-[92vh] pt-28 pb-16">

          {/* ── Left: product showcase ── */}
          <div className="order-2 lg:order-1">
            <HeroShowcase />
          </div>

          {/* ── Right: prompt ── */}
          <div className="order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="section-label mb-5">3D printing studio · Bangalore</div>

            <h1 className="font-bold tracking-tight leading-[1.03] text-balance" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.9rem)' }}>
              <span className="gradient-text">Print anything</span>
              <br />you can imagine.
            </h1>

            <p className="text-text-secondary text-base sm:text-lg mt-5 max-w-md leading-relaxed">
              Describe an idea or drop a photo. Our concierge figures it out and we print it to order.
            </p>

            {/* Prompt box */}
            <div className="w-full max-w-xl mt-8">
              <div className="rounded-3xl bg-bg-card border border-border p-2.5 shadow-card focus-within:border-accent/50 transition-colors text-left">
                {preview && (
                  <div className="flex items-center gap-2 px-2 pt-1 pb-2">
                    <div className="relative">
                      <img src={preview} alt="Attachment" className="w-12 h-12 object-cover rounded-lg border border-border" />
                      <button onClick={() => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-bg-primary border border-border rounded-full flex items-center justify-center text-text-muted hover:text-text-primary">
                        <X size={10} />
                      </button>
                    </div>
                    <span className="text-text-muted text-xs truncate max-w-[180px]">{file?.name}</span>
                  </div>
                )}
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="Describe what you want to print…"
                  aria-label="Describe what you want to print"
                  className="w-full bg-transparent text-text-primary text-[15px] placeholder:text-text-muted resize-none focus:outline-none px-3 py-2.5 leading-relaxed max-h-40"
                />
                <div className="flex items-center justify-between pl-1 pr-1 pb-0.5">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAttach} />
                  <button onClick={() => fileRef.current?.click()} title="Attach a photo"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors text-xs">
                    <Paperclip size={15} /> <span className="hidden sm:inline">Add photo</span>
                  </button>
                  <button onClick={start} aria-label="Start"
                    className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center hover:brightness-105 active:scale-95 transition-all">
                    <ArrowUp size={17} strokeWidth={2.25} />
                  </button>
                </div>
              </div>

              {/* Examples */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-4">
                {EXAMPLES.map((ex) => (
                  <button key={ex} onClick={() => startWith(ex)}
                    className="px-3 py-1.5 text-[12.5px] rounded-full bg-bg-card border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border transition-colors">
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-8">
              <Link to="/shop" className="btn-primary"><Store size={16} /> Browse the Shop</Link>
              <Link to="/shop3d" className="btn-secondary"><Boxes size={16} /> Walk into our 3D Shop</Link>
            </div>
          </div>
        </div>
      </div>

      <AssistantPanel open={open} onClose={() => setOpen(false)} seed={seed} />
    </section>
  );
}
