import { Link } from 'react-router-dom';
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

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export function Plan() {
  const { user } = useAuth();
  const state = getStudentState(user!);

  if (state.next !== 'plan') {
    return (
      <>
        <PageHeader
          eyebrow="My plan"
          title="Your plan isn't ready yet"
          subtitle="The plan is built from your intake and questionnaire. Nothing is generated before both are done."
        />
        <Link to={state.next === 'intake' ? '/onboarding' : '/questionnaire'} className={btnPrimary}>
          {state.next === 'intake' ? 'Start onboarding' : state.progress ? 'Resume questionnaire' : 'Take the questionnaire'}
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
        <Link to="/consults?new=free" className="shrink-0 bg-ink text-paper text-[12.5px] font-medium px-4 py-2 rounded-sm hover:bg-ink-soft">
          Book consult →
        </Link>
      }
    />
  );

  return (
    <>
      <PageHeader
        eyebrow="Step 3 of 3 · Your free plan"
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
            <p className="font-serif text-ink text-[24px] leading-tight">{profile.hollandCode}</p>
            <p className="text-[12.5px] text-slate-600 mb-4">{describeHolland(profile.hollandCode)}</p>
            <ul className="space-y-2">
              {(Object.keys(profile.ocean) as OceanTrait[]).map((t) => (
                <li key={t}>
                  <div className="flex justify-between text-[12px] text-slate-600">
                    <span>{OCEAN_LABEL[t]}</span>
                    <span>{profile.ocean[t].toFixed(1)} / 5</span>
                  </div>
                  <div className="h-1.5 bg-line rounded-full mt-1">
                    <div className="h-full bg-bronze-400 rounded-full" style={{ width: `${(profile.ocean[t] / 5) * 100}%` }} />
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
            <p className="mt-3 font-mono text-[20px] tracking-[0.2em] text-ink bg-paper-2 rounded-sm px-3 py-2 w-fit">
              {user!.parentInviteCode}
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}
