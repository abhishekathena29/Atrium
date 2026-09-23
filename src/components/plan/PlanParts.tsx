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
    <div className={`bg-canvas border border-line border-l-[3px] ${BORDER[tone]} rounded-sm px-4 py-3.5`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[14.5px] font-semibold text-ink">
            {title}
            {aside && <span className="font-normal text-slate-500 text-[13px]"> — {aside}</span>}
          </p>
          <p className="text-[13px] text-slate-600 mt-0.5 leading-snug">{body}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
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
    <div className="bg-paper-2/70 rounded-md px-4 py-3.5">
      <p className="text-[11.5px] text-slate-500">{label}</p>
      <p className="text-[18px] font-semibold text-ink mt-1 leading-tight">{value}</p>
    </div>
  );
}

/** Weekly academic load vs ceiling (SG/US mock, p.6). */
export function LoadMeter({ load, ceiling, note }: { load: number; ceiling: number; note: string }) {
  const pct = Math.min(100, Math.round((load / ceiling) * 100));
  const over = load > ceiling;
  return (
    <div className="bg-paper-2/70 rounded-md px-4 py-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-slate-600">Weekly academic load vs your ceiling</p>
        <p className={`text-[14px] font-semibold ${over ? 'text-red-700' : 'text-ink'}`}>
          {load} / {ceiling} hrs
        </p>
      </div>
      <div className="mt-2 h-2 rounded-full bg-canvas overflow-hidden border border-line">
        <div
          className={`h-full rounded-full ${over ? 'bg-red-600' : pct >= 85 ? 'bg-bronze-500' : 'bg-emerald-600'}`}
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
    <div className="bg-paper-2/70 rounded-md px-4 py-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-slate-100 border border-line-2 flex items-center justify-center shrink-0">
        <span className="text-[12px] font-semibold text-slate-600">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-ink">{title}</p>
        <p className="text-[12px] text-slate-500">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
