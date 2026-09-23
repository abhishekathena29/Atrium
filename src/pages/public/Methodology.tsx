import { COVERAGE, GRAPH_VERSION, MAPPED_COVERAGE } from '../../data/overlapGraph';
import { IB_CORE_HOURS, LEVEL_HOURS } from '../../engine/courseLoad';
import { PRICE } from '../../data/pricing';
import { PageIntro, PublicLayout } from './PublicLayout';

const UPDATED = '23 Sep 2026';

type Row = { name: string; definition: string; source: string; status: 'Real' | 'Illustrative' | 'Proposed' | 'Formula' };

const NUMBERS: Row[] = [
  {
    name: 'Net-new hours (per AP)',
    definition: `Sum over the AP's units of prep hours × (1 − board coverage), plus exam-format hours. Coverage is ${COVERAGE.full * 100}% for a "full" unit, ${COVERAGE.partial * 100}% for "partial", 0% for "none". It is 0% for any unit whose board subject you don't take.`,
    source: `Overlap graph ${GRAPH_VERSION}`,
    status: 'Illustrative',
  },
  {
    name: 'Net-new hours / week',
    definition: 'Net-new hours ÷ weeks to your exam session (from the questionnaire). Shown as a ±15% range.',
    source: 'Your questionnaire + overlap graph',
    status: 'Formula',
  },
  {
    name: 'Overlap band',
    definition: 'High overlap if the board already covers ≥55% of the AP’s total hours, Partial at 25–55%, None below 25%.',
    source: 'Atrium rule, v0',
    status: 'Formula',
  },
  {
    name: 'Load label',
    definition: 'Low ≤45 net-new hours, Low–mod ≤60, Moderate ≤80, High ≤110, Very high above that.',
    source: 'Atrium rule, v0',
    status: 'Formula',
  },
  {
    name: 'Recommended APs',
    definition: 'Cheapest first, but only APs whose signal (65% target-major relevance + 35% RIASEC fit) is at least 0.4. APs with no meaningful overlap are never auto-picked. Picked while the running weekly total fits your budget, up to 4, and never two alternatives (e.g. Calc AB and BC).',
    source: 'Atrium rule, v0',
    status: 'Formula',
  },
  {
    name: 'Weekly budget',
    definition: 'Extra hours you said you could give × your load factor.',
    source: 'Your questionnaire',
    status: 'Formula',
  },
  {
    name: 'Load factor',
    definition: '1 + 0.08 × (Conscientiousness − 3) − 0.06 × (Neuroticism − 3), bounded to 0.80–1.15. Temperament nudges the plan and never dominates it.',
    source: 'Big Five short form (IPIP), 1–5 scale',
    status: 'Formula',
  },
  {
    name: 'Weekly load ceiling (SG/US)',
    definition: 'min(35, 42 − 0.67 × committed hours) × load factor, and never below 12. Committed hours = training + other outside commitments.',
    source: 'Self-reported training & commitments',
    status: 'Formula',
  },
  {
    name: 'Hours per course level',
    definition: `Out-of-class study hours per week: ${Object.entries(LEVEL_HOURS).map(([k, v]) => `${k} ${v}`).join(', ')}. IB core (TOK, EE, CAS) adds ${IB_CORE_HOURS}.`,
    source: 'Atrium estimate, pending outcome data',
    status: 'Illustrative',
  },
  {
    name: 'Consult prices',
    definition: `India ${PRICE.india}; SG/US ${PRICE.sgus}. Platform take rate 20–25%. No payment is taken yet.`,
    source: 'Pricing proposal',
    status: 'Proposed',
  },
  {
    name: 'Mentor compensation',
    definition: '$28–$45/hr, set by the mentor after onboarding, plus a monthly stipend. 4–10 hrs/week.',
    source: 'Compensation proposal',
    status: 'Proposed',
  },
  {
    name: 'XP, levels, streaks, awards',
    definition: 'XP: onboarding 50, questionnaire 100, 1 per 3 minutes of logged study, 15 per plan unit ticked off, 40 per consult requested, 100 per consult completed, 150 per outcome reported, 30 for linking a parent, and 25 per award. Levels start at 0 / 150 / 400 / 750 / 1,200 / 1,800 / 2,600 / 3,600 XP. A streak is consecutive calendar days with logged study, counting from today or yesterday. The weekly goal is your plan’s net-new hours (India) or planned load (SG/US).',
    source: 'Your own activity, recomputed on every view',
    status: 'Formula',
  },
  {
    name: 'Users, mentors, outcomes',
    definition: 'We publish these counts only once they are real and we can source them. Right now there is nothing to publish.',
    source: '—',
    status: 'Real',
  },
];

