import HeroSection from '../components/HeroSection';
import TrustBar from '../components/TrustBar';
import BestsellersSection from '../components/BestsellersSection';
import HowItWorks from '../components/HowItWorks';
import TestimonialsSection from '../components/TestimonialsSection';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <TrustBar />
      <BestsellersSection />
      <HowItWorks />
      <TestimonialsSection />
    </main>
  );
}
