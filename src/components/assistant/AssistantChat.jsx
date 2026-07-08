import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Paperclip, X, Loader2, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { getCategorySampleModels, filterLoadable } from '../../lib/cgtrader';

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/design-assistant`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const WHATSAPP_NUMBER = '919471725271';

let msgSeq = 0;
const nextId = () => `m${Date.now()}_${msgSeq++}`;

// Filler words to drop when deriving a design-search query from a sentence.
const STOP = new Set([
  'i', 'want', 'a', 'an', 'the', 'with', 'written', 'write', 'engraved', 'engrave',
  'says', 'say', 'on', 'it', 'please', 'can', 'you', 'make', 'me', 'need', 'would',
  'like', 'get', 'my', 'some', 'for', 'of', 'to', 'and', 'that', 'this', 'one',
  'have', 'gift', 'something', 'custom', 'customised', 'customized', 'personalised',
  'personalized', 'printed', 'print', 'd', '3d',
]);

/**
 * Turn a free-text prompt into a concise, relevant marketplace search.
 * "I want a keychain with ARYAN written on it" -> "name keychain".
 * Drops filler + proper-noun names (which aren't searchable), keeps the object,
 * and adds "name" when it's a personalised-text request.
 */
function deriveKeywords(text) {
  const original = String(text || '');
  const personalized = /\b(name|written|engrav|says?|text|letter|initial|monogram)\b/i.test(original);
  // Remove capitalised/all-caps tokens (e.g. ARYAN, Aryan) — names aren't searchable.
  const cleaned = original.replace(/\b[A-Z][A-Za-z]{1,}\b/g, ' ');
  const words = cleaned.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
  let terms = [...new Set(words)].slice(0, 3);
  if (personalized && !terms.includes('name')) terms.unshift('name');
  terms = terms.slice(0, 4);
  return terms.join(' ') || 'gift decor';
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const WaIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.72 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

function productWaLink(product) {
  const url = `${window.location.origin}/products/${product.id}`;
  const text = `Hi PrintMyMemory! I'd like to order "${product.name}" (${formatPrice(product.price)}).\n${url}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function customWaLink(messages) {
  const brief = messages.filter((m) => m.role === 'user' && m.text).map((m) => m.text).slice(-4).join(' · ');
  const text = `Hi PrintMyMemory! I was designing a custom 3D print with your assistant.\n\nWhat I'm after: ${brief || 'a custom piece'}\n\nCan we finalise it?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function UserBubble({ text, image }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[82%]">
        {image && <img src={image} alt="Attached" className="w-36 h-36 object-cover rounded-2xl rounded-br-md mb-1 ml-auto border border-border" />}
        {text && (
          <div className="bg-accent/15 border border-accent/25 rounded-2xl rounded-br-md px-4 py-2.5">
            <p className="text-text-primary text-sm leading-relaxed">{text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <div className="p-3 rounded-2xl bg-bg-elevated border border-border flex gap-3">
      {product.image && (
        <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover border border-border-subtle shrink-0"
          onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.jpg'; }} />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-text-primary font-semibold text-sm leading-tight line-clamp-1">{product.name}</p>
        <p className="text-accent font-bold text-sm mt-0.5">{formatPrice(product.price)}</p>
        <div className="flex gap-2 mt-2">
          <Link to={`/products/${product.id}`} className="btn-primary !px-3 !py-1.5 !text-xs">View product <ArrowRight size={12} /></Link>
          <a href={productWaLink(product)} target="_blank" rel="noopener noreferrer" className="btn-green !px-3 !py-1.5 !text-xs"><WaIcon size={13} /> WhatsApp</a>
        </div>
      </div>
    </div>
  );
}

function IdeaMini({ model }) {
  return (
    <Link to={`/idea/print/${model.id}`} state={{ model }} className="group block rounded-xl overflow-hidden border border-border-subtle bg-bg-elevated hover:border-border transition-colors">
      <div className="aspect-square overflow-hidden bg-bg-card">
        <img src={model.image || '/images/products/placeholder.jpg'} alt={model.title} loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.jpg'; }} />
      </div>
      <p className="text-text-secondary group-hover:text-text-primary text-[11px] px-2 py-1.5 line-clamp-1 transition-colors">{model.title}</p>
    </Link>
  );
}

function AiBubble({ msg, messages }) {
  const hasProducts = msg.products?.length > 0;
  const hasIdeas = msg.ideas?.length > 0;
  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={12} className="text-accent" />
          </div>
          <div className="bg-bg-card border border-border-subtle rounded-2xl rounded-tl-md px-4 py-2.5 flex-1">
            <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
          </div>
        </div>

        <div className="ml-9 space-y-3">
          {/* Our catalogue products */}
          {hasProducts && msg.products.map((p) => <ProductCard key={p.id} product={p} />)}

          {/* Printable designs we can make */}
          {msg.ideasLoading && (
            <div className="flex items-center gap-2 text-text-muted text-xs"><Loader2 size={13} className="animate-spin" /> Finding designs we can print…</div>
          )}
          {hasIdeas && (
            <div>
              <p className="text-text-muted text-[11px] font-medium mb-1.5">{hasProducts ? 'We can also print these:' : 'Designs we can print for you:'}</p>
              <div className="grid grid-cols-4 gap-2">
                {msg.ideas.map((m) => <IdeaMini key={m.id} model={m} />)}
              </div>
            </div>
          )}

          {/* WhatsApp — secondary, only for bespoke handoff or when nothing surfaced */}
          {(msg.custom || (!hasProducts && !hasIdeas && !msg.ideasLoading)) && (
            <a href={customWaLink(messages)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-accent transition-colors">
              <WaIcon size={13} /> Prefer to chat? Message us on WhatsApp <ArrowRight size={11} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0"><Sparkles size={12} className="text-accent" /></div>
        <div className="bg-bg-card border border-border-subtle rounded-2xl rounded-tl-md px-4 py-3">
          <div className="flex items-center gap-1.5">
            {[0, 150, 300].map((d) => <div key={d} className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

const STARTERS = [
  'A lamp that glows with my photo',
  'A mini figurine of my dog',
  'A custom nameplate for my desk',
  'An anniversary gift for my partner',
];

export default function AssistantChat({ seed, autoFocus = true }) {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedPreview, setAttachedPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const seededRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, []);
  useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

  // Fetch printable designs for a message, then merge into that message by id.
  const loadIdeas = useCallback(async (msgId, keywords) => {
    try {
      const res = await getCategorySampleModels('All', { searchOverride: keywords });
      const loadable = await filterLoadable(res.models || [], { limit: 10 });
      const ideas = loadable.slice(0, 4);
      setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, ideas, ideasLoading: false } : m)));
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, ideas: [], ideasLoading: false } : m)));
    }
  }, []);

  const send = useCallback(async (overrideText, overrideFile) => {
    const text = (overrideText ?? prompt).trim();
    const file = overrideFile ?? attachedFile;
    if (!text && !file) return;

    const preview = file ? (overrideFile ? URL.createObjectURL(file) : attachedPreview) : null;
    const history = messages.map((m) => ({ role: m.role === 'ai' ? 'model' : 'user', text: m.text })).filter((m) => m.text);

    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text, image: preview }]);
    setPrompt(''); setAttachedFile(null); setAttachedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLoading(true);

    try {
      let imageBase64 = null, imageMediaType = null;
      if (file) { imageBase64 = await fileToBase64(file); imageMediaType = file.type; }

      const res = await fetch(EDGE_FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ prompt: text, imageBase64, imageMediaType, history }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();

      const keywords = (data.searchKeywords && data.searchKeywords.trim()) || deriveKeywords(text);
      const products = data.products || (data.matchedProduct ? [data.matchedProduct] : []);
      const id = nextId();
      const aiMsg = {
        id, role: 'ai', text: data.reply,
        products,
        ideas: null,
        ideasLoading: Boolean(keywords),
        custom: data.nextAction === 'chat_whatsapp',
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
      if (keywords) loadIdeas(id, keywords); // async, appends when ready
    } catch {
      setMessages((prev) => [...prev, {
        id: nextId(), role: 'ai',
        text: 'Sorry, something glitched on our end. Try again, or message us on WhatsApp and we will help you sort it out.',
        custom: true,
      }]);
      setLoading(false);
    }
  }, [prompt, attachedFile, attachedPreview, messages, loadIdeas]);

  useEffect(() => {
    if (seed && !seededRef.current && (seed.text || seed.file)) {
      seededRef.current = true;
      send(seed.text || '', seed.file || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const handleAttach = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFile(file);
    setAttachedPreview(URL.createObjectURL(file));
  };
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const hasStarted = messages.length > 0 || loading;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-1 py-2 space-y-4 min-h-0">
        {!hasStarted && (
          <div className="grid sm:grid-cols-2 gap-2.5 pt-2">
            {STARTERS.map((s) => (
              <button key={s} onClick={() => send(s)}
                className="text-left p-3.5 rounded-2xl border border-border-subtle bg-bg-card hover:border-accent/40 hover:bg-accent/[0.04] transition-colors text-sm text-text-secondary hover:text-text-primary">
                {s}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
              {msg.role === 'user' ? <UserBubble text={msg.text} image={msg.image} /> : <AiBubble msg={msg} messages={messages} />}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && <TypingBubble />}
      </div>

      <div className="pt-3 border-t border-border-subtle mt-2">
        {attachedPreview && (
          <div className="mb-2 flex items-center gap-2">
            <div className="relative">
              <img src={attachedPreview} alt="Attachment" className="w-12 h-12 object-cover rounded-lg border border-border" />
              <button onClick={() => { setAttachedFile(null); setAttachedPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-bg-primary border border-border rounded-full flex items-center justify-center text-text-muted hover:text-text-primary">
                <X size={10} />
              </button>
            </div>
            <span className="text-text-muted text-xs truncate max-w-[180px]">{attachedFile?.name}</span>
          </div>
        )}

        <div className="flex items-end gap-2 bg-bg-card border border-border rounded-2xl p-2 focus-within:border-accent/50 transition-colors">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAttach} />
          <button type="button" onClick={() => fileInputRef.current?.click()} title="Attach a photo"
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors">
            <Paperclip size={16} />
          </button>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={handleKeyDown} rows={1} autoFocus={autoFocus}
            placeholder="Describe your idea, or attach a photo..."
            className="flex-1 bg-transparent text-text-primary text-sm placeholder:text-text-muted resize-none focus:outline-none leading-6 max-h-28 py-1.5" />
          <button type="button" onClick={() => send()} disabled={loading || (!prompt.trim() && !attachedFile)}
            className="shrink-0 w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 transition-all">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
        <p className="text-center text-text-muted text-[10px] mt-1.5">AI concierge · we confirm every order before printing</p>
      </div>
    </div>
  );
}
