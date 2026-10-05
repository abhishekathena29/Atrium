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
        <span className="text-[12px] font-bold uppercase tracking-widest text-leaf-600">{eyebrow}</span>
        <h1 className="font-jakarta font-extrabold text-ink text-[28px] sm:text-[32px] leading-tight mt-1.5">{title}</h1>
        <p className="text-[14.5px] text-slate-500 mt-1.5 max-w-2xl">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function StatCard({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div className="bg-canvas border border-line rounded-2xl p-5">
      <span className="w-9 h-9 rounded-xl bg-leaf-50 text-leaf-600 flex items-center justify-center">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </span>
      <p className="font-jakarta font-extrabold text-ink text-[26px] leading-none mt-3">{value}</p>
      <p className="text-[12.5px] text-slate-500 mt-1.5">{label}</p>
    </div>
  );
}

export function Panel({ title, action, children }: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bg-canvas border border-line rounded-3xl">
      <header className="flex items-center justify-between gap-3 px-6 pt-5 pb-1">
        <h2 className="font-jakarta font-bold text-ink text-[17px]">{title}</h2>
        {action}
      </header>
      <div className="px-6 pb-6 pt-3">{children}</div>
    </section>
  );
}

export function Avatar({ name }: { name: string }) {
  return (
    <div className="w-10 h-10 rounded-full bg-leaf-100 flex items-center justify-center shrink-0">
      <span className="font-jakarta font-bold text-leaf-700 text-[15px]">{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center text-[11.5px] font-medium text-slate-700 bg-slate-50 border border-line rounded-full px-2.5 py-0.5">
      {children}
    </span>
  );
}
