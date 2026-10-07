import { COVERAGE, GRAPH_VERSION, MAPPED_COVERAGE } from '../../data/overlapGraph';
import { IB_CORE_HOURS, LEVEL_HOURS } from '../../engine/courseLoad';
import { ADDON_HOURS, AP_INFO, AP_INFO_VERSION, DIFFICULTY_LABEL, HARD_AT } from '../../data/apInfo';
import { LEVELS, SETUP_XP } from '../../engine/gamification';
import { PRICE } from '../../data/pricing';
import { PageIntro, PublicLayout } from './PublicLayout';

const UPDATED = '2 Oct 2026';

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
    definition: 'Net-new hours ÷ weeks to your exam session (from your studies step). Shown as a ±15% range.',
    source: 'Your answers + overlap graph',
    status: 'Formula',
  },
  {
    name: 'Overlap band',
    definition: 'High overlap if the board already covers ≥55% of the AP’s total hours, Partial at 25-55%, None below 25%.',
    source: 'Atrium rule, v0',
    status: 'Formula',
  },
  {
    name: 'Load label',
    definition: 'Low ≤45 net-new hours, Low-mod ≤60, Moderate ≤80, High ≤110, Very high above that.',
    source: 'Atrium rule, v0',
    status: 'Formula',
  },
  {
    name: 'Recommended APs',
    definition: 'Cheapest first, but only APs whose signal (65% target-major relevance + 35% RIASEC fit) is at least 0.4. APs with no meaningful overlap are never auto-picked. Picked while the running weekly total fits your budget, up to your stretch limit, and never two alternatives (e.g. Calc AB and BC).',
    source: 'Atrium rule, v0',
    status: 'Formula',
  },
  {
    name: 'Weekly budget',
    definition: 'Extra hours you said you could give × your load factor × your workload factor.',
    source: 'Your answers',
    status: 'Formula',
  },
  {
    name: 'Workload factor',
    definition: '1 − 0.02 × (committed hours − 6), bounded to 0.60-1.00. Committed hours = coaching/tuition + activities. Each committed hour above 6 a week trims the AP budget by 2%.',
    source: 'Your answers',
    status: 'Formula',
  },
  {
    name: 'Stretch limit',
    definition: 'Up to 2 demanding APs (difficulty ' + HARD_AT + '+) and 4 in total. If Neuroticism ≥ 3.5 or Conscientiousness < 3, up to 1 demanding AP and 3 in total, so the plan stays sustainable. SG/US: demanding AP add-ons beyond the limit are left for a later cycle, and US high-school AP classes beyond it that aren’t core or rigor subjects for your major move to Honors.',
    source: 'Big Five short form (IPIP), 1-5 scale',
    status: 'Formula',
  },
  {
    name: 'AP difficulty (1-5)',
    definition: 'An editorial rating of breadth, depth and how much maths each exam leans on: ' + AP_INFO.map((a) => a.name.replace('AP ', '') + ' ' + a.difficulty).join(', ') + '. Labels: ' + Object.entries(DIFFICULTY_LABEL).map(([k, v]) => k + ' ' + v).join(', ') + '. Not taken from pass rates.',
    source: 'Atrium editorial, ' + AP_INFO_VERSION,
    status: 'Illustrative',
  },
  {
    name: 'AP add-on hours (IB / A-Level)',
    definition: 'Weekly self-study hours for an AP taken on top of IB or A-Levels, by difficulty: ' + Object.entries(ADDON_HOURS).map(([k, v]) => k + ' → ' + v).join(', ') + '. When your week is over the ceiling: add-ons unrelated to your major go first, then the lowest-value school subject moves down a level (never a core or rigor subject, and IB keeps 3+ HL, A-Level 3+ full A-Levels), then the remaining add-ons, lowest value first. Any add-on that fits again afterwards is put back.',
    source: 'Atrium estimate, pending outcome data',
    status: 'Illustrative',
  },
  {
    name: 'Load factor',
    definition: '1 + 0.08 × (Conscientiousness − 3) − 0.06 × (Neuroticism − 3), bounded to 0.80-1.15. Temperament nudges the plan and never dominates it.',
    source: 'Big Five short form (IPIP), 1-5 scale',
    status: 'Formula',
  },
  {
    name: 'Weekly load ceiling (SG/US)',
    definition: 'min(35, 42 − 0.67 × committed hours) × load factor, and never below 12. Committed hours = training + coaching/tuition + activities.',
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
    definition: `India ${PRICE.india}; SG/US ${PRICE.sgus}. Platform take rate 20-25%. No payment is taken yet.`,
    source: 'Pricing proposal',
    status: 'Proposed',
  },
  {
    name: 'Mentor compensation',
    definition: '$28-$45/hr, set by the mentor after onboarding, plus a monthly stipend. 4-10 hrs/week.',
    source: 'Compensation proposal',
    status: 'Proposed',
  },
  {
    name: 'XP, levels, streaks, awards',
    definition: `XP: personality questions ${SETUP_XP.personality}, interest questions ${SETUP_XP.interests}, your studies ${SETUP_XP.studies}, goals ${SETUP_XP.goals}, your week ${SETUP_XP.week}, whole profile complete ${SETUP_XP.complete}, 1 per 3 minutes of logged study, 15 per plan unit ticked off, 40 per consult requested, 100 per consult completed, 150 per outcome reported, 30 for linking a parent, and 25 per award. Levels: ${LEVELS.map((l) => `${l.name} ${l.min.toLocaleString('en-US')}`).join(' · ')} XP. A streak is consecutive calendar days with logged study, counting from today or yesterday. The weekly goal is your plan’s net-new hours (India) or planned load (SG/US).`,
    source: 'Your own activity, recomputed on every view',
    status: 'Formula',
  },
  {
    name: 'Profile completion %',
    definition: 'Share of the five setup sections you have saved: personality, interests, your studies, goals (majors + target countries) and your week. Dream universities and a linked parent are listed as optional and don’t count, so 100% matches the “whole profile complete” XP and the Mapmaker award.',
    source: 'Your saved answers',
    status: 'Formula',
  },
  {
    name: 'Time estimates',
    definition: 'About 6 minutes for the About-you questions (38 taps) and about 4 for your studies, so about 10 minutes in total. The plan itself is computed instantly. Rough estimates, not measured averages.',
    source: 'Atrium estimate',
    status: 'Illustrative',
  },
  {
    name: 'Users, mentors, outcomes',
    definition: 'We publish these counts only once they are real and we can source them. Right now there is nothing to publish.',
    source: 'Not applicable',
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
          <h2 className="font-jakarta font-bold text-ink text-[24px] mb-6">The numbers</h2>
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
            <h2 className="font-jakarta font-bold text-ink text-[24px] mb-4">The questions</h2>
            <ul className="space-y-4 text-[14px] text-slate-600 leading-relaxed">
              <li><span className="text-ink font-medium">About you, part 1 (temperament):</span> a 20-item Big Five short form in the style of the public-domain IPIP Mini-IPIP. Conscientiousness and Neuroticism set the load factor, the stretch limit and pacing advice. A few idioms carry a plain-English hint.</li>
              <li><span className="text-ink font-medium">About you, part 2 (interests):</span> 18 RIASEC / Holland activity items. They give the Holland code and the interest fit for each subject or AP.</li>
              <li><span className="text-ink font-medium">Your studies:</span> your base curriculum first (board, IB, A-Levels or a US high school), then APs as a separate add-on, then majors, target countries and universities, then coaching, activity and training hours.</li>
              <li><span className="text-ink font-medium">Target countries:</span> US and UK guidance is written separately and never blended. We never say a university requires an AP. We point you to each course&apos;s published entry requirements.</li>
              <li>These are validated instrument families, not MBTI. The v1 item set is <span className="text-ink">pending expert vetting</span>.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-jakarta font-bold text-ink text-[24px] mb-4">The overlap graph</h2>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-4">
              A unit-by-unit map from each AP to the rationalised CBSE syllabus chapters that cover it. It is the
              core of the India plan. Version <span className="text-ink">{GRAPH_VERSION}</span>. Values are
              illustrative until the manual mapping pass is complete. After that, mentor annotations and reported
              outcomes will sharpen them.
            </p>
            <div className="border border-line rounded-xl divide-y divide-line">
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
            <h2 className="font-jakarta font-bold text-ink text-[24px] mb-4">What we don't claim</h2>
            <ul className="space-y-2 text-[14px] text-slate-600 leading-relaxed list-disc pl-5">
              <li>Plans are guidance. They are not a score or admissions guarantee.</li>
              <li>The AI layer (“Ask Atrium” and the AI plan review) is always labelled AI-generated. It is given your rule-based plan and this page’s rules, may only pick from the plan’s candidate courses, and is told never to claim a university requires an AP. It can still be wrong. Check important decisions with a mentor.</li>
              <li>No testimonials, ratings or outcome stats until they are real, consented and dated.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-jakarta font-bold text-ink text-[24px] mb-4">Removed from the site ({UPDATED})</h2>
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
