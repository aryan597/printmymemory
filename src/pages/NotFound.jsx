import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto px-4"
      >
        <div className="w-20 h-20 bg-bg-card rounded-full flex items-center justify-center mx-auto mb-6 border border-border-subtle">
          <span className="text-4xl font-bold text-accent">404</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
          Page Not Found
        </h1>
        <p className="text-text-secondary mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved. 
          Let's get you back to creating beautiful 3D memories.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 btn-primary w-full sm:w-auto justify-center"
            aria-label="Go to homepage"
          >
            <Home size={18} />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 btn-secondary w-full sm:w-auto justify-center"
            aria-label="Go back to previous page"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </motion.div>
    </main>
  );
}
