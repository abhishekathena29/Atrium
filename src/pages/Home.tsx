import { TopNavBar } from '../components/TopNavBar';
import { HomeHero } from '../components/home/HomeHero';
import { Tracks } from '../components/home/Tracks';
import { TryIt } from '../components/home/TryIt';
import { Steps } from '../components/home/Steps';
import { Motivation } from '../components/home/Motivation';
import { Subjects } from '../components/home/Subjects';
import { Community } from '../components/home/Community';
import { TrustFaq } from '../components/home/TrustFaq';
import { CtaBand } from '../components/home/CtaBand';
import { Footer } from '../components/Footer';
import { MobileFAB } from '../components/MobileFAB';

export function Home() {
  return (
    <div className="font-sans text-ink bg-paper">
      <TopNavBar />
      <main className="pt-16">
        <HomeHero />
        <Tracks />
        <TryIt />
        <Steps />
        <Motivation />
        <Subjects />
        <Community />
        <TrustFaq />
        <CtaBand />
      </main>
      <Footer />
      <MobileFAB />
    </div>
  );
}
