import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, Palette, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const amsFeatures = [
  {
    icon: Palette,
    title: '16-Color Palette',
    description: 'Mix and match up to 16 colors in a single print for stunning multi-color designs.',
    colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316'],
  },
  {
    icon: Layers,
    title: 'Seamless Transitions',
    description: 'Smooth color gradients and layer-by-layer precision with AMS technology.',
    colors: ['#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6'],
  },
  {
    icon: Zap,
    title: 'Auto Filament Switch',
    description: 'Intelligent filament switching with zero waste — perfect for complex prints.',
    colors: ['#f97316', '#eab308', '#22c55e', '#06b6d4'],
  },
];

const demoColors = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4',
  '#eab308', '#dc2626', '#14b8a6', '#84cc16', '#4f46e5', '#d946ef',
  '#ca8a04', '#9ca3af', '#1a1a1a', '#f5f5f5',
];

export default function AMSShowcase() {
  const [activeColorIndex, setActiveColorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveColorIndex((prev) => (prev + 1) % demoColors.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden" aria-label="Multi-color 3D printing showcase">
      <div className="absolute inset-0 grid-pattern opacity-20" aria-hidden="true" />
      
      {/* Animated color orbs */}
      <div 
        className="absolute top-10 left-1/4 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-colors duration-1000"
        style={{ backgroundColor: demoColors[activeColorIndex] }}
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-10 right-1/4 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-colors duration-1000"
        style={{ backgroundColor: demoColors[(activeColorIndex + 4) % demoColors.length] }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-card border border-border-subtle mb-4">
            <Layers size={14} className="text-accent" aria-hidden="true" />
            <span className="text-text-muted text-xs font-medium">Bambu Lab A1 + AMS</span>
          </div>
          <h2 className="section-title mb-4">
            Multi-Color <span className="gradient-text">Magic</span>
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Our Bambu Lab A1 with AMS (Automatic Material System) lets us print your memories in stunning multi-color detail.
          </p>
        </motion.div>

        {/* Color Palette Demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="card p-8 gradient-border">
            <div className="flex flex-wrap justify-center gap-3">
              {demoColors.map((color, i) => (
                <motion.div
                  key={color}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="relative group"
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      activeColorIndex === i ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:border-white/50'
                    }`}
                    style={{
                      backgroundColor: color,
                      boxShadow: activeColorIndex === i ? `0 0 20px ${color}60` : 'none',
                    }}
                    aria-label={`Color ${color}`}
                  />
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {color}
                  </span>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-text-muted text-sm mt-8">
              16 AMS colors — infinite creative possibilities
            </p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {amsFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="card p-6 gradient-border card-glow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center" aria-hidden="true">
                  <feature.icon size={20} className="text-accent" />
                </div>
                <div className="flex gap-1" aria-hidden="true">
                  {feature.colors.map((c) => (
                    <span key={c} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <h3 className="text-text-primary font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 btn-primary btn-gradient-shimmer px-8 py-3 rounded-full font-semibold"
            aria-label="Explore multi-color products"
          >
            Explore Multi-Color Products
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
