import type { ReactNode } from 'react';
import type { User } from '../../auth/types';
import { GRAPH_VERSION, MAPPED_COVERAGE, COVERAGE } from '../../data/overlapGraph';
import type { ApPlanItem, IndiaPlan } from '../../engine/overlap';
import { Disclaimer } from '../ui/Field';
import { PlanRow, Pill, SummaryTile, type Tone } from './PlanParts';

const TONE: Record<ApPlanItem['band'], Tone> = { 'High overlap': 'green', Partial: 'amber', None: 'grey' };

function range(n: number) {
  const lo = Math.max(0, Math.floor(n * 0.85));
  const hi = Math.ceil(n * 1.15);
  return lo === hi ? `~${hi} hrs` : `~${lo}–${hi} hrs`;
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
      <div className="bg-canvas border border-line rounded-md p-6 space-y-4">
        <span className="eyebrow text-bronze-600">Not mapped yet</span>
        <h2 className="font-serif text-ink text-display-sm">
          {intake.board} {intake.stream} is not in the overlap graph yet
        </h2>
        <p className="text-[14px] text-slate-600 leading-relaxed">
          Phase 1 maps CBSE Science streams only. We won't guess an AP plan for {you} without the
          syllabus mapping behind it. A mentor consult can still help in the meantime, and your
          questionnaire profile is saved for when your stream goes live.
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

  const boards = plan.boardSubjects.filter((s) => s !== 'English');

  return (
    <div className="bg-paper-2/40 border border-line rounded-md p-5 sm:p-7 space-y-5">
      <div>
        <h2 className="font-serif text-ink text-[26px] leading-tight">
          {audience === 'student' ? 'Which APs are nearly free for you' : `Which APs are nearly free for ${first}`}
        </h2>
        <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">
          Class {intake.grade} · {intake.board} {intake.stream}
          {majors.length ? ` · targeting ${majors.join(' / ')}` : ''} · US undergrad · already studying for
          boards. Ranked by net-new study load, not raw difficulty.
        </p>
      </div>

      {audience === 'parent' && (
        <div className="bg-canvas border border-line rounded-md p-4 text-[13.5px] text-slate-700 leading-relaxed">
          <p className="font-semibold text-ink mb-1">What this means, in plain terms</p>
          An AP is a US college-level exam that students can self-study for and sit in May. {first} is
          already learning much of the content for some APs in their Class {intake.grade} board syllabus, so
          those cost only a few extra hours a week. The plan suggests{' '}
          {plan.recommended.length
            ? plan.recommended.map((r) => r.course.name).join(', ')
            : 'no APs yet'}{' '}
          for about {range(plan.netNewPerWeek)} a week in total. It advises skipping APs that would be mostly
          new content and do little for {first}'s target major.
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-3">
        <SummaryTile label="Boards being sat" value={boards.join(' · ')} />
        <SummaryTile label="Recommended APs" value={`${plan.recommended.length} low-cost`} />
        <SummaryTile label="Est. net-new / week" value={range(plan.netNewPerWeek)} />
      </div>

      <div className="space-y-2.5">
        {plan.items.map((item) => (
          <PlanRow
            key={item.course.id}
            tone={item.recommendation === 'skip' ? 'grey' : TONE[item.band]}
            title={item.course.name}
            aside={item.recommendation === 'skip' ? 'skip for now' : item.recommendation === 'consider' ? 'consider' : undefined}
            body={
              <>
                {item.rationale}
                {item.reason && <span className="text-slate-500"> {item.reason}</span>}
              </>
            }
            pill={<Pill tone={TONE[item.band]}>{item.band}</Pill>}
            meta={`${item.loadLabel} · ~${item.netNewPerWeek} hrs/wk`}
          >
            {audience !== 'parent' && (
              <details className="mt-2 group">
                <summary className="text-[12px] text-bronze-600 cursor-pointer select-none list-none inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] group-open:rotate-90 transition-transform">chevron_right</span>
                  Unit-by-unit overlap
                </summary>
                <table className="w-full text-[12px] mt-2">
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
              </details>
            )}
          </PlanRow>
        ))}
      </div>

      {cta}

      <Disclaimer>
        Overlap values are illustrative and pending syllabus mapping (graph {GRAPH_VERSION}). Weekly figures
        assume {plan.weeks} weeks to the exam and a budget of {plan.budgetPerWeek} hrs/week. Guidance only,
        not a score guarantee. <a href="/methodology" className="underline">How this is calculated</a>.
      </Disclaimer>
    </div>
  );
}
