import { useState, useEffect } from 'react';
import { X, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'announcement-bar-dismissed';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      try {
        const dismissedAt = parseInt(dismissed, 10);
        const oneDay = 24 * 60 * 60 * 1000;
        if (Date.now() - dismissedAt < oneDay) {
          setIsVisible(false);
        }
      } catch {
        setIsVisible(false);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-white text-black text-[11px] sm:text-xs py-2 px-4 relative"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <Percent size={12} className="shrink-0" />
            <span className="font-semibold tracking-wide">FLAT 10% OFF ON YOUR FIRST ORDER</span>
            <span className="hidden sm:inline text-black/60">|</span>
            <span className="hidden sm:inline font-medium">
              USE CODE: <span className="font-bold bg-black/10 px-2 py-0.5 rounded-full">WELCOME10</span>
            </span>
          </div>
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
            aria-label="Close announcement"
          >
            <X size={12} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
