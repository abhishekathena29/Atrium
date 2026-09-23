import type { ReactNode } from 'react';
import type { User } from '../../auth/types';
import type { LoadPlan, LoadPlanItem } from '../../engine/courseLoad';
import { describeHolland } from '../../engine/profile';
import { Disclaimer } from '../ui/Field';
import { LoadMeter, PlanRow, Pill, type Tone } from './PlanParts';

const TONE: Record<LoadPlanItem['tag'], Tone> = { 'High fit': 'green', Keep: 'green', Rebalance: 'amber', Stretch: 'amber' };

export function LoadPlanView({
  user,
  plan,
  hollandCode,
  audience = 'student',
  cta,
}: {
  user: User;
  plan: LoadPlan;
  hollandCode: string;
  audience?: 'student' | 'parent' | 'mentor';
  cta?: ReactNode;
}) {
  const intake = user.sgus!;
  const first = user.name.split(' ')[0];
  const majors = intake.targetMajors.filter((m) => m !== 'Undecided');

  return (
    <div className="bg-paper-2/40 border border-line rounded-md p-5 sm:p-7 space-y-5">
      <div>
        <h2 className="font-serif text-ink text-[26px] leading-tight">
          {intake.isAthlete ? `A course load ${audience === 'student' ? 'your' : `${first}'s`} training can survive` : 'A course load built around your targets'}
        </h2>
        <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">
          Grade {intake.grade} · {intake.curriculum}
          {intake.isAthlete ? ` · ${intake.sport || 'athlete'}, ${intake.trainingHoursPerWeek} training hrs/week` : ''}
          {majors.length ? ` · targeting ${majors.join(' / ')} at US schools` : ''}. Interest fit from RIASEC (
          {describeHolland(hollandCode)}){intake.isAthlete ? ', load ceiling from your training calendar' : ''}.
        </p>
      </div>

      {audience === 'parent' && (
        <div className="bg-canvas border border-line rounded-md p-4 text-[13.5px] text-slate-700 leading-relaxed">
          <p className="font-semibold text-ink mb-1">What this means, in plain terms</p>
          We estimate how many hours of study a week {first} can realistically sustain
          {intake.isAthlete ? ' alongside training' : ''} (the “ceiling”), then check the chosen subjects against it.
          Subjects central to {first}'s intended major are kept. If the total is too high, the least important one is
          moved to a lighter level.
        </div>
      )}

      <LoadMeter load={plan.plannedLoad} ceiling={plan.ceiling} note={plan.meterNote} />

      <div>
        <p className="text-[12.5px] text-slate-500 mb-2">Recommended load</p>
        <div className="space-y-2.5">
          {plan.items.map((i) => (
            <PlanRow
              key={i.name}
              tone={TONE[i.tag]}
              title={i.action === 'keep' ? `${i.name} ${i.to}` : `${i.name} ${i.from} → ${i.to}`}
              aside={i.action === 'keep' ? (i.role === 'core' ? `keep, core to major` : 'keep') : i.action}
              body={i.reason}
              pill={<Pill tone={TONE[i.tag]}>{i.tag}</Pill>}
              meta={`${i.hours} hrs/wk`}
            />
          ))}
          {plan.fixedHours > 0 && (
            <p className="text-[12px] text-slate-500 px-1">+ {plan.fixedHours} hrs/wk IB core (TOK, EE, CAS), included in the total.</p>
          )}
        </div>
      </div>

      {plan.seasonNote && (
        <div className="flex gap-2.5 bg-canvas border border-line rounded-md p-4">
          <span className="material-symbols-outlined text-bronze-600 text-[20px]">event_upcoming</span>
          <p className="text-[13px] text-slate-700 leading-relaxed">{plan.seasonNote}</p>
        </div>
      )}

      {cta}

      <Disclaimer>
        Interest fit from RIASEC. Load ceiling from self-reported training hours. Hours per level are illustrative
        estimates. Guidance only. <a href="/methodology" className="underline">How this is calculated</a>.
      </Disclaimer>
    </div>
  );
}
