import type { ReactNode } from 'react';

export type Tone = 'green' | 'amber' | 'grey';

const BORDER: Record<Tone, string> = {
  green: 'border-l-emerald-600',
  amber: 'border-l-amber-600',
  grey: 'border-l-slate-300',
};

const PILL: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  grey: 'bg-slate-100 text-slate-600 border-line-2',
};

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium border rounded-full px-2.5 py-0.5 whitespace-nowrap ${PILL[tone]}`}>
      {children}
    </span>
  );
}

/** One row of a plan, in the style of the blueprint mocks (coloured left rule, pill on the right). */
export function PlanRow({
  tone,
  title,
  aside,
  body,
  pill,
  meta,
  children,
}: {
  tone: Tone;
  title: ReactNode;
  aside?: string;
  body: ReactNode;
  pill: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={`bg-canvas border border-line border-l-[3px] ${BORDER[tone]} rounded-xl px-4 py-3.5`}>
      {/* Phones: pills sit under the text so names don't get squeezed. */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
        <div className="min-w-0">
          <p className="text-[14.5px] font-semibold text-ink">
            {title}
            {aside && <span className="font-normal text-slate-500 text-[13px]">: {aside}</span>}
          </p>
          <p className="text-[13px] text-slate-600 mt-0.5 leading-snug">{body}</p>
        </div>
        <div className="flex flex-row flex-wrap sm:flex-col items-center sm:items-end gap-2 sm:gap-1 shrink-0">
          {pill}
          {meta && <span className="text-[11.5px] text-slate-500">{meta}</span>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function SummaryTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-paper-2/70 rounded-2xl px-4 py-3.5">
      <p className="text-[11.5px] text-slate-500">{label}</p>
      <p className="text-[15.5px] font-bold text-ink mt-1 leading-snug">{value}</p>
    </div>
  );
}

/** Weekly academic load vs ceiling (SG/US mock, p.6). */
export function LoadMeter({ load, ceiling, note }: { load: number; ceiling: number; note: string }) {
  const pct = Math.min(100, Math.round((load / ceiling) * 100));
  const over = load > ceiling;
  return (
    <div className="bg-paper-2/70 rounded-2xl px-4 py-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-slate-600">Weekly academic load vs your ceiling</p>
        <p className={`text-[14px] font-semibold ${over ? 'text-red-700' : 'text-ink'}`}>
          {load} / {ceiling} hrs
        </p>
      </div>
      <div className="mt-2 h-2 rounded-full bg-canvas overflow-hidden border border-line">
        <div
          className={`h-full rounded-full fill-anim ${over ? 'bg-red-600' : pct >= 85 ? 'bg-leaf-500' : 'bg-emerald-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[12px] text-slate-600 mt-2">{note}</p>
    </div>
  );
}

export function MentorNudge({ initials, title, subtitle, action }: {
  initials: string;
  title: string;
  subtitle: string;
  action: ReactNode;
}) {
  return (
    <div className="bg-paper-2/70 rounded-2xl px-4 py-3.5 flex flex-wrap items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-slate-100 border border-line-2 flex items-center justify-center shrink-0">
        <span className="text-[12px] font-semibold text-slate-600">{initials}</span>
      </div>
      <div className="flex-1 min-w-[160px]">
        <p className="text-[13.5px] font-semibold text-ink">{title}</p>
        <p className="text-[12px] text-slate-500">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

const DIFF_STYLE = ['', 'bg-emerald-50 text-emerald-800 border-emerald-200', 'bg-emerald-50 text-emerald-800 border-emerald-200', 'bg-sky-50 text-sky-800 border-sky-200', 'bg-amber-50 text-amber-800 border-amber-200', 'bg-rose-50 text-rose-800 border-rose-200'];

/** Difficulty as five pips plus a word, e.g. ●●●●○ Demanding. */
export function DifficultyPill({ level, label }: { level: number; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium border rounded-full px-2.5 py-0.5 whitespace-nowrap ${DIFF_STYLE[level]}`} title={`Difficulty ${level}/5 (illustrative)`}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= level ? 'bg-current' : 'bg-current opacity-25'}`} />
        ))}
      </span>
      {label}
    </span>
  );
}

const FACTOR_STYLE = {
  plus: { cls: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: 'add_circle' },
  neutral: { cls: 'bg-slate-50 border-line-2 text-slate-700', icon: 'radio_button_unchecked' },
  minus: { cls: 'bg-amber-50 border-amber-200 text-amber-800', icon: 'remove_circle' },
} as const;

/** "Why this course": every factor that went into the call, colour-coded. */
export function WhyChips({ factors }: { factors: { label: string; detail: string; tone: 'plus' | 'neutral' | 'minus' }[] }) {
  return (
    <ul className="grid sm:grid-cols-2 gap-1.5 mt-2 stagger">
      {factors.map((f) => (
        <li key={f.label} className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-[12.5px] ${FACTOR_STYLE[f.tone].cls}`}>
          <span className="material-symbols-outlined text-[16px] mt-px">{FACTOR_STYLE[f.tone].icon}</span>
          <span><span className="font-semibold">{f.label}:</span> {f.detail}</span>
        </li>
      ))}
    </ul>
  );
}

/** Callout used for "how many" and "the mix". */
export function InsightRow({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 bg-canvas border border-line rounded-2xl p-4 animate-fade-up">
      <span className="w-9 h-9 rounded-xl bg-leaf-50 text-leaf-600 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </span>
      <div>
        <p className="text-[13.5px] font-semibold text-ink">{title}</p>
        <p className="text-[13px] text-slate-600 leading-relaxed mt-0.5">{children}</p>
      </div>
    </div>
  );
}
