import type { ReactNode } from 'react';
import { TopNavBar } from '../../components/TopNavBar';
import { Footer } from '../../components/Footer';

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="font-sans text-ink bg-paper">
      <TopNavBar />
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  );
}

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="border-b border-line">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16 lg:pt-24">
        <p className="eyebrow text-bronze-600 mb-5">{eyebrow}</p>
        <h1 className="font-serif text-ink text-display-lg lg:text-display-xl max-w-4xl">{title}</h1>
        {children && <div className="mt-6 text-body-lg text-slate-600 max-w-2xl leading-relaxed">{children}</div>}
      </div>
    </section>
  );
}
