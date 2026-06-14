import HeroSection from '../components/HeroSection';
import BestsellersSection from '../components/BestsellersSection';
import HowItWorks from '../components/HowItWorks';
import TestimonialsSection from '../components/TestimonialsSection';

export default function Home() {
  return (
    <main className="bg-bg-primary">
      <HeroSection />
      <BestsellersSection />
      <HowItWorks />
      <TestimonialsSection />
    </main>
  );
}
