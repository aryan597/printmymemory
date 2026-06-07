import { useState } from 'react';
import { X, Truck, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-accent text-white text-[11px] sm:text-xs py-2 px-4 relative"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5">
          <Percent size={12} className="shrink-0" />
          <span className="font-semibold tracking-wide">
            FLAT 10% OFF ON YOUR FIRST ORDER
          </span>
          <span className="hidden sm:inline text-white/70">|</span>
          <span className="hidden sm:inline font-medium">
            USE CODE: <span className="font-bold bg-white/20 px-1.5 py-0.5 rounded">WELCOME10</span>
          </span>
          <span className="hidden md:inline text-white/70">|</span>
          <span className="hidden md:inline flex items-center gap-1">
            <Truck size={11} /> Free shipping across India
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Close announcement"
        >
          <X size={12} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
