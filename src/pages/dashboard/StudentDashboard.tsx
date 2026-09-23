import { Link } from 'react-router-dom';
import type { User } from '../../auth/types';
import { SEGMENT_LABEL } from '../../auth/types';
import { getStudentState } from '../../engine/studentState';
import { TOTAL_ITEMS } from '../../engine/profile';
import { listConsults, listOutcomes } from '../../store/db';
import { ConsultStatusTag } from '../../components/ConsultStatusTag';
import { computeGamification } from '../../engine/gamification';
import { GamifyStrip } from '../../components/gamify/Gamify';
import { btnPrimary } from '../../components/ui/Field';
import { PageHeader, Panel, Tag } from './widgets';

type StageState = 'done' | 'current' | 'todo';

export function StudentDashboard({ user }: { user: User }) {
  const firstName = user.name.split(' ')[0];
  const state = getStudentState(user);
  const consults = listConsults((c) => c.studentId === user.id);
  const outcomes = listOutcomes((o) => o.studentId === user.id);
  const answered = Object.keys(state.progress?.answers ?? {}).length;

  const hasConsult = consults.some((c) => !['cancelled', 'declined'].includes(c.status));
  const hasCompleted = consults.some((c) => c.status === 'completed');

  const stages: { label: string; detail: string; to: string; state: StageState }[] = [
    { label: 'Onboarding', detail: user.segment === 'india' ? 'Board, stream, grade, targets' : 'Subjects, targets, training hours', to: '/onboarding', state: state.intakeDone ? 'done' : 'current' },
    { label: 'Questionnaire', detail: 'Temperament, interests, constraints', to: '/questionnaire', state: state.profile ? 'done' : state.intakeDone ? 'current' : 'todo' },
    { label: 'Free plan', detail: user.segment === 'india' ? 'Ranked AP overlap plan' : 'Load-capped course plan', to: '/plan', state: state.profile ? 'done' : 'todo' },
    { label: 'Mentor consult', detail: 'Free 20 min, then paid', to: '/consults', state: hasConsult ? 'done' : state.profile ? 'current' : 'todo' },
    { label: 'Report outcome', detail: 'After the exam / decision', to: '/outcomes', state: outcomes.length ? 'done' : hasCompleted ? 'current' : 'todo' },
  ];

  const current = stages.find((s) => s.state === 'current');

  return (
    <>
      <PageHeader
        eyebrow={`Student workspace · ${SEGMENT_LABEL[user.segment]}`}
        title={`Welcome, ${firstName}`}
        subtitle="Your plan, your consults, and what to do next."
      />

      {/* Intervention: resume an abandoned questionnaire */}
      {state.progress && !state.progress.completedAt && (
        <div className="mb-6 flex flex-wrap items-center gap-4 justify-between bg-accent-soft/60 border border-bronze-200 rounded-md px-5 py-4">
          <div>
            <p className="text-[14px] font-medium text-ink">Pick up where you left off</p>
            <p className="text-[12.5px] text-slate-600">
              Questionnaire {Math.round((answered / TOTAL_ITEMS) * 100)}% done · saved {new Date(state.progress.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <Link to="/questionnaire" className={btnPrimary}>Resume</Link>
        </div>
      )}

      <div className="mb-6">
        <GamifyStrip g={computeGamification(user, state)} />
      </div>

      <Panel title="Your path">
        <ol className="grid sm:grid-cols-5 gap-3">
          {stages.map((s, i) => (
            <li key={s.label}>
              <Link
                to={s.to}
                className={
                  'block h-full rounded-md border p-3 transition-colors ' +
                  (s.state === 'current'
                    ? 'border-bronze-400 bg-accent-soft/50'
                    : s.state === 'done'
                      ? 'border-line bg-canvas'
                      : 'border-dashed border-line-2 bg-paper')
                }
              >
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  {s.state === 'done' ? (
                    <span className="material-symbols-outlined text-emerald-700 text-[16px]">check_circle</span>
                  ) : (
                    <span className="font-serif text-[13px] text-bronze-600">{String(i + 1).padStart(2, '0')}</span>
                  )}
                  {s.state === 'current' ? 'Next' : s.state === 'done' ? 'Done' : ''}
                </span>
                <p className="text-[13.5px] font-medium text-ink mt-1.5">{s.label}</p>
                <p className="text-[11.5px] text-slate-500 leading-snug mt-0.5">{s.detail}</p>
              </Link>
            </li>
          ))}
        </ol>
        {current && (
          <Link to={current.to} className={btnPrimary + ' mt-5'}>
            Continue: {current.label}
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        )}
      </Panel>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Plan summary" action={state.profile && <Link to="/plan" className="text-[12.5px] font-medium text-bronze-600">Open plan</Link>}>
            {state.indiaPlan ? (
              state.indiaPlan.mapped ? (
                <div className="space-y-2">
                  {state.indiaPlan.recommended.map((i) => (
                    <div key={i.course.id} className="flex items-center justify-between text-[13.5px]">
                      <span className="text-ink font-medium">{i.course.name}</span>
                      <span className="text-slate-500">{i.band} · ~{i.netNewPerWeek} hrs/wk</span>
                    </div>
                  ))}
                  <p className="text-[12px] text-slate-500 pt-2">
                    ~{state.indiaPlan.netNewPerWeek} net-new hrs/week in total, within your {state.indiaPlan.budgetPerWeek} hr budget.
                  </p>
                </div>
              ) : (
                <p className="text-[13px] text-slate-600">Your board/stream isn't mapped yet. See your plan page for what's covered.</p>
              )
            ) : state.loadPlan ? (
              <div className="space-y-2">
                <p className="text-[13.5px] text-ink">
                  <span className="font-semibold">{state.loadPlan.plannedLoad} / {state.loadPlan.ceiling} hrs</span> weekly load vs ceiling
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {state.loadPlan.items.map((i) => <Tag key={i.name}>{i.name} {i.to}</Tag>)}
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-slate-500">Finish onboarding and the questionnaire to get your free plan.</p>
            )}
          </Panel>

          <Panel title="Consults" action={<Link to="/consults" className="text-[12.5px] font-medium text-bronze-600">Manage</Link>}>
            {consults.length === 0 ? (
              <p className="text-[13px] text-slate-500">
                No consults yet.{state.profile && ' Validate your plan with a mentor in a free 20-minute consult.'}
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {consults.slice(0, 4).map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-[13.5px] text-ink">{c.kind === 'free' ? 'Free 20-min consult' : 'Paid consult'}</p>
                      <p className="text-[11.5px] text-slate-500">{c.mentorName ?? 'Matching by Atrium team'}</p>
                    </div>
                    <ConsultStatusTag status={c.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Parent access">
            <p className="text-[13px] text-slate-600 leading-relaxed">
              A parent can view your plan and approve paid consults. They sign up as a parent with this code:
            </p>
            <p className="mt-3 font-mono text-[20px] tracking-[0.2em] text-ink bg-paper-2 rounded-sm px-3 py-2 w-fit">
              {user.parentInviteCode ?? '—'}
            </p>
          </Panel>

          {hasCompleted && !outcomes.length && (
            <Panel title="After your exam">
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Once you have results, tell us how the plan compared with reality. It makes the next plan better.
              </p>
              <Link to="/outcomes" className="mt-3 inline-block text-[13px] font-medium text-bronze-600">Report outcome →</Link>
            </Panel>
          )}

          {user.segment === 'sgus' && state.profile && (
            <Panel title="Semester roadmap">
              <p className="text-[13px] text-slate-600 leading-relaxed">
                A term-by-term roadmap with pacing checkpoints is coming later. We'll let you know before the next
                selection window.
              </p>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
