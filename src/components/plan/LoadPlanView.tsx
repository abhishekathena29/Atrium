import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CURRICULUM_LABEL, type User } from '../../auth/types';
import { DIFFICULTY_LABEL } from '../../data/apInfo';
import { countryPhrase } from '../../data/countries';
import type { LoadPlan, LoadPlanItem } from '../../engine/courseLoad';
import { describeHolland } from '../../engine/profile';
import { Disclaimer } from '../ui/Field';
import { CountryNotes } from './CountryNotes';
import { DifficultyPill, InsightRow, LoadMeter, PlanRow, Pill, WhyChips, type Tone } from './PlanParts';

const TONE: Record<LoadPlanItem['tag'], Tone> = {
  'High fit': 'green', Keep: 'green', Rebalance: 'amber', Stretch: 'amber', 'Add-on': 'green', 'Not this cycle': 'grey',
};

function Row({ i, audience }: { i: LoadPlanItem; audience: 'student' | 'parent' | 'mentor' }) {
  const title = i.kind === 'addon' ? i.name : i.action === 'keep' || i.action === 'drop' ? `${i.name} ${i.to}` : `${i.name} ${i.from} → ${i.to}`;
  const aside = i.action === 'drop' ? 'not this cycle' : i.kind === 'addon' ? 'AP add-on' : i.action === 'keep' ? (i.role === 'core' ? 'keep, core to major' : 'keep') : i.action;
  return (
    <PlanRow
      tone={TONE[i.tag]}
      title={title}
      aside={aside}
      body={i.reason}
      pill={
        <span className="flex flex-row sm:flex-col items-center sm:items-end gap-1.5 sm:gap-1">
          <Pill tone={TONE[i.tag]}>{i.tag}</Pill>
          {i.difficulty && <DifficultyPill level={i.difficulty} label={DIFFICULTY_LABEL[i.difficulty]} />}
        </span>
      }
      meta={i.action === 'drop' ? `+${i.hours} hrs/wk saved` : `${i.hours} hrs/wk`}
    >
      {audience !== 'parent' && (
        <details className="mt-2 group">
          <summary className="text-[12.5px] font-semibold text-leaf-600 cursor-pointer select-none list-none inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] group-open:rotate-90 transition-transform">chevron_right</span>
            Why
          </summary>
          <WhyChips factors={i.factors} />
        </details>
      )}
    </PlanRow>
  );
}

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
  const school = plan.items.filter((i) => i.kind === 'school');
  const addons = plan.items.filter((i) => i.kind === 'addon');

  return (
    <div className="bg-paper-2/40 border border-line rounded-2xl p-5 sm:p-7 space-y-5">
      <div>
        <h2 className="font-jakarta font-bold text-ink text-[26px] leading-tight">
          {intake.isAthlete ? `A course load ${audience === 'student' ? 'your' : `${first}'s`} training can survive` : audience === 'student' ? 'A course load built around your goals' : `A course load built around ${first}'s goals`}
        </h2>
        <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">
          Grade {intake.grade} · {CURRICULUM_LABEL[intake.curriculum]}
          {intake.isAthlete ? ` · ${intake.sport || 'athlete'}, ${intake.trainingHoursPerWeek} training hrs/week` : ''}
          {majors.length ? ` · aiming for ${majors.join(' / ')}` : ''} · applying to {countryPhrase(plan.countries)}. Interest
          fit from {audience === 'student' ? 'your' : `${first}'s`} answers ({describeHolland(hollandCode)}).
        </p>
      </div>

      {audience === 'parent' && (
        <div className="bg-canvas border border-line rounded-2xl p-4 text-[13.5px] text-slate-700 leading-relaxed">
          <p className="font-semibold text-ink mb-1">What this means, in plain terms</p>
          We estimate how many hours of study a week {first} can realistically sustain
          {intake.isAthlete ? ' alongside training' : ''} and other activities (the “ceiling”), then check the chosen subjects
          against it. Subjects central to {first}'s intended major are always kept. If the total is too high, optional AP exams
          unrelated to the major go first, then the least important subject moves to a lighter level, then any remaining
          optional APs.
        </div>
      )}

      <LoadMeter load={plan.plannedLoad} ceiling={plan.ceiling} note={plan.meterNote} />

      {plan.apNote && <InsightRow icon="calculate" title="How many APs">{plan.apNote}</InsightRow>}

      <div>
        <p className="text-[12.5px] text-slate-500 mb-2">Your {CURRICULUM_LABEL[intake.curriculum]} subjects</p>
        <div className="space-y-2.5 stagger">
          {school.map((i) => <Row key={i.name} i={i} audience={audience} />)}
          {plan.fixedHours > 0 && (
            <p className="text-[12px] text-slate-500 px-1">+ {plan.fixedHours} hrs/wk IB core (TOK, EE, CAS), included in the total.</p>
          )}
        </div>
      </div>

      {addons.length > 0 && (
        <div>
          <p className="text-[12.5px] text-slate-500 mb-2">AP exams on top (self-study)</p>
          <div className="space-y-2.5 stagger">
            {addons.map((i) => <Row key={i.name} i={i} audience={audience} />)}
          </div>
        </div>
      )}

      {plan.seasonNote && (
        <div className="flex gap-2.5 bg-canvas border border-line rounded-2xl p-4">
          <span className="material-symbols-outlined text-leaf-600 text-[20px]">event_upcoming</span>
          <p className="text-[13px] text-slate-700 leading-relaxed">{plan.seasonNote}</p>
        </div>
      )}

      <CountryNotes countries={plan.countries} />

      {cta}

      <Disclaimer>
        Interest fit from the About-you answers. Load ceiling from training and activity hours. Hours per level and AP
        difficulty are illustrative estimates. No university is claimed to require any AP or subject. Guidance only.{' '}
        <Link to="/methodology" className="underline">How this is calculated</Link>.
      </Disclaimer>
    </div>
  );
}
