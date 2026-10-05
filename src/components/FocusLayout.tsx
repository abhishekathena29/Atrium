import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { STUDENT_STEPS } from '../engine/flow';
import { Logo } from './Logo';

/**
 * Distraction-free shell for the first-run flow (welcome, about-you quiz, your studies):
 * logo, a step tracker for students, and a "save & exit" escape hatch. No sidebar.
 */
export function FocusLayout({ step, children }: { step: number; children: ReactNode }) {
  const { user } = useAuth();
  const showSteps = user?.role === 'student';

  return (
    <div className="min-h-screen overflow-x-clip bg-gradient-to-b from-leaf-50 via-paper to-paper text-ink">
      <header className="bg-paper/80 backdrop-blur-md border-b border-line sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Logo to="/dashboard" />
          {showSteps && (
            <ol className="hidden sm:flex items-center gap-2">
              {STUDENT_STEPS.map((label, i) => {
                const done = i < step;
                const current = i === step;
                return (
                  <li key={label} className="flex items-center gap-2">
                    <span
                      className={
                        'flex items-center gap-1.5 text-[12.5px] font-semibold rounded-full px-3 py-1 ' +
                        (current ? 'bg-leaf-600 text-white' : done ? 'bg-leaf-100 text-leaf-800' : 'text-slate-400')
                      }
                    >
                      {done ? (
                        <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      ) : (
                        <span>{i + 1}</span>
                      )}
                      {label}
                    </span>
                    {i < STUDENT_STEPS.length - 1 && <span className="w-4 h-px bg-line-2" />}
                  </li>
                );
              })}
            </ol>
          )}
          <Link to="/dashboard" className="text-[13px] font-semibold text-slate-500 hover:text-ink whitespace-nowrap">
            Save &amp; exit
          </Link>
        </div>
        {showSteps && (
          <div className="sm:hidden h-1 bg-line">
            <div className="h-full bg-leaf-500 transition-all" style={{ width: `${((step + 1) / STUDENT_STEPS.length) * 100}%` }} />
          </div>
        )}
      </header>
      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">{children}</main>
    </div>
  );
}
