const offerings = [
  {
    label: 'Flexible hours',
    value: '4–10 hrs / week',
    detail: 'You set availability around exams, classes, and clubs.',
  },
  {
    label: 'Compensation',
    value: '$28–$45 / hr',
    detail: 'Set your own rate after completing the mentor onboarding.',
  },
  {
    label: 'Cohort support',
    value: 'Monthly stipend',
    detail: 'Materials budget, training stipend, and peer review circles.',
  },
];

const criteria = [
  'Currently attending or recently graduated from a top-tier university',
  'Strong subject-matter results (5s on relevant APs, 7s on IB HLs, or equivalent)',
  'Two-stage interview: subject screen + teaching demo',
  'Ongoing review of mentee outcomes and session feedback',
];

export function ForMentors() {
  return (
    <section id="mentors" className="bg-ink text-paper relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(rgba(247,244,238,1) 1px, transparent 1px)', backgroundSize: '4px 4px' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32 relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-5">
            <p className="eyebrow text-bronze-300 mb-4">For Mentors</p>
            <h2 className="font-serif text-paper text-display-lg leading-tight">
              Teach what you{' '}
              <span className="italic text-bronze-200">just learned</span>.
            </h2>
            <p className="mt-8 text-body text-slate-300 leading-relaxed">
              Atrium is built around the idea that the best academic guidance
              comes from people who took the course recently — not professional
              tutors who haven't sat for an exam in a decade. If that's you, we'd
              like you to apply.
            </p>

            <a
              href="#cta"
              className="mt-10 inline-flex items-center gap-2 bg-paper text-ink text-[14px] font-medium px-6 py-3.5 rounded-sm hover:bg-paper-2 transition-colors"
            >
              Apply to mentor
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>

            <div className="mt-12 pt-8 border-t border-slate-700">
              <p className="eyebrow text-slate-400 mb-4">Selection</p>
              <ul className="space-y-3">
                {criteria.map((c, i) => (
                  <li key={i} className="flex gap-3 text-[14px] text-slate-300 leading-relaxed">
                    <span className="font-serif text-bronze-300 mt-px shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="border border-slate-700 rounded-sm">
              {offerings.map((o, i) => (
                <div
                  key={o.label}
                  className={`p-8 lg:p-10 grid grid-cols-12 gap-6 items-baseline ${
                    i !== offerings.length - 1 ? 'border-b border-slate-700' : ''
                  }`}
                >
                  <p className="eyebrow text-slate-400 col-span-12 md:col-span-3">{o.label}</p>
                  <p className="font-serif text-paper text-display-md col-span-12 md:col-span-4 leading-none">
                    {o.value}
                  </p>
                  <p className="text-[14px] text-slate-300 col-span-12 md:col-span-5 leading-relaxed">
                    {o.detail}
                  </p>
                </div>
              ))}
            </div>

            <div id="how" className="mt-12 grid sm:grid-cols-3 gap-6">
              {[
                { n: '01', t: 'Apply', d: 'Submit transcript & subject preferences.' },
                { n: '02', t: 'Interview', d: 'Subject screen + 20-min teaching demo.' },
                { n: '03', t: 'Onboard', d: 'Training cohort, then your first match.' },
              ].map((s) => (
                <div key={s.n} className="border-t border-slate-700 pt-5">
                  <p className="font-serif text-bronze-300 text-[15px] mb-3">{s.n}</p>
                  <p className="font-serif text-paper text-[20px] mb-2">{s.t}</p>
                  <p className="text-[13px] text-slate-400 leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
