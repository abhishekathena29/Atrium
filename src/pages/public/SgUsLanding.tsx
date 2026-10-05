import { Link } from 'react-router-dom';
import { buildLoadPlan } from '../../engine/courseLoad';
import { SAMPLE_ATHLETE_PROFILE, SAMPLE_ATHLETE_USER } from '../../data/samples';
import { LoadPlanView } from '../../components/plan/LoadPlanView';
import { PageIntro, PublicLayout } from './PublicLayout';

export function SgUsLanding() {
  const plan = buildLoadPlan(SAMPLE_ATHLETE_USER.sgus!, SAMPLE_ATHLETE_PROFILE);

  return (
    <PublicLayout>
      <PageIntro eyebrow="Singapore · US track" title={<>A course load <span className="text-leaf-600">your week</span> can actually survive.</>}>
        IB, A-Levels or a US high school, plus any APs on top. Pick subjects and levels that fit your goals,
        under a weekly ceiling built from the hours you really have.
      </PageIntro>

      <section id="athletes" className="border-b border-line">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-leaf-600 mb-4">Flagship: student-athletes</p>
            <h2 className="font-jakarta font-bold text-ink text-[30px] leading-tight">
              Training hours set the ceiling. Your targets set the priorities.
            </h2>
            <ul className="mt-8 space-y-5 text-[14.5px] text-slate-600 leading-relaxed stagger">
              <li><span className="text-ink font-medium">Load ceiling from your training calendar.</span> Training and study share the same week.</li>
              <li><span className="text-ink font-medium">Interest fit from RIASEC.</span> Subjects most relevant to your major stay; the rest become levers.</li>
              <li><span className="text-ink font-medium">Keep, downgrade, or stretch, with reasons.</span> For example, drop one HL to SL for peak season and keep the subject most relevant to your major.</li>
              <li><span className="text-ink font-medium">Season-aware pacing.</span> Heavy coursework before competition months.</li>
              <li><span className="text-ink font-medium">Founding athlete-mentors.</span> We're recruiting founding athlete-mentors who carried a full course load through serious competition.</li>
            </ul>
            <Link
              to="/signup?role=student&segment=sgus"
              className="mt-10 inline-flex items-center gap-2 bg-leaf-600 text-white text-[14px] font-medium px-6 py-3.5 rounded-full hover:brightness-110 hover:shadow-glow transition-colors"
            >
              Get your free load plan
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <p className="text-[12.5px] text-slate-500 mt-4">Not an athlete? The same planner works with your other commitments.</p>
          </div>

          <div className="lg:col-span-7 min-w-0">
            <p className="eyebrow text-slate-500 mb-3">Sample plan · fictional student · computed live</p>
            <LoadPlanView user={SAMPLE_ATHLETE_USER} plan={plan} hollandCode={SAMPLE_ATHLETE_PROFILE.hollandCode} />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
