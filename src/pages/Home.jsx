import { useState } from 'react';
import PageHead from '../components/PageHead';
import PromptHero from '../components/PromptHero';
import MarqueeTicker from '../components/MarqueeTicker';
import BestsellersSection from '../components/BestsellersSection';
import CGTraderModelsSection from '../components/CGTraderModelsSection';
import HowItWorks from '../components/HowItWorks';
import TestimonialsSection from '../components/TestimonialsSection';
import CTABanner from '../components/CTABanner';

// Pool of design searches. Two are picked at random each load so the homepage
// shows different printable designs every visit (not the same items).
const DESIGN_SEARCHES = [
  { label: 'Lamps & lithophanes', q: 'lithophane lamp' },
  { label: 'Desk & organisers', q: 'desk organizer holder' },
  { label: 'Figurines & miniatures', q: 'figurine miniature' },
  { label: 'Planters & vases', q: 'planter vase' },
  { label: 'Keychains & tags', q: 'keychain tag' },
  { label: 'Wall art & decor', q: 'wall art decor' },
  { label: 'Phone stands & docks', q: 'phone stand dock' },
  { label: 'Festive & ornaments', q: 'festive ornament' },
  { label: 'Name signs & plaques', q: 'name sign plaque' },
  { label: 'Toys & articulated', q: 'articulated toy flexi' },
];

function pickTwo() {
  const a = Math.floor(Math.random() * DESIGN_SEARCHES.length);
  let b = Math.floor(Math.random() * DESIGN_SEARCHES.length);
  if (b === a) b = (b + 1) % DESIGN_SEARCHES.length;
  return [DESIGN_SEARCHES[a], DESIGN_SEARCHES[b]];
}

export default function Home() {
  const [searches] = useState(pickTwo); // randomised once per mount

  return (
    <>
      <PageHead path="/" />
      <PromptHero />
      <MarqueeTicker />

      {/* Real products from our catalogue */}
      <BestsellersSection />

      {/* Two different design searches, randomised each visit */}
      {searches.map((s, i) => (
        <section key={s.q} className={`section-padding ${i === 0 ? 'bg-bg-secondary border-y' : 'bg-bg-primary border-b'} border-border-subtle`}>
          <div className="max-w-7xl mx-auto container-padding">
            <div className="mb-8">
              <h2 className="text-headline font-bold text-text-primary tracking-tight">{s.label}</h2>
              <p className="text-text-secondary text-sm mt-2 max-w-lg">
                Ready-to-print designs, made to order in Bangalore. Tap any to see it and order.
              </p>
            </div>
            <CGTraderModelsSection searchQuery={s.q} category="All" embedded showHeader={false} />
          </div>
        </section>
      ))}

      <HowItWorks />
      <TestimonialsSection />
      <CTABanner />
    </>
  );
}
