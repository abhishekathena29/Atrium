const STEPS = [
  {
    icon: 'psychology',
    color: 'bg-violet-100 text-violet-700',
    title: 'About you',
    body: 'Quick questions on your personality and your interests: how you like to work and what you enjoy, so the plan fits you.',
    tags: ['~6 min', 'Saves as you go'],
  },
  {
    icon: 'menu_book',
    color: 'bg-sky-100 text-sky-700',
    title: 'Your studies',
    body: 'Your base curriculum first, then APs as an add-on. Where you’re aiming, and how busy your week is.',
    tags: ['~4 min', 'CBSE · IB · A-Levels · US', 'US / UK', 'Weekly hours'],
  },
  {
    icon: 'route',
    color: 'bg-leaf-100 text-leaf-700',
    title: 'Your plan',
    body: 'Which APs, how many, how hard each one is, and why. Free.',
    tags: ['Instant', 'Which', 'How many', 'Difficulty', 'Why'],
  },
  {
    icon: 'forum',
    color: 'bg-amber-100 text-amber-700',
    title: 'Go deeper (optional)',
    body: 'Ask AI follow-up questions, or book a mentor for premium, deeper guidance after your free plan.',
    tags: ['AI follow-ups', 'Mentor check'],
  },
];

export function Steps() {
  return (
    <section id="how" className="bg-paper">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-[13px] font-bold uppercase tracking-widest text-leaf-600">How it works</p>
          <h2 className="font-jakarta font-extrabold text-ink text-[34px] sm:text-[40px] leading-tight mt-3">
            From “what should I take?” to a plan you trust
          </h2>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-violet-200 via-leaf-200 to-amber-200" aria-hidden="true" />
          <ol className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
            {STEPS.map((s, i) => (
              <li key={s.title} className="lift relative bg-canvas rounded-3xl border border-line p-6 shadow-sm text-center flex flex-col">
                <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center ${s.color} relative`}>
                  <span aria-hidden="true" className="material-symbols-outlined text-[30px]">{s.icon}</span>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-leaf-600 text-white text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
                </div>
                <h3 className="font-jakarta font-bold text-ink text-[17px] mt-4">{s.title}</h3>
                <p className="text-[13.5px] text-slate-600 leading-relaxed mt-1.5 flex-1">{s.body}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {s.tags.map((t) => (
                    <span key={t} className="text-[11.5px] font-medium text-slate-700 bg-slate-50 border border-line rounded-full px-2.5 py-1">{t}</span>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
