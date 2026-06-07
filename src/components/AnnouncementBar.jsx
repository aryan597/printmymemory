import { useState } from 'react';
import { X } from 'lucide-react';
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
        className="bg-accent text-white text-xs sm:text-sm py-2 px-4 relative"
      >
        <div className="max-w-7xl mx-auto text-center font-medium">
          FLAT 10% OFF ON YOUR FIRST ORDER | USE CODE:{' '}
          <span className="font-bold tracking-wider">WELCOME10</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Close announcement"
        >
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
