type Mentor = {
  name: string;
  school: string;
  major: string;
  teaches: string[];
  rate: string;
  image: string;
  quote: string;
};

const mentors: Mentor[] = [
  {
    name: 'Priya Sundaram',
    school: 'MIT, Class of 2026',
    major: 'Mathematics & Computer Science',
    teaches: ['AP Calc BC', 'AP CS A', 'Linear Algebra'],
    rate: '$38 / hr',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    quote:
      'I plan with each student around the actual AP rubric — not vague "study harder" advice.',
  },
  {
    name: 'Marcus Allen',
    school: 'Yale, Class of 2025',
    major: 'History & Political Science',
    teaches: ['AP US History', 'AP Lit', 'IB History HL'],
    rate: '$34 / hr',
    image:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=80',
    quote:
      'Document-based questions broke me in 11th grade. I now teach the exact framework that fixed it.',
  },
  {
    name: 'Hana Okafor',
    school: 'Oxford, Class of 2025',
    major: 'PPE (Philosophy, Politics, Economics)',
    teaches: ['AP Macro / Micro', 'IB Economics HL', 'Stats'],
    rate: '$42 / hr',
    image:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    quote:
      "We'll work backwards from where you want to apply, then design a course load that fits.",
  },
  {
    name: 'Daniel Kim',
    school: 'Stanford, Class of 2026',
    major: 'Bioengineering',
    teaches: ['AP Bio', 'AP Chem', 'AP Physics C'],
    rate: '$36 / hr',
    image:
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
    quote:
      'Most students over-study content and under-study test mechanics. I rebalance that.',
  },
];

export function FeaturedMentors() {
  return (
    <section className="bg-paper border-b border-line">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <p className="eyebrow text-bronze-600 mb-4">Mentor Roster</p>
            <h2 className="font-serif text-ink text-display-lg lg:text-display-xl">
              Vetted. Recent. Specific.
            </h2>
          </div>
          <p className="text-body text-slate-600 max-w-sm lg:text-right">
            Every mentor on Atrium passes a two-stage subject and teaching review.
            We accept fewer than 9% of applicants.
          </p>
        </div>

        <div className="divider-rule mb-12" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {mentors.map((m) => (
            <article key={m.name} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-paper-2">
                <img
                  src={m.image}
                  alt={m.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute top-3 right-3 bg-paper/90 backdrop-blur-sm text-ink text-[11px] font-medium px-2.5 py-1 rounded-sm">
                  {m.rate}
                </div>
              </div>

              <div className="mt-5">
                <h3 className="font-serif text-ink text-[22px] leading-tight">{m.name}</h3>
                <p className="text-[12.5px] text-slate-500 mt-1">{m.school}</p>
                <p className="text-[12.5px] text-slate-500">{m.major}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {m.teaches.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] text-slate-700 border border-line bg-canvas px-2 py-1 rounded-sm"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <p className="mt-5 text-[13px] text-slate-600 leading-relaxed italic border-l border-bronze-300 pl-3">
                  "{m.quote}"
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-[14px] font-medium text-ink border-b border-ink/40 hover:border-ink pb-1 transition-colors"
          >
            Browse all 240+ mentors
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>
      </div>
    </section>
  );
}
