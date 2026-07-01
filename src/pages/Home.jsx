import HeroSection from '../components/HeroSection';
import MarqueeTicker from '../components/MarqueeTicker';
import BestsellersSection from '../components/BestsellersSection';
import HowItWorks from '../components/HowItWorks';
import TestimonialsSection from '../components/TestimonialsSection';
import CTABanner from '../components/CTABanner';

export default function Home() {
  return (
    <>
      <HeroSection />
      <MarqueeTicker />
      <BestsellersSection />
      <HowItWorks />
      <TestimonialsSection />
      <CTABanner />
    </>
  );
}
