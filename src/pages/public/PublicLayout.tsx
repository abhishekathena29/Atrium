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
    <section className="relative overflow-hidden bg-gradient-to-b from-leaf-50 to-paper">
      <div className="absolute -top-24 -right-24 w-[380px] h-[380px] rounded-full bg-leaf-100/70 blur-3xl pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-12 lg:pt-20">
        <p className="text-[13px] font-bold uppercase tracking-widest text-leaf-600 mb-4">{eyebrow}</p>
        <h1 className="font-jakarta font-extrabold text-ink text-[38px] sm:text-[48px] leading-[1.08] tracking-tight max-w-4xl">{title}</h1>
        {children && <div className="mt-5 text-[17px] text-slate-600 max-w-2xl leading-relaxed">{children}</div>}
      </div>
    </section>
  );
}