const REMOVED = [
  '“2,400+ students mentored”',
  '“92% improved GPA”',
  '“48hr average match time”',
  '“We accept fewer than 9% of applicants”',
  '“240+ mentors” and “12+ mentors available” per subject',
  'Named-school “Trusted by” list',
  'Placeholder mentor roster, ratings and testimonials',
  '“Est. 2024” and “Inc.” until verified',
];

const STATUS_CLS: Record<Row['status'], string> = {
  Real: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Illustrative: 'bg-amber-50 text-amber-800 border-amber-200',
  Proposed: 'bg-slate-100 text-slate-700 border-line-2',
  Formula: 'bg-canvas text-ink border-line-2',
};

export function Methodology() {
  return (
    <PublicLayout>
      <PageIntro eyebrow={`Methodology · updated ${UPDATED}`} title="Every number, defined.">
        Every figure Atrium shows is listed here: what it means, where it comes from, and whether it is real,
        a formula, illustrative, or a proposal. If a number isn't on this page, it shouldn't be on the site.
      </PageIntro>

      <section className="border-b border-line">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <h2 className="font-serif text-ink text-display-sm mb-6">The numbers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px] min-w-[720px]">
              <thead>
                <tr className="text-left text-slate-500 border-b border-line-2">
                  <th className="py-2 pr-4 font-medium">Figure</th>
                  <th className="py-2 pr-4 font-medium">Definition</th>
                  <th className="py-2 pr-4 font-medium">Source</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {NUMBERS.map((r) => (
                  <tr key={r.name} className="border-b border-line align-top">
                    <td className="py-3 pr-4 text-ink font-medium w-48">{r.name}</td>
                    <td className="py-3 pr-4 text-slate-600 leading-relaxed">{r.definition}</td>
                    <td className="py-3 pr-4 text-slate-500 w-48">{r.source}</td>
                    <td className="py-3 w-28">
                      <span className={`text-[11px] font-medium border rounded-full px-2 py-0.5 ${STATUS_CLS[r.status]}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-canvas border-b border-line">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid lg:grid-cols-2 gap-14">
          <div>
            <h2 className="font-serif text-ink text-display-sm mb-4">The questionnaire</h2>
            <ul className="space-y-4 text-[14px] text-slate-600 leading-relaxed">
              <li><span className="text-ink font-medium">Temperament & load:</span> a 20-item Big Five short form in the style of the public-domain IPIP Mini-IPIP. Conscientiousness and Neuroticism set the load factor and pacing advice.</li>
              <li><span className="text-ink font-medium">Interest → direction:</span> 18 RIASEC / Holland activity items. They give the Holland code and the interest fit for each subject or AP.</li>
              <li><span className="text-ink font-medium">Targets & constraints:</span> target majors and colleges, existing commitments, available hours, weeks to exam and training hours.</li>
              <li>These are validated instrument families, not MBTI. The v1 item set is <span className="text-ink">pending expert vetting</span>.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-ink text-display-sm mb-4">The overlap graph</h2>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-4">
              A unit-by-unit map from each AP to the rationalised CBSE syllabus chapters that cover it. It is the
              core of the India plan. Version <span className="text-ink">{GRAPH_VERSION}</span>. Values are
              illustrative until the manual mapping pass is complete. After that, mentor annotations and reported
              outcomes will sharpen them.
            </p>
            <div className="border border-line rounded-sm divide-y divide-line">
              {MAPPED_COVERAGE.map((c) => (
                <div key={c.board + c.stream} className="grid grid-cols-3 px-4 py-2 text-[13px]">
                  <span className="text-ink">{c.board}</span>
                  <span className="text-slate-600">{c.stream}</span>
                  <span className="text-slate-500 text-right">{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid lg:grid-cols-2 gap-14">
          <div>
            <h2 className="font-serif text-ink text-display-sm mb-4">What we don't claim</h2>
            <ul className="space-y-2 text-[14px] text-slate-600 leading-relaxed list-disc pl-5">
              <li>Plans are guidance. They are not a score or admissions guarantee.</li>
              <li>No AI writes anything a student sees without a human checking it. There is no AI layer yet.</li>
              <li>No testimonials, ratings or outcome stats until they are real, consented and dated.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-ink text-display-sm mb-4">Removed from the site ({UPDATED})</h2>
            <ul className="space-y-1.5 text-[14px] text-slate-600">
              {REMOVED.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-400 mt-0.5">remove</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
