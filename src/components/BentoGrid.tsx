const subjects = [
  {
    code: '01',
    title: 'Mathematics',
    courses: ['AP Calculus AB / BC', 'IB Math AA / AI HL', 'Linear Algebra', 'Multivariable'],
    icon: 'function',
  },
  {
    code: '02',
    title: 'Sciences',
    courses: ['AP Biology', 'AP Chemistry', 'AP Physics C', 'IB Sciences HL'],
    icon: 'science',
  },
  {
    code: '03',
    title: 'Humanities',
    courses: ['AP Literature', 'AP US / World History', 'IB History HL', 'Philosophy'],
    icon: 'history_edu',
  },
  {
    code: '04',
    title: 'Computer Science',
    courses: ['AP CS A', 'AP CS Principles', 'Data Structures', 'Intro to ML'],
    icon: 'terminal',
  },
  {
    code: '05',
    title: 'Languages',
    courses: ['AP Spanish', 'AP French', 'IB Mandarin', 'Latin'],
    icon: 'translate',
  },
  {
    code: '06',
    title: 'Economics & Business',
    courses: ['AP Micro / Macro', 'IB Business HL', 'Financial Modeling', 'Statistics'],
    icon: 'trending_up',
  },
];

export function BentoGrid() {
  return (
    <section id="subjects" className="bg-paper border-b border-line">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <p className="eyebrow text-bronze-600 mb-4">Coverage</p>
            <h2 className="font-serif text-ink text-display-lg lg:text-display-xl">
              Every course, mapped by someone who took it.
            </h2>
          </div>
          <p className="text-body text-slate-600 max-w-sm lg:text-right">
            From foundational high-school courses to advanced undergraduate
            seminars — find a mentor who can speak from recent, lived experience.
          </p>
        </div>

        <div className="divider-rule mb-12" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
          {subjects.map((s) => (
            <article
              key={s.code}
              className="bg-paper hover:bg-canvas transition-colors p-8 lg:p-10 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-8">
                <span className="eyebrow text-slate-400">{s.code} / 06</span>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-bronze-600 transition-colors text-[24px]">
                  {s.icon}
                </span>
              </div>

              <h3 className="font-serif text-ink text-display-sm mb-6">{s.title}</h3>

              <ul className="space-y-2.5">
                {s.courses.map((c) => (
                  <li key={c} className="flex items-center gap-3 text-[14px] text-slate-600">
                    <span className="w-1 h-1 rounded-full bg-bronze-400" />
                    {c}
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-line flex items-center justify-between">
                <p className="text-[12px] text-slate-500">12+ mentors available</p>
                <span className="material-symbols-outlined text-ink text-[18px] -translate-x-1 group-hover:translate-x-0 transition-transform">
                  arrow_forward
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
