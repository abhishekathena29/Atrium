import { Link } from 'react-router-dom';
import type { User } from '../../auth/types';
import { getStudentState } from '../../engine/studentState';
import { TOTAL_ITEMS } from '../../engine/profile';
import { nextPathFor } from '../../engine/flow';
import { computeGamification, fmtMinutes } from '../../engine/gamification';
import { listConsults, listOutcomes } from '../../store/db';
import { ConsultStatusTag } from '../../components/ConsultStatusTag';
import { GamifyStrip } from '../../components/gamify/Gamify';
import { btnPrimary } from '../../components/ui/Field';
import { Panel, Tag } from './widgets';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function StudentDashboard({ user }: { user: User }) {
  const firstName = user.name.split(' ')[0];
  const state = getStudentState(user);
  const consults = listConsults((c) => c.studentId === user.id);
  const outcomes = listOutcomes((o) => o.studentId === user.id && o.reporter === 'student');
  const answered = Object.keys(state.progress?.answers ?? {}).length;
  const setupDone = !!state.profile;

  // ---- Not set up yet: one clear call to action ------------------------------------------
  if (!setupDone) {
    const steps = [
      { label: 'About you', done: state.intakeDone, detail: '2 min' },
      { label: 'Questionnaire', done: false, detail: state.progress ? `${Math.round((answered / TOTAL_ITEMS) * 100)}% done` : '8 min' },
      { label: 'Your plan', done: false, detail: 'Instant' },
    ];
    return (
      <>
        <h1 className="font-jakarta font-extrabold text-ink text-[30px]">{greeting()}, {firstName} 👋</h1>
        <p className="text-[15px] text-slate-500 mt-1 mb-8">Let's get your free plan ready. You're a few minutes away.</p>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-leaf-600 to-leaf-800 text-white p-7 sm:p-10">
          <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-white/10" />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-widest text-leaf-200">Finish setting up</p>
              <h2 className="font-jakarta font-extrabold text-[28px] leading-tight mt-2">
                {state.intakeDone ? 'Next: the questionnaire' : 'Start with a few questions about you'}
              </h2>
              <p className="text-[14.5px] text-leaf-100 mt-2">
                {state.intakeDone
                  ? 'It tells us how you like to work and what interests you, so the plan fits you.'
                  : 'Your board or curriculum, what you study, and where you’re aiming.'}
              </p>
              <Link to={nextPathFor(user)} className="mt-6 inline-flex items-center gap-2 bg-white text-leaf-800 text-[15px] font-bold rounded-full px-6 py-3 hover:bg-leaf-50 transition-colors">
                {state.progress ? 'Continue' : state.intakeDone ? 'Start questionnaire' : 'Get started'}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
            <ol className="space-y-2.5">
              {steps.map((s, i) => (
                <li key={s.label} className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3">
                  <span className={'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold ' + (s.done ? 'bg-white text-leaf-700' : 'bg-white/20')}>
                    {s.done ? <span className="material-symbols-outlined text-[18px]">check</span> : i + 1}
                  </span>
                  <span className="flex-1 font-semibold text-[15px]">{s.label}</span>
                  <span className="text-[12.5px] text-leaf-100">{s.done ? 'Done' : s.detail}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          {[
            { icon: 'route', t: 'A reasoned plan', b: 'Every recommendation shows why.' },
            { icon: 'forum', t: 'A free mentor consult', b: 'Check your plan with someone who has done it.' },
            { icon: 'emoji_events', t: 'Streaks & awards', b: 'Small daily wins keep self-study going.' },
          ].map((c) => (
            <div key={c.t} className="bg-white rounded-3xl border border-line p-5">
              <span className="w-10 h-10 rounded-xl bg-leaf-50 text-leaf-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">{c.icon}</span>
              </span>
              <p className="font-jakarta font-bold text-ink text-[15.5px] mt-3">{c.t}</p>
              <p className="text-[13px] text-slate-500 mt-0.5">{c.b}</p>
            </div>
          ))}
        </div>
      </>
    );
  }

  // ---- Set up: progress, the one next thing, and the plan --------------------------------
  const g = computeGamification(user, state);
  const hasConsult = consults.some((c) => !['cancelled', 'declined'].includes(c.status));
  const hasCompleted = consults.some((c) => c.status === 'completed');

  const nextUp = !g.studiedToday
    ? { icon: 'local_fire_department', tone: 'bg-orange-100 text-orange-600', t: g.streak ? `Keep your ${g.streak}-day streak alive` : 'Start a study streak', b: 'Log even 15 minutes of study today.', to: '/progress', cta: 'Log study' }
    : !hasConsult
      ? { icon: 'forum', tone: 'bg-sky-100 text-sky-700', t: 'Check your plan with a mentor', b: 'Your free 20-minute consult is waiting.', to: '/consults?new=free', cta: 'Book free consult' }
      : hasCompleted && !outcomes.length
        ? { icon: 'fact_check', tone: 'bg-rose-100 text-rose-700', t: 'Tell us how it went', b: 'Report your result to sharpen the next plan.', to: '/outcomes', cta: 'Report outcome' }
        : { icon: 'checklist', tone: 'bg-leaf-100 text-leaf-700', t: 'Keep ticking off your plan', b: `${fmtMinutes(g.weekMinutes)} of ${fmtMinutes(g.weeklyGoalMinutes)} logged this week.`, to: '/progress', cta: 'Open progress' };

  return (
    <>
      <h1 className="font-jakarta font-extrabold text-ink text-[30px]">{greeting()}, {firstName} 👋</h1>
      <p className="text-[15px] text-slate-500 mt-1 mb-6">Here's where things stand.</p>

      <GamifyStrip g={g} />

      <section className="mt-6 bg-white rounded-3xl border border-line p-6 flex flex-wrap items-center gap-5">
        <span className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${nextUp.tone}`}>
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>{nextUp.icon}</span>
        </span>
        <div className="flex-1 min-w-[200px]">
          <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400">Next up</p>
          <p className="font-jakarta font-bold text-ink text-[19px]">{nextUp.t}</p>
          <p className="text-[14px] text-slate-500">{nextUp.b}</p>
        </div>
        <Link to={nextUp.to} className={btnPrimary}>{nextUp.cta}</Link>
      </section>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Your plan" action={<Link to="/plan" className="text-[13px] font-semibold text-leaf-700">Open plan →</Link>}>
            {state.indiaPlan ? (
              state.indiaPlan.mapped ? (
                <ul className="space-y-2">
                  {state.indiaPlan.recommended.map((i) => (
                    <li key={i.course.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="font-semibold text-ink text-[14.5px]">{i.course.name}</span>
                      <span className="text-[12.5px] text-slate-500">{i.band} · ~{i.netNewPerWeek} hrs/wk</span>
                    </li>
                  ))}
                  <p className="text-[12.5px] text-slate-500 pt-1">
                    ~{state.indiaPlan.netNewPerWeek} net-new hrs/week in total, within your {state.indiaPlan.budgetPerWeek} hr budget.
                  </p>
                </ul>
              ) : (
                <p className="text-[14px] text-slate-600">Your board and stream aren't mapped yet. Open your plan to see what's covered.</p>
              )
            ) : state.loadPlan ? (
              <div className="space-y-3">
                <p className="text-[14.5px] text-ink">
                  <span className="font-bold">{state.loadPlan.plannedLoad} / {state.loadPlan.ceiling} hrs</span> weekly load vs your ceiling
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {state.loadPlan.items.map((i) => <Tag key={i.name}>{i.name} {i.to}</Tag>)}
                </div>
              </div>
            ) : null}
          </Panel>

          <Panel title="Consults" action={<Link to="/consults" className="text-[13px] font-semibold text-leaf-700">Manage →</Link>}>
            {consults.length === 0 ? (
              <p className="text-[14px] text-slate-500">No consults yet. Your first 20-minute consult is free.</p>
            ) : (
              <ul className="divide-y divide-line">
                {consults.slice(0, 4).map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-[14px] font-semibold text-ink">{c.kind === 'free' ? 'Free 20-min consult' : 'Paid consult'}</p>
                      <p className="text-[12.5px] text-slate-500">{c.mentorName ?? 'Matching by Atrium team'}</p>
                    </div>
                    <ConsultStatusTag status={c.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Invite a parent">
            <p className="text-[13.5px] text-slate-600 leading-relaxed">
              Parents can see your plan and approve paid consults. They sign up as a parent with this code:
            </p>
            <p className="mt-3 font-mono text-[22px] font-bold tracking-[0.25em] text-leaf-800 bg-leaf-50 rounded-2xl px-4 py-2.5 w-fit">
              {user.parentInviteCode ?? '—'}
            </p>
          </Panel>

          {user.segment === 'sgus' && (
            <Panel title="Semester roadmap">
              <p className="text-[13.5px] text-slate-600 leading-relaxed">
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
