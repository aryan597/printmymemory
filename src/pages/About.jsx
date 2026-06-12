import { motion } from 'framer-motion';
import { Printer, MapPin, Zap, Package } from 'lucide-react';

const stats = [
  { icon: Printer, value: '1', label: 'Bambu Lab Printer' },
  { icon: MapPin, value: '2', label: 'Cities (BLR + BBSR)' },
  { icon: Package, value: '5-7', label: 'Days Dispatch' },
];

export default function About() {
  return (
    <main className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Memories You Can <span className="text-neutral-400">Hold</span>
          </h1>
          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            PrintMyMemory is a boutique 3D print studio. We turn digital photos and ideas into tangible keepsakes, printed and finished by hand in India.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="card p-5 text-center">
              <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <stat.icon size={18} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-neutral-500 text-xs">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-5">The Real Story</h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              PrintMyMemory started with a simple idea: what if you could hold a moment, not just see it on a screen? A lithophane lamp glowing with a family photo, a tiny figurine on a desk, a personalized gift that does not need a charger or a subscription.
            </p>
            <p>
              We run a small studio with a Bambu Lab printer in Bangalore and a small operations team between Bangalore and Bhubaneswar. Every piece is made to order. Every package is hand-packed. Every question is answered by a real human.
            </p>
            <p>
              We sell directly because custom 3D printing takes time. A single print can run for hours. A nozzle clog can reset the schedule. And a returned lithophane with someone's family photo on it is dead loss. Direct sales let us be honest about timelines and quality.
            </p>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">What We Care About</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card p-6">
              <h3 className="text-white font-semibold text-lg mb-2">Quality First</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                We check every print before it ships. If it is not good enough for our own shelves, it is not good enough for you.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="text-white font-semibold text-lg mb-2">Honest Timelines</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Custom work takes 5-7 days to dispatch. We tell you upfront instead of overpromising.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="text-white font-semibold text-lg mb-2">Made in India</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Designed, printed, packed, and shipped from India. Supporting local makers and reducing long-distance shipping.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
