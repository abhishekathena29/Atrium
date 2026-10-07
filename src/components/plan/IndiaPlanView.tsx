import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../auth/types';
import { GRAPH_VERSION, MAPPED_COVERAGE, COVERAGE } from '../../data/overlapGraph';
import { AP_INFO_VERSION, DIFFICULTY_LABEL, HARD_AT, apInfo } from '../../data/apInfo';
import { countryPhrase } from '../../data/countries';
import type { ApPlanItem, IndiaPlan } from '../../engine/overlap';
import { Disclaimer } from '../ui/Field';
import { CountryNotes } from './CountryNotes';
import { DifficultyPill, InsightRow, PlanRow, Pill, SummaryTile, WhyChips, type Tone } from './PlanParts';

const TONE: Record<ApPlanItem['band'], Tone> = { 'High overlap': 'green', Partial: 'amber', None: 'grey' };

function range(n: number) {
  const lo = Math.max(0, Math.floor(n * 0.85));
  const hi = Math.ceil(n * 1.15);
  return lo === hi ? `~${hi} hrs` : `~${lo}-${hi} hrs`;
}

export function IndiaPlanView({
  user,
  plan,
  audience = 'student',
  cta,
}: {
  user: User;
  plan: IndiaPlan;
  audience?: 'student' | 'parent' | 'mentor';
  cta?: ReactNode;
}) {
  const intake = user.india!;
  const first = user.name.split(' ')[0];
  const you = audience === 'student' ? 'you' : first;
  const majors = intake.targetMajors.filter((m) => m !== 'Undecided');

  if (!plan.mapped) {
    return (
      <div className="bg-canvas border border-line rounded-2xl p-6 space-y-4">
        <span className="eyebrow text-leaf-600">Not mapped yet</span>
        <h2 className="font-jakarta font-bold text-ink text-[24px]">
          {intake.board} {intake.stream} is not in the overlap graph yet
        </h2>
        <p className="text-[14px] text-slate-600 leading-relaxed">
          Phase 1 maps CBSE Science streams only. We won't guess an AP plan for {you} without the
          syllabus mapping behind it. A mentor consult can still help in the meantime, and the
          profile is saved for when the stream goes live.
        </p>
        <table className="w-full text-[13px]">
          <tbody>
            {MAPPED_COVERAGE.map((c) => (
              <tr key={c.board + c.stream} className="border-t border-line">
                <td className="py-2 text-ink font-medium">{c.board}</td>
                <td className="py-2 text-slate-600">{c.stream}</td>
                <td className="py-2 text-slate-500 text-right">{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {cta}
      </div>
    );
  }

  const n = plan.recommended.length;
  const hard = plan.recommended.filter((r) => r.difficulty >= HARD_AT).length;

  return (
    <div className="bg-paper-2/40 border border-line rounded-2xl p-5 sm:p-7 space-y-5">
      <div>
        <h2 className="font-jakarta font-bold text-ink text-[26px] leading-tight">
          {audience === 'student' ? 'Your APs: which, how many, how hard' : `${first}'s APs: which, how many, how hard`}
        </h2>
        <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">
          Class {intake.grade} · {intake.board} {intake.stream}
          {majors.length ? ` · aiming for ${majors.join(' / ')}` : ''} · applying to {countryPhrase(plan.countries)}. APs come on
          top of {audience === 'student' ? 'your' : 'the'} board exams. They don't replace them.
        </p>
      </div>

      {audience === 'parent' && (
        <div className="bg-canvas border border-line rounded-2xl p-4 text-[13.5px] text-slate-700 leading-relaxed">
          <p className="font-semibold text-ink mb-1">What this means, in plain terms</p>
          An AP is a US college-level exam that students can self-study for and sit in May, alongside their board exams.{' '}
          {first} already learns much of the content for some APs in the Class {intake.grade} board syllabus, so those
          cost only a few extra hours a week. The plan suggests{' '}
          {n ? plan.recommended.map((r) => r.course.name).join(', ') : 'no APs yet'} for about {range(plan.netNewPerWeek)}{' '}
          a week in total, sized to {first}'s other commitments and how they handle pressure.
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-3 stagger">
        <SummaryTile label="How many APs" value={n ? `${n} this cycle` : 'None yet'} />
        <SummaryTile label="The mix" value={n ? `${hard} demanding · ${n - hard} manageable` : 'None yet'} />
        <SummaryTile label="Extra study / week" value={`${range(plan.netNewPerWeek)} of ${plan.budgetPerWeek}`} />
      </div>

      {plan.countReason && <InsightRow icon="calculate" title="Why this many">{plan.countReason}</InsightRow>}
      {plan.mixNote && <InsightRow icon="balance" title="Why this mix">{plan.mixNote}</InsightRow>}

      <div className="space-y-2.5 stagger">
        {plan.items.map((item) => {
          const info = apInfo(item.course.id);
          return (
            <PlanRow
              key={item.course.id}
              tone={item.recommendation === 'skip' ? 'grey' : item.recommendation === 'recommend' ? TONE[item.band] : 'grey'}
              title={item.course.name}
              aside={item.recommendation === 'skip' ? 'skip for now' : item.recommendation === 'consider' ? 'consider' : 'take it'}
              body={
                <>
                  {item.rationale}
                  {item.reason && <span className="text-slate-500"> {item.reason}</span>}
                </>
              }
              pill={
                <span className="flex flex-row sm:flex-col items-center sm:items-end gap-1.5 sm:gap-1">
                  <Pill tone={TONE[item.band]}>{item.band}</Pill>
                  <DifficultyPill level={item.difficulty} label={DIFFICULTY_LABEL[item.difficulty]} />
                </span>
              }
              meta={`~${item.netNewPerWeek} hrs/wk`}
            >
              <details className="mt-2 group" open={audience === 'student' && item.recommendation === 'recommend' && n <= 2}>
                <summary className="text-[12.5px] font-semibold text-leaf-600 cursor-pointer select-none list-none inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] group-open:rotate-90 transition-transform">chevron_right</span>
                  Why {item.recommendation === 'recommend' ? 'this AP' : item.recommendation === 'skip' ? 'we’d skip it' : 'it’s on the fence'}
                </summary>
                {info && <p className="text-[12.5px] text-slate-600 mt-2"><span className="font-semibold text-ink">What it is:</span> {info.plain}</p>}
                <WhyChips factors={item.factors} />
                {audience !== 'parent' && (
                  <details className="mt-2 group/units">
                    <summary className="text-[12px] text-slate-500 cursor-pointer select-none list-none inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] group-open/units:rotate-90 transition-transform">chevron_right</span>
                      Unit-by-unit overlap
                    </summary>
                    <div className="overflow-x-auto mt-2">
                    <table className="w-full text-[12px]">
                      <tbody>
                        {item.course.units.map((u) => {
                          const onBoard = !!u.board && plan.boardSubjects.includes(u.board);
                          const covered = onBoard ? COVERAGE[u.overlap] : 0;
                          return (
                            <tr key={u.name} className="border-t border-line align-top">
                              <td className="py-1.5 pr-3 text-ink">{u.name}</td>
                              <td className="py-1.5 pr-3 text-slate-500">{onBoard ? u.boardRef : u.board ? `${u.board} (not taken)` : u.boardRef}</td>
                              <td className="py-1.5 text-right text-slate-600 whitespace-nowrap">
                                {Math.round(u.prepHours * (1 - covered))} / {u.prepHours} h
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="border-t border-line">
                          <td className="py-1.5 pr-3 text-ink">Exam format</td>
                          <td className="py-1.5 pr-3 text-slate-500">{item.course.examFormatNote}</td>
                          <td className="py-1.5 text-right text-slate-600">{item.course.examFormatHours} h</td>
                        </tr>
                      </tbody>
                    </table>
                    </div>
                  </details>
                )}
              </details>
            </PlanRow>
          );
        })}
      </div>

      <CountryNotes countries={plan.countries} />

      {cta}

      <Disclaimer>
        Overlap values are illustrative and pending syllabus mapping (graph {GRAPH_VERSION}). Difficulty ratings are an
        illustrative editorial scale ({AP_INFO_VERSION}). Weekly figures assume {plan.weeks} weeks to the exam and a budget
        of {plan.budgetPerWeek} hrs/week after other commitments. No university is claimed to require any AP. Guidance
        only, not a score guarantee. <Link to="/methodology" className="underline">How this is calculated</Link>.
      </Disclaimer>
    </div>
  );
}
