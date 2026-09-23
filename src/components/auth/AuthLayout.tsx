import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

/**
 * Two-column editorial shell shared by Sign in and Sign up: a form panel on the
 * left and a quote / brand panel on the right (hidden on small screens).
 */
export function AuthLayout({
  children,
  aside,
}: {
  children: ReactNode;
  aside: { quote: string; attribution: string; image: string };
}) {
  return (
    <div className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-16">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <span className="w-7 h-7 rounded-sm bg-ink flex items-center justify-center">
            <span className="font-serif text-paper text-[15px] leading-none mt-[2px]">A</span>
          </span>
          <span className="font-serif text-ink text-[20px] tracking-tight">Atrium</span>
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto py-12">
          {children}
        </div>

        <p className="text-[12px] text-slate-400 text-center">
          © {new Date().getFullYear()} Atrium · Athena Education
        </p>
      </div>

      <aside className="hidden lg:block relative overflow-hidden border-l border-line">
        <img
          src={aside.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="relative h-full flex flex-col justify-end p-16">
          <span className="material-symbols-outlined text-bronze-200 text-[40px] mb-4">format_quote</span>
          <p className="font-serif text-paper text-[28px] leading-snug">{aside.quote}</p>
          <p className="mt-6 text-[13px] text-paper/70 tracking-wide">{aside.attribution}</p>
        </div>
      </aside>
    </div>
  );
}
