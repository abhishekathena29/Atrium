import type { ReactNode } from 'react';
import { Logo } from '../Logo';

const POINTS = [
  { icon: 'route', text: 'A free plan built from what you already study' },
  { icon: 'forum', text: 'A free 20-minute consult with a vetted mentor' },
  { icon: 'local_fire_department', text: 'Streaks and awards to keep self-study going' },
];

/** Shared shell for sign in / sign up: form on the left, friendly brand panel on the right. */
export function AuthLayout({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-16">
        <Logo />
        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto py-10">{children}</div>
        <p className="text-[12px] text-slate-400 text-center">© {new Date().getFullYear()} Atrium · Athena Education</p>
      </div>

      <aside className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-leaf-600 to-leaf-800 text-white p-16 flex-col justify-center">
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute right-20 -top-16 w-48 h-48 rounded-full bg-amber-300/20" />
        <div className="relative max-w-md">
          <h2 className="font-jakarta font-extrabold text-[36px] leading-tight">{title ?? 'Choose your courses knowing why.'}</h2>
          <ul className="mt-10 space-y-5">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-center gap-4">
                <span className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">{p.icon}</span>
                </span>
                <span className="text-[15.5px] text-leaf-50">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
