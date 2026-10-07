import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { OCEAN_LABEL, type OceanTrait } from '../../data/questionnaire';
import { getStudentState, planHasAps, planSubjects } from '../../engine/studentState';
import { matchMentors } from '../../engine/match';
import { committedHours, describeHolland, stretchCapsFor, workloadFactorFor } from '../../engine/profile';
import { IndiaPlanView } from '../../components/plan/IndiaPlanView';
import { LoadPlanView } from '../../components/plan/LoadPlanView';
import { MentorNudge } from '../../components/plan/PlanParts';
import { btnPrimary } from '../../components/ui/Field';
import { PageHeader, Panel } from '../dashboard/widgets';
import { computeGamification } from '../../engine/gamification';
import { AwardBadge, Confetti } from '../../components/gamify/Gamify';
import { useCountUp } from '../../components/gamify/useCountUp';
import { AiAdvisor } from '../../components/plan/AiAdvisor';

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export function Plan() {
  const { user } = useAuth();
  const state = getStudentState(user!);
  const [params, setParams] = useSearchParams();
  const welcome = params.get('welcome') === '1';

  if (state.next !== 'plan') {
    return (
      <>
        <PageHeader
          eyebrow="My plan"
          title="Your plan isn't ready yet"
          subtitle="The plan is built from your About-you answers and your studies. Nothing is generated before both are done."
        />
        <Link to={state.next === 'intake' ? '/onboarding' : '/questionnaire'} className={btnPrimary}>
          {state.next === 'intake' ? 'Fill in your studies' : state.progress ? 'Resume the About-you questions' : 'Start setting up'}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </>
    );
  }

  const profile = state.profile!;
  const top = matchMentors(user!, planSubjects(state))[0];
  const athlete = !!user!.sgus?.isAthlete;

  const cta = (
    <MentorNudge
      initials={top ? initials(top.mentor.name) : 'A'}
      title={top ? `${top.mentor.name} · ${top.mentor.headline}` : athlete ? 'Talk it through with an athlete-mentor' : 'Validate this plan with a mentor'}
      subtitle={top ? top.reasons.join(' · ') : 'Free 20-min consult. Founding mentors are being vetted, so we match you by hand.'}
      action={
        <Link to="/consults?new=free" className="shrink-0 bg-leaf-600 text-white text-[12.5px] font-medium px-4 py-2 rounded-full hover:brightness-110 hover:shadow-glow">
          Book consult →
        </Link>
      }
    />
  );

  const g = welcome ? computeGamification(user!, state) : null;
  const caps = stretchCapsFor(profile.ocean);
  const committed = committedHours(profile.career) + (user!.sgus?.isAthlete ? user!.sgus.trainingHoursPerWeek : 0);

  return (
    <>
      {welcome && g && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-hero-1 to-hero-2 ring-1 ring-leaf-300/40 text-white p-6 sm:p-8 mb-8 animate-pop">
          <Confetti />
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-leaf-400/10 blur-2xl" />
          <button onClick={() => setParams({})} className="absolute top-4 right-4 text-white/70 hover:text-white" aria-label="Dismiss">
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="relative">
            <p className="text-[13px] font-bold uppercase tracking-widest text-leaf-800">Setup complete: <XpCount xp={g.xp} /> XP, Level {g.level} {g.levelName}</p>
            <h1 className="font-jakarta font-extrabold text-[28px] sm:text-[34px] leading-tight mt-1">🎉 Your plan is ready, {user!.name.split(' ')[0]}!</h1>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {g.awards.filter((a) => a.earned).map((a) => (
                <span key={a.id} className="inline-flex items-center gap-2 bg-white/15 rounded-full pl-1 pr-3 py-1">
                  <AwardBadge a={a} size="sm" />
                  <span className="text-[13px] font-semibold">{a.title} unlocked</span>
                </span>
              ))}
            </div>
            <p className="text-[14px] text-leaf-900 mt-5 mb-3">Here's what to do next:</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { to: '/consults?new=free', icon: 'forum', t: 'Check it with a mentor', b: 'Free 20-minute consult' },
                { to: '/progress', icon: 'local_fire_department', t: 'Start your streak', b: 'Log your first study session' },
                { to: '/dashboard', icon: 'family_restroom', t: 'Invite a parent', b: `Share code ${user!.parentInviteCode ?? ''}` },
              ].map((c) => (
                <Link key={c.t} to={c.to} className="bg-canvas text-ink rounded-2xl p-4 flex items-center gap-3 hover:shadow-card transition-shadow">
                  <span className="w-10 h-10 rounded-xl bg-leaf-50 text-leaf-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">{c.icon}</span>
                  </span>
                  <span>
                    <span className="block font-jakarta font-bold text-[14.5px]">{c.t}</span>
                    <span className="block text-[12.5px] text-slate-500">{c.b}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <PageHeader
        eyebrow="Your free plan"
        title={user!.segment === 'india' ? 'Your AP plan' : 'Your course-load plan'}
        subtitle="Free, and yours to keep. Ask follow-up questions, or have a mentor pressure-test it before you commit."
        action={<Link to="/onboarding" className="text-[13px] font-semibold text-leaf-700">Edit my answers →</Link>}
      />

      <ol className="grid sm:grid-cols-3 gap-3 mb-6 stagger">
        {[
          { icon: 'route', t: 'Free plan', b: 'Rule-based, every reason shown', on: true, to: '#plan' },
          { icon: 'auto_awesome', t: 'AI follow-ups', b: 'Ask Atrium anything about it', on: false, to: '/coach' },
          { icon: 'workspace_premium', t: 'Mentor (premium)', b: 'Deeper, personal guidance', on: false, to: '/consults?new=paid' },
        ].map((s, i) => (
          <li key={s.t}>
            <Link to={s.to} className={'flex items-center gap-3 rounded-2xl border p-3.5 lift ' + (s.on ? 'bg-leaf-50 border-leaf-200' : 'bg-canvas border-line')}>
              <span className={'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ' + (i === 2 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-violet-100 text-violet-700' : 'bg-leaf-100 text-leaf-700')}>
                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
              </span>
              <span>
                <span className="block font-jakarta font-bold text-ink text-[14px]">{i + 1}. {s.t}</span>
                <span className="block text-[12px] text-slate-500">{s.b}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="grid lg:grid-cols-3 gap-6">
        <div id="plan" className="lg:col-span-2 space-y-6 min-w-0">
          {state.indiaPlan && <IndiaPlanView user={user!} plan={state.indiaPlan} cta={cta} />}
          {state.loadPlan && <LoadPlanView user={user!} plan={state.loadPlan} hollandCode={profile.hollandCode} cta={cta} />}
          <AiAdvisor user={user!} state={state} />
        </div>

        <div className="space-y-6 min-w-0">
          <Panel title="How you shaped this plan">
            <ul className="space-y-3 text-[13px] text-slate-700">
              <li className="flex gap-2.5">
                <span className="material-symbols-outlined text-violet-600 text-[20px]">interests</span>
                <span><span className="font-semibold text-ink">Interests ({profile.hollandCode}):</span> {describeHolland(profile.hollandCode)}. Matching subjects rank higher.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="material-symbols-outlined text-sky-600 text-[20px]">speed</span>
                <span><span className="font-semibold text-ink">Workload style ×{profile.loadFactor}:</span> {profile.pacingNote}</span>
              </li>
              {planHasAps(state) && (
                <li className="flex gap-2.5">
                  <span className="material-symbols-outlined text-amber-600 text-[20px]" aria-hidden="true">balance</span>
                  <span><span className="font-semibold text-ink">Stretch limit:</span> up to {caps.maxHard} demanding AP{caps.maxHard === 1 ? '' : 's'}, {caps.maxTotal} in total. {caps.why ?? 'You handle pressure well, so the plan can carry two stretches.'}</span>
                </li>
              )}
              <li className="flex gap-2.5">
                <span className="material-symbols-outlined text-leaf-600 text-[20px]">schedule</span>
                <span>
                  <span className="font-semibold text-ink">Your week:</span> {committed} hrs/week already committed outside school
                  {user!.segment === 'india' && workloadFactorFor(committedHours(profile.career)) < 1 ? `, so your AP budget was trimmed by ${Math.round((1 - workloadFactorFor(committedHours(profile.career))) * 100)}%` : ''}.
                </span>
              </li>
            </ul>
          </Panel>
          <Panel title="Your personality snapshot">
            <ul className="space-y-2">
              {(Object.keys(profile.ocean) as OceanTrait[]).map((t) => (
                <li key={t}>
                  <div className="flex justify-between text-[12px] text-slate-600">
                    <span>{OCEAN_LABEL[t]}</span>
                    <span>{profile.ocean[t].toFixed(1)} / 5</span>
                  </div>
                  <div className="h-1.5 bg-line rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-leaf-400 rounded-full animate-slide-left" style={{ width: `${(profile.ocean[t] / 5) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Share with a parent">
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Parents can view this plan and approve paid consults. Give them this code to use at sign-up:
            </p>
            <p className="mt-3 font-mono text-[20px] tracking-[0.2em] text-ink bg-paper-2 rounded-xl px-3 py-2 w-fit">
              {user!.parentInviteCode}
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}

function XpCount({ xp }: { xp: number }) {
  return <>{useCountUp(xp, 1200)}</>;
}
