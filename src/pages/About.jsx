import { motion } from 'framer-motion';
import { Printer, MapPin, Zap, Heart, Users, Package } from 'lucide-react';

const stats = [
  { icon: Printer, value: '1', label: 'Bambu Lab Printer' },
  { icon: MapPin, value: '2', label: 'Cities (BLR + BBSR)' },
  { icon: Zap, value: '50-80%', label: 'Margin Per Unit' },
  { icon: Package, value: '5-7', label: 'Days Dispatch' },
];

const team = [
  {
    name: 'Amit',
    role: 'Head of Manufacturing',
    location: 'Bangalore',
    bio: 'The person actually running the Bambu Lab printer. Handles slicing, printing, quality checks, and packing. Based in Jakkur, Bangalore.',
  },
  {
    name: 'Anisha',
    role: 'Head of Growth & Operations',
    location: 'Bhubaneswar',
    bio: 'Designs branding assets, manages packaging, handles customer DMs, and coordinates the inter-city logistics. The creative brain.',
  },
  {
    name: 'Aishwarya',
    role: 'Advisor & Auditor',
    location: 'Remote',
    bio: 'Keeps us honest. Reviews financials, advises on pricing strategy, and makes sure we do not do anything stupid with money.',
  },
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            We're Just <span className="text-accent">Two People</span> With a Printer
          </h1>
          <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            No factory. No investors. No 5000+ customer reviews (yet). Just a side hustle born from curiosity — 
            turning digital memories into physical art, one layer at a time.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="bg-bg-card border border-border-subtle rounded-xl p-5 text-center">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <stat.icon size={18} className="text-accent" />
              </div>
              <p className="text-2xl font-bold text-text-primary mb-1">{stat.value}</p>
              <p className="text-text-muted text-xs">{stat.label}</p>
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
          <h2 className="text-2xl font-bold text-text-primary mb-5">The Real Story</h2>
          <div className="space-y-4 text-text-secondary leading-relaxed">
            <p>
              Gifted with Love started as a late-night conversation. Amit had been 3D printing as a hobby for months — 
              lithophane lamps for family, custom bookmarks for friends. Anisha saw the potential and said: 
              "Why don't we actually sell these?"
            </p>
            <p>
              We bought one Bambu Lab printer. We set up shop in Amit's apartment in Jakkur, Bangalore. 
              Anisha handles design, branding, and customer communication from Bhubaneswar. 
              Aishwarya audits our numbers and keeps us from going broke.
            </p>
            <p>
              We're not pretending to be a big brand. We're a boutique studio. Every piece is made to order. 
              Every package is hand-packed. Every Instagram DM is replied to by a real human (usually Anisha at 1 AM).
            </p>
            <p>
              We deliberately skipped Amazon, Flipkart, and Meesho for Phase 1. Why? Because custom 3D printing 
              takes up to 24 hours of continuous machine time per item. A single nozzle clog breaks platform shipping 
              deadlines. And a returned lithophane with someone's family photo on it? That's 100% dead loss. 
              We sell directly to you because it lets us be honest about timelines and quality.
            </p>
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">Meet the Team</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {team.map((member) => (
              <div key={member.name} className="bg-bg-card border border-border-subtle rounded-xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-accent text-xl font-bold">{member.name[0]}</span>
                </div>
                <h3 className="text-text-primary font-semibold text-lg">{member.name}</h3>
                <p className="text-accent text-xs font-medium mb-1">{member.role}</p>
                <p className="text-text-muted text-xs mb-3">{member.location}</p>
                <p className="text-text-secondary text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Why Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 bg-bg-card border border-border-subtle rounded-2xl p-6 sm:p-8"
        >
          <h2 className="text-xl font-bold text-text-primary mb-4">Why Buy From Us?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Made in India, by Indians', desc: 'Printed in Bangalore. Packaged with care. No dropshipping.' },
              { title: 'Transparent Pricing', desc: 'We show you exactly what goes into each product. No hidden margins.' },
              { title: 'Eco-Friendly Packaging', desc: 'Kraft boxes, paper shred, jute twine. We hate plastic too.' },
              { title: 'Real Humans, Real Replies', desc: 'DM us on Instagram anytime. You will talk to Anisha, not a bot.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <Heart size={16} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-text-primary font-medium text-sm">{item.title}</p>
                  <p className="text-text-secondary text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
