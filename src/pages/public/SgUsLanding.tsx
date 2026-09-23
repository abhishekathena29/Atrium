import { Link } from 'react-router-dom';
import { buildLoadPlan } from '../../engine/courseLoad';
import { SAMPLE_ATHLETE_PROFILE, SAMPLE_ATHLETE_USER } from '../../data/samples';
import { LoadPlanView } from '../../components/plan/LoadPlanView';
import { PageIntro, PublicLayout } from './PublicLayout';

export function SgUsLanding() {
  const plan = buildLoadPlan(SAMPLE_ATHLETE_USER.sgus!, SAMPLE_ATHLETE_PROFILE);

  return (
    <PublicLayout>
      <PageIntro eyebrow="Singapore · US track · IB, A-Level, AP" title={<>A course load <span className="italic text-bronze-600">your week</span> can actually survive.</>}>
        Choose subjects and levels that fit where you're aiming and how you're wired, under a weekly ceiling
        built from the hours you really have.
      </PageIntro>

      <section id="athletes" className="border-b border-line">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-bronze-600 mb-4">Flagship: student-athletes</p>
            <h2 className="font-serif text-ink text-display-md leading-tight">
              Training hours set the ceiling. Your targets set the priorities.
            </h2>
            <ul className="mt-8 space-y-5 text-[14.5px] text-slate-600 leading-relaxed">
              <li><span className="text-ink font-medium">Load ceiling from your training calendar.</span> Every training hour comes out of the same week as your studying.</li>
              <li><span className="text-ink font-medium">Interest fit from RIASEC.</span> Subjects central to your major are kept, and the rest become levers.</li>
              <li><span className="text-ink font-medium">Keep, downgrade, or stretch, with reasons.</span> For example, drop one HL to SL for peak season and keep the subject your application needs.</li>
              <li><span className="text-ink font-medium">Season-aware pacing.</span> Front-load heavy coursework before competition months.</li>
              <li><span className="text-ink font-medium">Athlete-mentors.</span> Consults with mentors who carried a full load through serious competition.</li>
            </ul>
            <Link
              to="/signup?role=student&segment=sgus"
              className="mt-10 inline-flex items-center gap-2 bg-ink text-paper text-[14px] font-medium px-6 py-3.5 rounded-sm hover:bg-ink-soft transition-colors"
            >
              Get your free load plan
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <p className="text-[12.5px] text-slate-500 mt-4">Not an athlete? The same planner works with your other commitments.</p>
          </div>

          <div className="lg:col-span-7">
            <p className="eyebrow text-slate-500 mb-3">Sample plan · fictional student · computed live</p>
            <LoadPlanView user={SAMPLE_ATHLETE_USER} plan={plan} hollandCode={SAMPLE_ATHLETE_PROFILE.hollandCode} />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
