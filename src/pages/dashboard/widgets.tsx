import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, subtitle, action }: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <span className="eyebrow text-bronze-600">{eyebrow}</span>
        <h1 className="font-serif text-ink text-display-sm mt-2">{title}</h1>
        <p className="text-[14px] text-slate-500 mt-1">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function StatCard({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div className="bg-canvas border border-line rounded-md p-5 shadow-card">
      <span className="material-symbols-outlined text-bronze-500 text-[20px]">{icon}</span>
      <p className="font-serif text-ink text-[30px] leading-none mt-3">{value}</p>
      <p className="text-[12px] text-slate-500 mt-2">{label}</p>
    </div>
  );
}

export function Panel({ title, action, children }: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bg-canvas border border-line rounded-md shadow-card">
      <header className="flex items-center justify-between px-5 py-4 border-b border-line">
        <h2 className="font-serif text-ink text-[18px]">{title}</h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Avatar({ name }: { name: string }) {
  return (
    <div className="w-10 h-10 rounded-full bg-bronze-100 flex items-center justify-center shrink-0">
      <span className="font-serif text-bronze-700 text-[16px]">{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center text-[11px] font-medium text-slate-600 bg-slate-100 border border-line-2 rounded-sm px-2 py-0.5">
      {children}
    </span>
  );
}
