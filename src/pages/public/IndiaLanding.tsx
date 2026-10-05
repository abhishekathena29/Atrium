import { Link } from 'react-router-dom';
import { buildIndiaPlan } from '../../engine/overlap';
import { MAPPED_COVERAGE } from '../../data/overlapGraph';
import { SAMPLE_INDIA_PROFILE, SAMPLE_INDIA_USER } from '../../data/samples';
import { IndiaPlanView } from '../../components/plan/IndiaPlanView';
import { PageIntro, PublicLayout } from './PublicLayout';

const POINTS = [
  { t: 'Built on what you already study', d: 'Starts from your CBSE syllabus, unit by unit, and counts only what is new.' },
  { t: 'Ranked by extra load, balanced by difficulty', d: 'Ranked by the extra hours each AP adds on top of your boards, then balanced so you carry at most one or two demanding APs at once.' },
  { t: 'Filtered by relevance', d: 'An AP that adds little work but has little relevance to your target major is still marked skip.' },
  { t: 'No school AP advisor needed', d: 'The planner is free, and a mentor who has done it can check it with you.' },
];

export function IndiaLanding() {
  const plan = buildIndiaPlan(SAMPLE_INDIA_USER.india!, SAMPLE_INDIA_PROFILE);

  return (
    <PublicLayout>
      <PageIntro eyebrow="India · Free AP planner" title={<>Which APs fit <span className="text-leaf-600">on top of your boards</span>?</>}>
        At a CBSE school and aiming for universities in the US, the UK or elsewhere? APs are an optional add-on to
        your boards, and some overlap heavily with what you already study. The free AP planner finds them, so you
        add the least new work for the most relevance.
      </PageIntro>

      <section className="border-b border-line">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-8 stagger">
            {POINTS.map((p, i) => (
              <div key={p.t} className="flex gap-5">
                <span className="font-jakarta font-extrabold text-leaf-500 text-[28px] leading-none w-10 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-jakarta font-bold text-ink text-[21px] leading-tight">{p.t}</h3>
                  <p className="text-[14px] text-slate-600 mt-1.5 leading-relaxed">{p.d}</p>
                </div>
              </div>
            ))}
            <Link
              to="/signup?role=student&segment=india"
              className="inline-flex items-center gap-2 bg-leaf-600 text-white text-[14px] font-medium px-6 py-3.5 rounded-full hover:brightness-110 hover:shadow-glow transition-colors"
            >
              Start the free AP planner
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="lg:col-span-7 min-w-0">
            <p className="eyebrow text-slate-500 mb-3">Sample plan · fictional student · computed live</p>
            <IndiaPlanView user={SAMPLE_INDIA_USER} plan={plan} />
          </div>
        </div>
      </section>

      <section className="bg-canvas border-b border-line">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <p className="eyebrow text-leaf-600 mb-4">What's mapped today</p>
          <div className="border border-line rounded-2xl overflow-hidden divide-y divide-line max-w-3xl">
            {MAPPED_COVERAGE.map((c) => (
              <div key={c.board + c.stream} className="grid grid-cols-3 px-5 py-3 text-[14px]">
                <span className="text-ink font-medium">{c.board}</span>
                <span className="text-slate-600">{c.stream}</span>
                <span className="text-slate-500 text-right">{c.status}</span>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-slate-500 mt-4 max-w-3xl">
            This table is the CBSE-to-AP overlap map only. We'd rather tell you your board isn't mapped yet than
            guess: ICSE and state boards join the overlap map in later phases. (IB, A-Levels and US high schools
            are planned on the Singapore · US track today.)
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
