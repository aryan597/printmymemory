/**
 * /customize — AI-powered conversational design assistant.
 * Chat interface with message history, image attachments, product matching,
 * and WhatsApp order handoff.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Paperclip, X, ImageIcon,
  ArrowRight, Loader2, CheckCircle, RotateCcw,
} from 'lucide-react';
import { formatPrice } from '../lib/utils';
import PageHead from '../components/PageHead';

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/design-assistant`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const WHATSAPP_NUMBER = '919471725271';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const WaIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.72 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ── Starter suggestions ──────────────────────────────────────────────────────
const STARTERS = [
  { emoji: '🎁', text: 'I want a unique birthday gift for my best friend' },
  { emoji: '💑', text: 'Something special for our anniversary with our photo' },
  { emoji: '🧑', text: 'A 3D miniature of my face for my desk' },
  { emoji: '🪔', text: 'A lamp that glows with my favourite photo' },
];

// ── Message bubble components ────────────────────────────────────────────────
function UserBubble({ text, imagePreview }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] sm:max-w-[70%]">
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Attached"
            className="w-40 h-40 object-cover rounded-2xl rounded-br-md mb-1 ml-auto border border-white/10"
          />
        )}
        {text && (
          <div className="bg-accent/15 border border-accent/20 rounded-2xl rounded-br-md px-4 py-3">
            <p className="text-white text-sm leading-relaxed">{text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AiBubble({ text, children }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] sm:max-w-[75%] space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={12} className="text-accent" />
          </div>
          <div className="bg-bg-card border border-border-subtle rounded-2xl rounded-tl-md px-4 py-3 flex-1">
            <p className="text-white text-sm leading-relaxed">{text}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function ProductCard({ product, userRequest }) {
  const waText = userRequest
    ? `Hi! ${userRequest}\n\nI was looking at "${product.name}" (${formatPrice(product.price)}) on your website. Can you help me with this?`
    : `Hi! I'd like to order "${product.name}" (${formatPrice(product.price)}). Can you help me with this?`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="ml-9 p-4 rounded-2xl bg-bg-elevated border border-accent/20 space-y-4">
      <div className="flex gap-3">
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="w-20 h-20 rounded-xl object-cover border border-border-subtle shrink-0"
            onError={e => { e.target.onerror = null; e.target.src = '/images/products/placeholder.jpg'; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle size={12} className="text-accent shrink-0" />
            <span className="text-[10px] text-accent font-bold uppercase tracking-widest">Recommended</span>
          </div>
          <h3 className="text-white font-bold text-base leading-tight">{product.name}</h3>
          {product.description && (
            <p className="text-text-muted text-xs mt-1 line-clamp-2">{product.description}</p>
          )}
          <p className="gradient-text font-black text-lg mt-1">{formatPrice(product.price)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-green flex-1 flex items-center justify-center gap-2 text-sm"
        >
          <WaIcon size={14} />
          Order on WhatsApp
        </a>
        <Link
          to={`/products/${product.id}`}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
        >
          View Details
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
          <Sparkles size={12} className="text-accent" />
        </div>
        <div className="bg-bg-card border border-border-subtle rounded-2xl rounded-tl-md px-4 py-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Customize() {
  // messages: [{ role: 'user'|'ai', text, imagePreview?, product?, }]
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedPreview, setAttachedPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll chat container (not page) to bottom on new AI messages
  const chatContainerRef = useRef(null);
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    // Only scroll if user is already near the bottom (within 150px)
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (isNearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleAttach = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFile(file);
    setAttachedPreview(URL.createObjectURL(file));
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    setAttachedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = useCallback(async (overridePrompt) => {
    const text = (overridePrompt ?? prompt).trim();
    if (!text && !attachedFile) return;

    const userMsg = { role: 'user', text, imagePreview: attachedPreview };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');

    const currentFile = attachedFile;
    const currentPreview = attachedPreview;
    setAttachedFile(null);
    setAttachedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setLoading(true);

    try {
      let imageBase64 = null;
      let imageMediaType = null;

      if (currentFile) {
        imageBase64 = await fileToBase64(currentFile);
        imageMediaType = currentFile.type;
      }

      const res = await fetch(EDGE_FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prompt: text, imageBase64, imageMediaType }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Error ${res.status}`);
      }

      const data = await res.json();

      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.reply,
        product: data.matchedProduct ?? null,
        nextAction: data.nextAction,
        userRequest: text,
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `Sorry, something went wrong. You can always reach us directly on WhatsApp for help with your order.`,
        product: null,
        userRequest: text,
      }]);
    } finally {
      setLoading(false);
    }
  }, [prompt, attachedFile, attachedPreview]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startOver = () => {
    setMessages([]);
    setPrompt('');
    setAttachedFile(null);
    setAttachedPreview(null);
  };

  const hasStarted = messages.length > 0;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <PageHead
        title="Customize Your Gift"
        description="Tell our AI design assistant what you want to create. Upload a photo, describe your idea, and we'll find the perfect 3D printed gift for you."
        path="/customize"
      />
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 flex flex-col">

        {/* ── Header ── */}
        <div className={`text-center pt-28 pb-6 transition-all ${hasStarted ? 'pt-24 pb-4' : ''}`}>
          <div className="section-label mx-auto mb-3 w-fit">
            <Sparkles size={11} />
            AI Design Assistant
          </div>
          {!hasStarted && (
            <>
              <h1 className="font-black text-white text-3xl sm:text-4xl mb-3 leading-tight">
                What would you like to create?
              </h1>
              <p className="text-text-secondary text-sm sm:text-base max-w-md mx-auto">
                Describe your gift idea or attach a photo. I'll find the perfect product for you.
              </p>
            </>
          )}
        </div>

        {/* ── Starters ── */}
        <AnimatePresence>
          {!hasStarted && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6"
            >
              {STARTERS.map(s => (
                <button
                  key={s.text}
                  onClick={() => handleSend(s.text)}
                  className="text-left p-4 rounded-2xl border border-border-subtle bg-bg-card hover:border-accent/40 hover:bg-accent/5 transition-all group"
                >
                  <span className="text-lg mb-1.5 block">{s.emoji}</span>
                  <span className="text-sm text-text-secondary group-hover:text-white transition-colors leading-snug">{s.text}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Chat messages ── */}
        {hasStarted && (
          <div ref={chatContainerRef} className="flex-1 space-y-4 pb-4 overflow-y-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {msg.role === 'user' ? (
                    <UserBubble text={msg.text} imagePreview={msg.imagePreview} />
                  ) : (
                    <AiBubble text={msg.text}>
                      {msg.product && <ProductCard product={msg.product} userRequest={msg.userRequest} />}
                      {!msg.product && (
                        <div className="ml-9 space-y-2">
                          <a
                            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg.userRequest ? `Hi! ${msg.userRequest}\nCan you help me with this?` : 'Hi! I need help with a custom gift idea.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-green w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm"
                          >
                            <WaIcon size={14} />
                            Chat with us on WhatsApp
                            <ArrowRight size={13} />
                          </a>
                          <div className="flex items-center gap-2">
                            <Link
                              to="/shop"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-border-subtle text-text-secondary text-xs font-medium hover:text-white hover:bg-white/10 transition-colors"
                            >
                              Browse all products
                              <ArrowRight size={11} />
                            </Link>
                          </div>
                        </div>
                      )}
                    </AiBubble>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <TypingIndicator />
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}

        {/* ── Input area ── */}
        <div className="sticky bottom-0 pb-5 pt-2 bg-gradient-to-t from-bg-primary via-bg-primary to-transparent">
          {/* Start over button */}
          {hasStarted && (
            <div className="flex justify-center mb-2">
              <button
                onClick={startOver}
                className="flex items-center gap-1.5 text-text-muted text-xs hover:text-white transition-colors"
              >
                <RotateCcw size={11} />
                Start over
              </button>
            </div>
          )}

          {/* Attached image preview */}
          {attachedPreview && (
            <div className="mb-2 flex items-center gap-2">
              <div className="relative">
                <img
                  src={attachedPreview}
                  alt="Attachment"
                  className="w-14 h-14 object-cover rounded-xl border border-border-subtle"
                />
                <button
                  onClick={removeAttachment}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-bg-primary border border-border-subtle rounded-full flex items-center justify-center text-text-muted hover:text-white"
                >
                  <X size={10} />
                </button>
              </div>
              <span className="text-text-muted text-xs truncate max-w-[200px]">{attachedFile?.name}</span>
            </div>
          )}

          <div className="flex items-end gap-2 bg-bg-card border border-border-subtle rounded-2xl p-2.5 shadow-xl focus-within:border-accent/40 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAttach}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-white hover:bg-white/5 transition-colors"
              title="Attach photo"
            >
              <Paperclip size={16} />
            </button>

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasStarted ? 'Type a message...' : 'Describe your gift idea...'}
              rows={1}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-text-muted resize-none focus:outline-none leading-6 max-h-28 overflow-y-auto py-1.5"
              style={{ fieldSizing: 'content' }}
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || (!prompt.trim() && !attachedFile)}
              className="shrink-0 w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/80 transition-colors"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>

          <p className="text-center text-text-muted text-[10px] mt-1.5 select-none">
            Enter to send · Shift+Enter for new line · Attach a photo for better results
          </p>
        </div>
      </div>
    </div>
  );
}
