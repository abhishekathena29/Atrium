import { Link } from 'react-router-dom';
import { buildIndiaPlan } from '../../engine/overlap';
import { MAPPED_COVERAGE } from '../../data/overlapGraph';
import { SAMPLE_INDIA_PROFILE, SAMPLE_INDIA_USER } from '../../data/samples';
import { IndiaPlanView } from '../../components/plan/IndiaPlanView';
import { PageIntro, PublicLayout } from './PublicLayout';

const POINTS = [
  { t: 'Built on what you already study', d: 'The planner starts from your CBSE syllabus, unit by unit, and only counts what is genuinely new.' },
  { t: 'Ranked by net-new load', d: "Not by which AP sounds hardest, but by how many extra hours it costs you on top of the boards you're already sitting." },
  { t: 'Filtered by what it signals', d: 'An AP that is nearly free but says nothing about your target major is still marked skip.' },
  { t: 'No school AP advisor needed', d: "Most Indian schools don't have one. The plan is free, and a mentor who has done it can check it with you." },
];

export function IndiaLanding() {
  const plan = buildIndiaPlan(SAMPLE_INDIA_USER.india!, SAMPLE_INDIA_PROFILE);

  return (
    <PublicLayout>
      <PageIntro eyebrow="India · AP self-study" title={<>Which APs are <span className="italic text-bronze-600">nearly free</span> for you?</>}>
        If you're applying to US universities from a CBSE school, some APs overlap heavily with what you're
        already studying for boards. Atrium finds those, so you add the least new work for the most signal.
      </PageIntro>

      <section className="border-b border-line">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-8">
            {POINTS.map((p, i) => (
              <div key={p.t} className="flex gap-5">
                <span className="font-serif text-bronze-500 text-[28px] leading-none w-10 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-serif text-ink text-[21px] leading-tight">{p.t}</h3>
                  <p className="text-[14px] text-slate-600 mt-1.5 leading-relaxed">{p.d}</p>
                </div>
              </div>
            ))}
            <Link
              to="/signup?role=student&segment=india"
              className="inline-flex items-center gap-2 bg-ink text-paper text-[14px] font-medium px-6 py-3.5 rounded-sm hover:bg-ink-soft transition-colors"
            >
              Get your free AP plan
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="lg:col-span-7">
            <p className="eyebrow text-slate-500 mb-3">Sample plan · fictional student · computed live</p>
            <IndiaPlanView user={SAMPLE_INDIA_USER} plan={plan} />
          </div>
        </div>
      </section>

      <section className="bg-canvas border-b border-line">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <p className="eyebrow text-bronze-600 mb-4">What's mapped today</p>
          <div className="border border-line rounded-sm divide-y divide-line max-w-3xl">
            {MAPPED_COVERAGE.map((c) => (
              <div key={c.board + c.stream} className="grid grid-cols-3 px-5 py-3 text-[14px]">
                <span className="text-ink font-medium">{c.board}</span>
                <span className="text-slate-600">{c.stream}</span>
                <span className="text-slate-500 text-right">{c.status}</span>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-slate-500 mt-4 max-w-3xl">
            We'd rather tell you your board isn't mapped yet than guess. ICSE, state boards and A-Levels follow
            in later phases.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
