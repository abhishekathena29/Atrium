import { Link } from 'react-router-dom';

const PILLARS = [
  { icon: 'rule', color: 'bg-sky-100 text-sky-700', title: 'Every number is defined', body: 'Our methodology page explains how each figure is calculated. Anything not yet backed by data is labelled illustrative.', to: '/methodology', cta: 'Methodology' },
  { icon: 'shield_person', color: 'bg-leaf-100 text-leaf-700', title: 'Safeguarding first', body: 'Mentors are vetted and background-checked. Sessions stay on-platform, and under-18s need a guardian’s consent.', to: '/safeguarding', cta: 'Safeguarding' },
  { icon: 'handshake', color: 'bg-amber-100 text-amber-700', title: 'Honest about where we are', body: 'We’re new. No invented stats, testimonials or school logos. Just a planner you can check for yourself.', to: '/methodology', cta: 'What we removed' },
];

const FAQ = [
  { q: 'What is an AP, and why self-study one from India?', a: 'Advanced Placement (AP) exams are US college-level exams in individual subjects. Students from Indian boards often sit a few to show rigour to US universities. The trick is choosing ones that mostly overlap with what you already study.' },
  { q: 'Is the plan really free?', a: 'Yes. The questionnaire and plan are free. The first 20-minute mentor consult is free too. Longer paid consults are optional, and a parent approves them.' },
  { q: 'How is the plan calculated?', a: 'For India, each AP is mapped unit by unit to the CBSE syllabus, and we count only the new hours. For SG/US, subjects and levels are checked against a weekly ceiling built from your commitments. Every formula is on the methodology page.' },
  { q: 'Who are the mentors?', a: 'Students and recent graduates who took the same courses with strong results. Each one passes a subject screen, a teaching demo and safeguarding checks before meeting any student.' },
  { q: 'Does Atrium guarantee a score or an admission?', a: 'No. A plan is guidance to help you decide. It is not a score or admissions guarantee.' },
  { q: 'How do streaks and awards work?', a: 'You log study time and tick off plan units. Streaks count consecutive days with logged study. XP and awards come only from things you actually did, and the rules are published.' },
];

export function TrustFaq() {
  return (
    <section className="bg-paper">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid md:grid-cols-3 gap-5 mb-20">
          {PILLARS.map((p) => (
            <div key={p.title} className="bg-white rounded-3xl border border-line p-6 shadow-sm">
              <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${p.color}`}>
                <span className="material-symbols-outlined text-[26px]">{p.icon}</span>
              </span>
              <h3 className="font-jakarta font-bold text-ink text-[18px] mt-4">{p.title}</h3>
              <p className="text-[14px] text-slate-600 leading-relaxed mt-1.5">{p.body}</p>
              <Link to={p.to} className="mt-4 inline-flex items-center gap-1 text-[13.5px] font-semibold text-leaf-700 hover:text-leaf-800">
                {p.cta}
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="text-[13px] font-bold uppercase tracking-widest text-leaf-600">FAQ</p>
            <h2 className="font-jakarta font-extrabold text-ink text-[34px] leading-tight mt-3">Questions students and parents ask</h2>
            <p className="text-[14.5px] text-slate-600 mt-3">Something else? Ask in your free consult.</p>
          </div>
          <div className="lg:col-span-8 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group bg-white rounded-2xl border border-line px-5 py-4 open:shadow-card">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <span className="font-jakarta font-bold text-ink text-[15.5px]">{f.q}</span>
                  <span className="material-symbols-outlined text-slate-400 group-open:rotate-45 transition-transform">add</span>
                </summary>
                <p className="text-[14px] text-slate-600 leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
