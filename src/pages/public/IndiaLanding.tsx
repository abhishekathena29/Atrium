import { Link } from 'react-router-dom';
import { buildIndiaPlan } from '../../engine/overlap';
import { MAPPED_COVERAGE } from '../../data/overlapGraph';
import { SAMPLE_INDIA_PROFILE, SAMPLE_INDIA_USER } from '../../data/samples';
import { IndiaPlanView } from '../../components/plan/IndiaPlanView';
import { PageIntro, PublicLayout } from './PublicLayout';

const POINTS = [
  { icon: 'menu_book', tone: 'bg-leaf-100 text-leaf-700', t: 'Built on what you already study', d: 'Starts from your CBSE syllabus, unit by unit, and counts only what is new.' },
  { icon: 'balance', tone: 'bg-amber-100 text-amber-700', t: 'Ranked by extra load, balanced by difficulty', d: 'Ranked by the extra hours each AP adds, with at most one or two demanding APs at once.' },
  { icon: 'filter_alt', tone: 'bg-sky-100 text-sky-700', t: 'Filtered by relevance', d: 'An AP that adds little work but has little relevance to your major is still marked skip.' },
  { icon: 'handshake', tone: 'bg-violet-100 text-violet-700', t: 'No school AP advisor needed', d: 'The planner is free, and a mentor who has done it can check it with you.' },
];

export function IndiaLanding() {
  const plan = buildIndiaPlan(SAMPLE_INDIA_USER.india!, SAMPLE_INDIA_PROFILE);

  return (
    <PublicLayout>
      <PageIntro eyebrow="India" title={<>Which APs fit <span className="text-leaf-600">on top of your boards</span>?</>}>
        APs are an optional add-on to CBSE boards. We find the ones that add the least new work for your major.
      </PageIntro>

      <section className="border-b border-line">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-7 stagger lg:sticky lg:top-24 lg:self-start">
            {POINTS.map((p) => (
              <div key={p.t} className="flex gap-4">
                <span className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center ${p.tone}`}>
                  <span aria-hidden="true" className="material-symbols-outlined text-[22px]">{p.icon}</span>
                </span>
                <div>
                  <h3 className="font-jakarta font-bold text-ink text-[19px] leading-tight">{p.t}</h3>
                  <p className="text-[14px] text-slate-600 mt-1.5 leading-relaxed">{p.d}</p>
                </div>
              </div>
            ))}
            <Link
              to="/signup?role=student&segment=india"
              className="inline-flex items-center gap-2 bg-leaf-600 text-white text-[14px] font-semibold px-6 py-3.5 rounded-full hover:brightness-110 hover:shadow-glow active:scale-[0.98] transition"
            >
              Get your free plan
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="lg:col-span-7 min-w-0">
            <p className="text-[13px] text-slate-500 mb-3">Sample plan for a fictional student, computed live by the planner.</p>
            <IndiaPlanView user={SAMPLE_INDIA_USER} plan={plan} />
          </div>
        </div>
      </section>

      <section className="bg-canvas border-b border-line">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <h2 className="font-jakarta font-extrabold text-ink text-[28px] leading-tight mb-6">Boards mapped so far</h2>
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
            We'd rather tell you your board isn't mapped yet than guess. ICSE and state boards join the overlap map
            in later phases. IB, A-Levels and US high schools are planned on the Singapore · US track today.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
