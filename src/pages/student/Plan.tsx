import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { OCEAN_LABEL, type OceanTrait } from '../../data/questionnaire';
import { getStudentState, planSubjects } from '../../engine/studentState';
import { matchMentors } from '../../engine/match';
import { describeHolland } from '../../engine/profile';
import { IndiaPlanView } from '../../components/plan/IndiaPlanView';
import { LoadPlanView } from '../../components/plan/LoadPlanView';
import { MentorNudge } from '../../components/plan/PlanParts';
import { btnPrimary } from '../../components/ui/Field';
import { PageHeader, Panel } from '../dashboard/widgets';
import { computeGamification } from '../../engine/gamification';
import { AwardBadge } from '../../components/gamify/Gamify';

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
          subtitle="The plan is built from your intake and questionnaire. Nothing is generated before both are done."
        />
        <Link to={state.next === 'intake' ? '/welcome' : '/questionnaire'} className={btnPrimary}>
          {state.next === 'intake' ? 'Start setting up' : state.progress ? 'Resume questionnaire' : 'Take the questionnaire'}
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
        <Link to="/consults?new=free" className="shrink-0 bg-leaf-600 text-white text-[12.5px] font-medium px-4 py-2 rounded-full hover:bg-leaf-700">
          Book consult →
        </Link>
      }
    />
  );

  const g = welcome ? computeGamification(user!, state) : null;

  return (
    <>
      {welcome && g && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-leaf-600 to-leaf-800 text-white p-6 sm:p-8 mb-8">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-white/10" />
          <button onClick={() => setParams({})} className="absolute top-4 right-4 text-white/70 hover:text-white" aria-label="Dismiss">
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="relative">
            <p className="text-[13px] font-bold uppercase tracking-widest text-leaf-200">Setup complete · {g.xp} XP</p>
            <h1 className="font-jakarta font-extrabold text-[28px] sm:text-[34px] leading-tight mt-1">🎉 Your plan is ready, {user!.name.split(' ')[0]}!</h1>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {g.awards.filter((a) => a.earned).map((a) => (
                <span key={a.id} className="inline-flex items-center gap-2 bg-white/15 rounded-full pl-1 pr-3 py-1">
                  <AwardBadge a={a} size="sm" />
                  <span className="text-[13px] font-semibold">{a.title} unlocked</span>
                </span>
              ))}
            </div>
            <p className="text-[14px] text-leaf-100 mt-5 mb-3">Here's what to do next:</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { to: '/consults?new=free', icon: 'forum', t: 'Check it with a mentor', b: 'Free 20-minute consult' },
                { to: '/progress', icon: 'local_fire_department', t: 'Start your streak', b: 'Log your first study session' },
                { to: '/dashboard', icon: 'family_restroom', t: 'Invite a parent', b: `Share code ${user!.parentInviteCode ?? ''}` },
              ].map((c) => (
                <Link key={c.t} to={c.to} className="bg-white text-ink rounded-2xl p-4 flex items-center gap-3 hover:shadow-card transition-shadow">
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
        title={user!.segment === 'india' ? 'Your AP overlap plan' : 'Your course-load plan'}
        subtitle="Free, and yours to keep. A mentor can help you pressure-test it before you commit."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {state.indiaPlan && <IndiaPlanView user={user!} plan={state.indiaPlan} cta={cta} />}
          {state.loadPlan && <LoadPlanView user={user!} plan={state.loadPlan} hollandCode={profile.hollandCode} cta={cta} />}
        </div>

        <div className="space-y-6">
          <Panel title="Your profile">
            <p className="text-[12px] text-slate-500">Holland code</p>
            <p className="font-jakarta font-bold text-ink text-[24px] leading-tight">{profile.hollandCode}</p>
            <p className="text-[12.5px] text-slate-600 mb-4">{describeHolland(profile.hollandCode)}</p>
            <ul className="space-y-2">
              {(Object.keys(profile.ocean) as OceanTrait[]).map((t) => (
                <li key={t}>
                  <div className="flex justify-between text-[12px] text-slate-600">
                    <span>{OCEAN_LABEL[t]}</span>
                    <span>{profile.ocean[t].toFixed(1)} / 5</span>
                  </div>
                  <div className="h-1.5 bg-line rounded-full mt-1">
                    <div className="h-full bg-leaf-400 rounded-full" style={{ width: `${(profile.ocean[t] / 5) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Pacing">
            <p className="text-[13px] text-slate-700 leading-relaxed">{profile.pacingNote}</p>
            <p className="text-[11.5px] text-slate-500 mt-3">
              Load factor ×{profile.loadFactor}, from Conscientiousness and Neuroticism.
            </p>
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
