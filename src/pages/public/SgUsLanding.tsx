import { Link } from 'react-router-dom';
import { buildLoadPlan } from '../../engine/courseLoad';
import { SAMPLE_ATHLETE_PROFILE, SAMPLE_ATHLETE_USER } from '../../data/samples';
import { LoadPlanView } from '../../components/plan/LoadPlanView';
import { PageIntro, PublicLayout } from './PublicLayout';

const POINTS = [
  { icon: 'sprint', tone: 'bg-orange-100 text-orange-700', t: 'Load ceiling from your training calendar.', d: 'Training and study share the same week.' },
  { icon: 'interests', tone: 'bg-violet-100 text-violet-700', t: 'Interest fit from your quiz.', d: 'Subjects most relevant to your major stay; the rest become levers.' },
  { icon: 'tune', tone: 'bg-sky-100 text-sky-700', t: 'Keep, downgrade or stretch, with reasons.', d: 'For example, drop one HL to SL for peak season and keep the subject closest to your major.' },
  { icon: 'calendar_month', tone: 'bg-amber-100 text-amber-700', t: 'Season-aware pacing.', d: 'Heavy coursework lands before competition months.' },
  { icon: 'handshake', tone: 'bg-leaf-100 text-leaf-700', t: 'Founding athlete-mentors.', d: 'We are recruiting mentors who carried a full course load through serious competition.' },
];

export function SgUsLanding() {
  const plan = buildLoadPlan(SAMPLE_ATHLETE_USER.sgus!, SAMPLE_ATHLETE_PROFILE);

  return (
    <PublicLayout>
      <PageIntro eyebrow="Singapore · US" title={<>A course load <span className="text-leaf-600">your week</span> can actually survive.</>}>
        IB, A-Levels or a US high school, plus any APs on top, sized to the hours you really have.
      </PageIntro>

      <section id="athletes" className="border-b border-line">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <h2 className="font-jakarta font-bold text-ink text-[30px] leading-tight">
              For student-athletes, training hours set the ceiling.
            </h2>
            <p className="text-[15px] text-slate-600 leading-relaxed mt-3">
              Your targets set the priorities. Not an athlete? The same planner works with your other commitments.
            </p>
            <ul className="mt-8 space-y-5 stagger">
              {POINTS.map((p) => (
                <li key={p.t} className="flex gap-4">
                  <span className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center ${p.tone}`}>
                    <span aria-hidden="true" className="material-symbols-outlined text-[20px]">{p.icon}</span>
                  </span>
                  <p className="text-[14.5px] text-slate-600 leading-relaxed">
                    <span className="text-ink font-medium">{p.t}</span> {p.d}
                  </p>
                </li>
              ))}
            </ul>
            <Link
              to="/signup?role=student&segment=sgus"
              className="mt-10 inline-flex items-center gap-2 bg-leaf-600 text-white text-[14px] font-semibold px-6 py-3.5 rounded-full hover:brightness-110 hover:shadow-glow active:scale-[0.98] transition"
            >
              Get your free plan
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="lg:col-span-7 min-w-0">
            <p className="text-[13px] text-slate-500 mb-3">Sample plan for a fictional student-athlete, computed live by the planner.</p>
            <LoadPlanView user={SAMPLE_ATHLETE_USER} plan={plan} hollandCode={SAMPLE_ATHLETE_PROFILE.hollandCode} />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
