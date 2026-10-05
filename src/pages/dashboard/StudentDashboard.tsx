import { Link } from 'react-router-dom';
import { COUNTRY_LABEL, type User } from '../../auth/types';
import { DIFFICULTY_LABEL } from '../../data/apInfo';
import { countriesOf } from '../../data/countries';
import { getStudentState, intakeOf, planHasAps } from '../../engine/studentState';
import { nextPathFor } from '../../engine/flow';
import { formatMonths } from '../../engine/courseLoad';
import { TOTAL_ITEMS } from '../../engine/profile';
import {
  computeGamification,
  fmtMinutes,
  planUnitKeys,
  profileCompletion,
  setupSections,
  unitKey,
} from '../../engine/gamification';
import { getUnitProgress, listConsults, listOutcomes } from '../../store/db';
import { ConsultStatusTag } from '../../components/ConsultStatusTag';
import { LevelCard, ProgressRing, StreakCard } from '../../components/gamify/Gamify';
import { useCountUp } from '../../components/gamify/useCountUp';
import { DifficultyPill } from '../../components/plan/PlanParts';
import { btnPrimary } from '../../components/ui/Field';
import { Panel, Tag } from './widgets';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function CompletionPanel({ user }: { user: User }) {
  const state = getStudentState(user);
  const { pct, items } = profileCompletion(user, state);
  const shown = useCountUp(pct);
  return (
    <Panel title="Profile completion">
      <div className="flex items-center gap-5">
        <ProgressRing pct={pct} size={92} stroke={9}>
          <span className="font-jakarta font-extrabold text-ink text-[22px] tabular-nums">{shown}%</span>
        </ProgressRing>
        <ul className="flex-1 space-y-1.5 min-w-0">
          {items.map((i) => (
            <li key={i.id}>
              <Link to={i.to} className="flex items-center gap-2 text-[13px] group">
                <span
                  className={'material-symbols-outlined text-[18px] ' + (i.done ? 'text-leaf-500' : 'text-slate-400 group-hover:text-leaf-500')}
                  style={i.done ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {i.done ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className={i.done ? 'text-slate-500 line-through decoration-slate-500/40' : 'text-ink group-hover:text-leaf-700 truncate'}>{i.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

export function StudentDashboard({ user }: { user: User }) {
  const firstName = user.name.split(' ')[0];
  const state = getStudentState(user);
  const consults = listConsults((c) => c.studentId === user.id);
  const outcomes = listOutcomes((o) => o.studentId === user.id && o.reporter === 'student');
  const g = computeGamification(user, state);
  const sections = setupSections(user, state);
  const setupDone = !!state.profile;

  // ---- Not set up yet: one clear call to action, with the XP each step is worth ---------
  if (!setupDone) {
    const answered = Object.keys(state.progress?.answers ?? {}).length;
    const steps = [
      { label: 'About you', done: sections.personality && sections.interests, detail: state.progress ? `${Math.round((answered / TOTAL_ITEMS) * 100)}% done` : '6 min · +80 XP' },
      { label: 'Your studies', done: state.intakeDone, detail: '4 min · +70 XP' },
      { label: 'Your plan', done: false, detail: 'Instant · +50 XP' },
    ];
    return (
      <>
        <h1 className="font-jakarta font-extrabold text-ink text-[30px] animate-fade-up">{greeting()}, {firstName} 👋</h1>
        <p className="text-[15px] text-slate-500 mt-1 mb-8">Let's get your free plan ready. You're a few minutes away.</p>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-hero-1 to-hero-2 ring-1 ring-leaf-300/40 text-white p-7 sm:p-10 animate-fade-up">
          <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-leaf-400/10 blur-2xl animate-float-slow" />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-widest text-leaf-800">Finish setting up · {g.xp} XP so far</p>
              <h2 className="font-jakarta font-extrabold text-[28px] leading-tight mt-2">
                {state.quizDone ? 'Next: tell us what you study' : 'Start with a few quick questions about you'}
              </h2>
              <p className="text-[14.5px] text-leaf-900 mt-2">
                {state.quizDone
                  ? 'Your school system, any APs you’re curious about, where you’re aiming and how busy your week is.'
                  : 'Tap-to-answer, no school stuff yet. It helps the plan fit how you actually work.'}
              </p>
              <Link to={nextPathFor(user)} className="mt-6 inline-flex items-center gap-2 bg-canvas text-leaf-800 text-[15px] font-bold rounded-full px-6 py-3 hover:bg-leaf-50 transition-colors animate-glow">
                {state.progress ? 'Continue' : 'Get started'}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
            <ol className="space-y-2.5 stagger">
              {steps.map((s, i) => (
                <li key={s.label} className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3">
                  <span className={'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold ' + (s.done ? 'bg-canvas text-leaf-700' : 'bg-white/20')}>
                    {s.done ? <span className="material-symbols-outlined text-[18px]">check</span> : i + 1}
                  </span>
                  <span className="flex-1 font-semibold text-[15px]">{s.label}</span>
                  <span className="text-[12.5px] text-leaf-900">{s.done ? 'Done' : s.detail}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="grid sm:grid-cols-3 gap-4 mt-6 stagger">
          {[
            { icon: 'route', t: 'A reasoned plan', b: 'Which APs, how many, how hard, and why.' },
            { icon: 'auto_awesome', t: 'Ask Atrium', b: 'Follow-up questions, answered for your profile.' },
            { icon: 'emoji_events', t: 'Streaks & awards', b: 'Small daily wins keep self-study going.' },
          ].map((c) => (
            <div key={c.t} className="bg-canvas rounded-3xl border border-line p-5 lift">
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

  // ---- Set up: progress, tasks, plan, goals ------------------------------------------------
  const hasConsult = consults.some((c) => !['cancelled', 'declined'].includes(c.status));
  const hasCompleted = consults.some((c) => c.status === 'completed');
  const ticked = new Set(getUnitProgress(user.id));
  const units = planUnitKeys(state);
  const unitsLeft = units.reduce((s, c) => s + c.units.filter((u) => !ticked.has(unitKey(c.courseId, u))).length, 0);
  const completion = profileCompletion(user, state);
  const intake = intakeOf(user)!;
  const countries = countriesOf(intake);

  const tasks = [
    ...completion.items.filter((i) => !i.done && !i.label.includes('optional')).map((i) => ({ icon: 'person_add', t: `Finish: ${i.label.toLowerCase()}`, to: i.to })),
    ...(!g.studiedToday ? [{ icon: 'local_fire_department', t: g.streak ? `Log study to keep your ${g.streak}-day streak` : 'Log a study session to start a streak', to: '/progress' }] : []),
    ...(unitsLeft ? [{ icon: 'checklist', t: `${unitsLeft} plan unit${unitsLeft === 1 ? '' : 's'} left to tick off`, to: '/progress' }] : []),
    ...(!hasConsult ? [{ icon: 'forum', t: 'Book your free 20-min mentor check', to: '/consults?new=free' }] : []),
    ...(hasCompleted && !outcomes.length ? [{ icon: 'fact_check', t: 'Report how your exam went', to: '/outcomes' }] : []),
    { icon: 'auto_awesome', t: 'Ask Atrium a follow-up question', to: '/coach' },
  ];

  const weeks = state.profile!.career.weeksToExam;
  const upcoming = [
    ...(planHasAps(state) ? [{ icon: 'event', t: `AP exams in ~${weeks} weeks`, b: 'AP exams run in the first two weeks of May.' }] : []),
    ...(user.sgus?.isAthlete && user.sgus.peakSeasonMonths.length ? [{ icon: 'sports', t: `Peak season: ${formatMonths(user.sgus.peakSeasonMonths)}`, b: 'Front-load heavy coursework before it.' }] : []),
    { icon: 'flag', t: `This week: ${fmtMinutes(g.weekMinutes)} of ${fmtMinutes(g.weeklyGoalMinutes)}`, b: 'Your weekly study goal, from your plan.' },
  ];

  return (
    <>
      <h1 className="font-jakarta font-extrabold text-ink text-[30px] animate-fade-up">{greeting()}, {firstName} 👋</h1>
      <p className="text-[15px] text-slate-500 mt-1 mb-6">Here's where things stand.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        <LevelCard g={g} />
        <StreakCard g={g} />
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            </div>
            <div>
              <p className="text-[28px] font-bold text-ink leading-none">{g.awards.filter((a) => a.earned).length}<span className="text-[14px] font-medium text-slate-500"> / {g.awards.length}</span></p>
              <p className="text-[12px] text-slate-600 mt-1">Awards earned</p>
            </div>
          </div>
          <Link to="/progress" className="text-[12px] mt-3 inline-block text-amber-800 font-semibold">See all awards →</Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <Panel title="Tasks remaining" action={<span className="text-[12.5px] text-slate-500">{tasks.length} to do</span>}>
            <ul className="space-y-2 stagger">
              {tasks.map((t) => (
                <li key={t.t}>
                  <Link to={t.to} className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-line px-4 py-3 lift">
                    <span className="w-9 h-9 rounded-xl bg-leaf-100 text-leaf-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
                    </span>
                    <span className="flex-1 text-[14px] font-semibold text-ink">{t.t}</span>
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Recommended for you" action={<Link to="/plan" className="text-[13px] font-semibold text-leaf-700">Open plan →</Link>}>
            {state.indiaPlan ? (
              state.indiaPlan.mapped ? (
                <div className="space-y-2">
                  {state.indiaPlan.recommended.map((i) => (
                    <div key={i.course.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="font-semibold text-ink text-[14.5px]">{i.course.name}</span>
                      <span className="flex items-center gap-2">
                        <DifficultyPill level={i.difficulty} label={DIFFICULTY_LABEL[i.difficulty]} />
                        <span className="text-[12.5px] text-slate-500">~{i.netNewPerWeek} hrs/wk</span>
                      </span>
                    </div>
                  ))}
                  <p className="text-[12.5px] text-slate-500 pt-1">{state.indiaPlan.countReason}</p>
                </div>
              ) : (
                <p className="text-[14px] text-slate-600">Your board and stream aren't mapped yet. Open your plan to see what's covered.</p>
              )
            ) : state.loadPlan ? (
              <div className="space-y-3">
                <p className="text-[14.5px] text-ink">
                  <span className="font-bold">{state.loadPlan.plannedLoad} / {state.loadPlan.ceiling} hrs</span> weekly load vs your ceiling
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {state.loadPlan.items.filter((i) => i.action !== 'drop').map((i) => <Tag key={i.name}>{i.kind === 'addon' ? i.name : `${i.name} ${i.to}`}</Tag>)}
                </div>
                {state.loadPlan.apNote && <p className="text-[12.5px] text-slate-500">{state.loadPlan.apNote}</p>}
              </div>
            ) : null}
          </Panel>

          <Panel title="Consults" action={<Link to="/consults" className="text-[13px] font-semibold text-leaf-700">Manage →</Link>}>
            {consults.length === 0 ? (
              <p className="text-[14px] text-slate-500">No consults yet. Your first 20-minute consult is free. Paid consults go deeper.</p>
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

        <div className="space-y-6 min-w-0">
          <CompletionPanel user={user} />

          <Panel title="Your goals" action={<Link to="/onboarding" className="text-[13px] font-semibold text-leaf-700">Edit</Link>}>
            <dl className="space-y-3 text-[13.5px]">
              <div>
                <dt className="text-[12px] text-slate-500">Majors</dt>
                <dd className="flex flex-wrap gap-1.5 mt-1">{intake.targetMajors.length ? intake.targetMajors.map((m) => <Tag key={m}>{m}</Tag>) : <span className="text-slate-500">Not set</span>}</dd>
              </div>
              <div>
                <dt className="text-[12px] text-slate-500">Applying to</dt>
                <dd className="flex flex-wrap gap-1.5 mt-1">
                  {intake.targetCountries?.length ? countries.map((c) => <Tag key={c}>{COUNTRY_LABEL[c]}</Tag>) : <Link to="/onboarding" className="text-leaf-700 font-semibold">Add countries →</Link>}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] text-slate-500">Dream universities</dt>
                <dd className="text-ink mt-1">{intake.targetColleges.length ? intake.targetColleges.join(', ') : <span className="text-slate-500">Optional</span>}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Coming up">
            <ul className="space-y-3">
              {upcoming.map((u) => (
                <li key={u.t} className="flex gap-3">
                  <span className="material-symbols-outlined text-sky-600 text-[20px]">{u.icon}</span>
                  <span>
                    <span className="block text-[13.5px] font-semibold text-ink">{u.t}</span>
                    <span className="block text-[12px] text-slate-500">{u.b}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Invite a parent">
            <p className="text-[13.5px] text-slate-600 leading-relaxed">
              Parents can see your plan and approve paid consults. They sign up as a parent with this code:
            </p>
            <p className="mt-3 font-mono text-[22px] font-bold tracking-[0.25em] text-leaf-800 bg-leaf-50 rounded-2xl px-4 py-2.5 w-fit">
              {user.parentInviteCode ?? '—'}
            </p>
          </Panel>

          <p className="text-center">
            <Link to="/coach" className={btnPrimary}>
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              Ask Atrium
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
