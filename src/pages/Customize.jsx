/**
 * /customize — AI-powered design assistant page.
 * User types a prompt (and optionally attaches a photo).
 * Gemini routes to the best product + shows the right customization form.
 */
import { useState, useRef, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Paperclip, X, ImageIcon, ShoppingCart,
  ArrowRight, Loader2, RotateCcw, AlertCircle, CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { CartContext } from '../contexts/CartContext';
import { formatPrice } from '../lib/utils';

// ── Supabase Edge Function URL ──────────────────────────────────────────────
const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/design-assistant`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ── Helpers ──────────────────────────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadToStorage(file) {
  const ext = file.name.split('.').pop();
  const path = `customize/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

// ── Starter suggestions ──────────────────────────────────────────────────────
const STARTERS = [
  { emoji: '🎁', text: 'I want a unique birthday gift for my best friend' },
  { emoji: '💑', text: 'Something special for our anniversary, maybe with our photo?' },
  { emoji: '🖨️', text: 'A 3D miniature of my face for my desk' },
  { emoji: '🪔', text: 'A lamp that glows with my photo inside it' },
];

// ── Customization Form ───────────────────────────────────────────────────────
function CustomizationForm({ product, onAddToCart, uploading }) {
  const [fieldValues, setFieldValues] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const configs = product.configs ?? [];
  const hasPhotoField = configs.some(c => c.field_type === 'photo_upload');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setFieldValues(v => ({ ...v, _photoFile: file }));
  };

  const setValue = (key, val) => setFieldValues(v => ({ ...v, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate required fields
    const missing = configs
      .filter(c => c.is_required && c.field_type !== 'photo_upload')
      .filter(c => !fieldValues[c.field_key]?.toString().trim());
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map(c => c.field_label).join(', ')}`);
      return;
    }
    if (hasPhotoField && !fieldValues._photoFile && !fieldValues.photo_upload) {
      toast.error('Please attach your photo');
      return;
    }
    onAddToCart(fieldValues);
  };

  if (configs.length === 0) {
    // No configs — uncustomised product, just add directly
    return (
      <div className="space-y-4">
        <p className="text-text-secondary text-sm">This product is ready to order, no customization needed.</p>
        <button
          onClick={() => onAddToCart({})}
          disabled={uploading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
          Add to Cart
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {configs.map(config => (
        <div key={config.field_key}>
          <label className="block text-sm font-semibold text-white mb-1.5">
            {config.field_label}
            {config.is_required && <span className="text-accent ml-1">*</span>}
          </label>

          {config.field_type === 'photo_upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {previewUrl ? (
                <div className="relative w-full aspect-square max-w-[180px] rounded-xl overflow-hidden border border-border-subtle group">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPreviewUrl(null); setFieldValues(v => ({ ...v, _photoFile: null })); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-border-subtle rounded-xl p-6 flex flex-col items-center gap-2 hover:border-accent/50 hover:bg-accent/5 transition-colors"
                >
                  <ImageIcon size={24} className="text-text-muted" />
                  <span className="text-sm text-text-muted">Click to upload photo</span>
                </button>
              )}
            </div>
          )}

          {config.field_type === 'text' && (
            <input
              type="text"
              placeholder={config.field_placeholder ?? ''}
              value={fieldValues[config.field_key] ?? ''}
              onChange={e => setValue(config.field_key, e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/60"
            />
          )}

          {config.field_type === 'textarea' && (
            <textarea
              rows={3}
              placeholder={config.field_placeholder ?? ''}
              value={fieldValues[config.field_key] ?? ''}
              onChange={e => setValue(config.field_key, e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/60 resize-none"
            />
          )}

          {config.field_type === 'select' && (
            <select
              value={fieldValues[config.field_key] ?? ''}
              onChange={e => setValue(config.field_key, e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent/60"
            >
              <option value="">Select an option</option>
              {(config.options ?? []).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}

          {(config.field_type === 'color_picker' || config.field_type === 'ams_color') && (
            <div className="flex flex-wrap gap-2">
              {(config.options ?? []).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  title={opt.label}
                  onClick={() => setValue(config.field_key, opt.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    fieldValues[config.field_key] === opt.value
                      ? 'border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: opt.value }}
                />
              ))}
            </div>
          )}

          {config.field_type === 'radio' && (
            <div className="flex flex-wrap gap-2">
              {(config.options ?? []).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue(config.field_key, opt.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    fieldValues[config.field_key] === opt.value
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border-subtle text-text-secondary hover:border-accent/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={uploading}
        className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
      >
        {uploading ? (
          <><Loader2 size={16} className="animate-spin" /> Uploading...</>
        ) : (
          <><ShoppingCart size={16} /> Add to Cart</>
        )}
      </button>
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Customize() {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedPreview, setAttachedPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // AI response state
  const [aiReply, setAiReply] = useState(null);
  const [matchedProduct, setMatchedProduct] = useState(null);
  const [nextAction, setNextAction] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const reset = () => {
    setPrompt('');
    setAttachedFile(null);
    setAttachedPreview(null);
    setAiReply(null);
    setMatchedProduct(null);
    setNextAction(null);
    setError(null);
  };

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

    setLoading(true);
    setError(null);
    setAiReply(null);
    setMatchedProduct(null);
    setNextAction(null);

    try {
      let imageBase64 = null;
      let imageMediaType = null;

      if (attachedFile) {
        imageBase64 = await fileToBase64(attachedFile);
        imageMediaType = attachedFile.type;
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
      setAiReply(data.reply);
      setMatchedProduct(data.matchedProduct ?? null);
      setNextAction(data.nextAction ?? 'none');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [prompt, attachedFile]);

  const handleAddToCart = async (fieldValues) => {
    if (!matchedProduct) return;
    setUploading(true);
    try {
      let photoUrl = null;
      if (fieldValues._photoFile) {
        photoUrl = await uploadToStorage(fieldValues._photoFile);
      }

      const customization = {};
      Object.entries(fieldValues).forEach(([k, v]) => {
        if (k !== '_photoFile') customization[k] = v;
      });
      if (photoUrl) customization.photo_upload = photoUrl;

      await addToCart({
        id: matchedProduct.id,
        name: matchedProduct.name,
        price: matchedProduct.price,
        image: matchedProduct.image ?? null,
        quantity: 1,
        customization,
      });

      toast.success(`${matchedProduct.name} added to cart!`);
      navigate('/cart');
    } catch (err) {
      toast.error('Failed to add to cart: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasResponse = aiReply !== null || error !== null;

  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="section-label mx-auto mb-4 w-fit">
            <Sparkles size={11} />
            AI Design Assistant
          </div>
          <h1 className="font-black text-white text-3xl sm:text-4xl mb-3 leading-tight">
            Tell us what you want to create
          </h1>
          <p className="text-text-secondary text-base max-w-md mx-auto">
            Describe your gift idea or attach a photo. Our AI will find the perfect product and guide you through customization.
          </p>
        </div>

        {/* ── Starters (only before first query) ── */}
        <AnimatePresence>
          {!hasResponse && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
            >
              {STARTERS.map(s => (
                <button
                  key={s.text}
                  onClick={() => {
                    setPrompt(s.text);
                    handleSend(s.text);
                  }}
                  className="text-left p-4 rounded-2xl border border-border-subtle bg-bg-card hover:border-accent/40 hover:bg-accent/5 transition-all group"
                >
                  <span className="text-xl mb-2 block">{s.emoji}</span>
                  <span className="text-sm text-text-secondary group-hover:text-white transition-colors">{s.text}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── AI Response ── */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-5 rounded-2xl bg-bg-card border border-border-subtle flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-accent" />
              </div>
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Loader2 size={14} className="animate-spin" />
                Thinking...
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
            >
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-medium mb-1">Something went wrong</p>
                <p className="text-red-400/70 text-xs">{error}</p>
              </div>
            </motion.div>
          )}

          {aiReply && !loading && (
            <motion.div
              key="response"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 space-y-4"
            >
              {/* AI reply bubble */}
              <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center">
                    <Sparkles size={12} className="text-accent" />
                  </div>
                  <span className="text-xs font-semibold text-accent uppercase tracking-widest">Design Assistant</span>
                </div>
                <p className="text-white text-sm leading-relaxed">{aiReply}</p>
              </div>

              {/* Matched product card */}
              {matchedProduct && (
                <div className="p-5 rounded-2xl bg-bg-elevated border border-accent/20">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle size={14} className="text-accent" />
                        <span className="text-xs text-accent font-semibold uppercase tracking-widest">Perfect Match</span>
                      </div>
                      <h3 className="text-white font-bold text-lg">{matchedProduct.name}</h3>
                      {matchedProduct.description && (
                        <p className="text-text-muted text-sm mt-1 line-clamp-2">{matchedProduct.description}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-text-muted mb-0.5">Starting from</p>
                      <p className="gradient-text font-black text-xl">{formatPrice(matchedProduct.price)}</p>
                    </div>
                  </div>

                  {/* Customization form */}
                  <CustomizationForm
                    product={matchedProduct}
                    onAddToCart={handleAddToCart}
                    uploading={uploading}
                  />
                </div>
              )}

              {/* If no product matched — link to shop */}
              {!matchedProduct && nextAction === 'view_catalog' && (
                <button
                  onClick={() => navigate('/shop')}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  Browse All Products <ArrowRight size={14} />
                </button>
              )}

              {/* Try again */}
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-text-muted text-sm hover:text-white transition-colors mx-auto"
              >
                <RotateCcw size={13} />
                Try a different idea
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Prompt input ── */}
        <div className="sticky bottom-6">
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
              <span className="text-text-muted text-xs">{attachedFile?.name}</span>
            </div>
          )}

          <div className="flex items-end gap-2 bg-bg-card border border-border-subtle rounded-2xl p-3 shadow-xl focus-within:border-accent/40 transition-colors">
            {/* Attach button */}
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

            {/* Text input */}
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you'd like to create, or attach a photo..."
              rows={1}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-text-muted resize-none focus:outline-none leading-6 max-h-32 overflow-y-auto py-1.5"
              style={{ fieldSizing: 'content' }}
            />

            {/* Send button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || (!prompt.trim() && !attachedFile)}
              className="shrink-0 w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/80 transition-colors"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>

          <p className="text-center text-text-muted text-[11px] mt-2">
            Press Enter to send. Shift+Enter for new line.
          </p>
        </div>
      </div>
    </div>
  );
}
