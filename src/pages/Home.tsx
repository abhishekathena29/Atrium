import { TopNavBar } from '../components/TopNavBar';
import { Hero } from '../components/Hero';
import { BentoGrid } from '../components/BentoGrid';
import { Mission } from '../components/Mission';
import { ForMentors } from '../components/ForMentors';
import { FeaturedMentors } from '../components/FeaturedMentors';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';
import { MobileFAB } from '../components/MobileFAB';

export function Home() {
  return (
    <div className="font-sans text-ink bg-paper">
      <TopNavBar />
      <main className="pt-16">
        <Hero />
        <BentoGrid />
        <Mission />
        <ForMentors />
        <FeaturedMentors />
        <FinalCTA />
      </main>
      <Footer />
      <MobileFAB />
    </div>
  );
}
