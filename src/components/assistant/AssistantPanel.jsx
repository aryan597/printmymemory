import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import AssistantChat from './AssistantChat';

/**
 * Full-screen concierge overlay opened from the hero prompt. Holds the running
 * conversation (the "continuation chat in a different window").
 */
export default function AssistantPanel({ open, onClose, seed }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center p-0 sm:p-6"
          role="dialog" aria-modal="true" aria-label="Design concierge"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

          <motion.div
            className="relative w-full sm:max-w-2xl h-full sm:h-[86vh] bg-bg-primary sm:border border-border sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
                  <Sparkles size={15} className="text-accent" />
                </div>
                <div>
                  <p className="text-text-primary font-semibold text-sm leading-tight">Design concierge</p>
                  <p className="text-text-muted text-[11px]">Tell us what to print, we figure out the rest</p>
                </div>
              </div>
              <button onClick={onClose} aria-label="Close"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Chat */}
            <div className="flex-1 min-h-0 px-4 sm:px-5 pb-4">
              <AssistantChat seed={seed} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
