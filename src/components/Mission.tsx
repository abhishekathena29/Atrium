const benefits = [
  {
    n: '01',
    title: 'A second opinion before you commit.',
    body: 'Before locking in an AP load or IB pathway, talk through the trade-offs with a mentor who took the same combination two or three years ago.',
  },
  {
    n: '02',
    title: 'Real syllabi, problem sets, and notes.',
    body: 'Your mentor brings the materials that actually worked — practice exams, condensed notes, FRQ frameworks — instead of generic resources.',
  },
  {
    n: '03',
    title: 'A semester-long plan, not a one-off tutoring call.',
    body: 'Structured roadmaps for the term: pacing, checkpoints, exam strategy, and the moments when most students slip.',
  },
];

export function Mission() {
  return (
    <section id="mentees" className="bg-canvas border-b border-line">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-5">
            <p className="eyebrow text-bronze-600 mb-4">For Students</p>
            <h2 className="font-serif text-ink text-display-lg leading-tight">
              The guidance you wish you had{' '}
              <span className="italic text-bronze-600">before</span> picking your courses.
            </h2>
            <p className="mt-8 text-body text-slate-600 leading-relaxed">
              Course selection is one of the most consequential decisions of your
              high-school years, and most students make it with incomplete
              information. Atrium replaces that guesswork with direct conversations
              and structured support from mentors who recently sat where you sit.
            </p>

            <div className="mt-10 flex items-center gap-6">
              <a
                href="#cta"
                className="inline-flex items-center gap-2 bg-ink text-paper text-[14px] font-medium px-6 py-3.5 rounded-sm hover:bg-ink-soft transition-colors"
              >
                Book a free 20-min consult
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
            </div>

            <div className="mt-12 pt-8 border-t border-line">
              <p className="eyebrow text-slate-500 mb-3">Trusted by students at</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-slate-600 font-medium">
                <span>Stuyvesant</span>
                <span>·</span>
                <span>Phillips Exeter</span>
                <span>·</span>
                <span>UWC</span>
                <span>·</span>
                <span>BASIS</span>
                <span>·</span>
                <span>Sevenoaks</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-12">
            {benefits.map((b, i) => (
              <div key={b.n} className="flex gap-8 items-start">
                <div className="font-serif text-bronze-500 text-[40px] leading-none mt-1 w-14 shrink-0">
                  {b.n}
                </div>
                <div className={i !== benefits.length - 1 ? 'border-b border-line pb-12 flex-1' : 'flex-1'}>
                  <h3 className="font-serif text-ink text-display-sm mb-3 leading-tight">
                    {b.title}
                  </h3>
                  <p className="text-body text-slate-600 leading-relaxed">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
