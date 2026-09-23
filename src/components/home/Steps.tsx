const STEPS = [
  { icon: 'badge', color: 'bg-sky-100 text-sky-700', title: 'Tell us where you are', body: 'Board and stream, or curriculum and subjects. Your target majors. Training hours if you compete.' },
  { icon: 'psychology', color: 'bg-violet-100 text-violet-700', title: 'Take the questionnaire', body: 'Personality (how much load suits you), interests (which subjects fit) and constraints. It saves as you go.' },
  { icon: 'route', color: 'bg-leaf-100 text-leaf-700', title: 'Get your free plan', body: 'Every recommendation comes with its reasoning, so you can see why and not just what.' },
  { icon: 'forum', color: 'bg-amber-100 text-amber-700', title: 'Check it with a mentor', body: 'A free 20-minute consult with a vetted mentor who recently made the same choice.' },
  { icon: 'emoji_events', color: 'bg-rose-100 text-rose-700', title: 'Study, streak, report back', body: 'Log study, tick off units and earn awards. Report your result so the next plan is sharper.' },
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

        <ol className="relative grid md:grid-cols-5 gap-5">
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-sky-200 via-leaf-200 to-rose-200" aria-hidden />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative bg-white rounded-3xl border border-line p-5 shadow-sm text-center">
              <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center ${s.color} relative`}>
                <span className="material-symbols-outlined text-[30px]">{s.icon}</span>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-white text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
              </div>
              <h3 className="font-jakarta font-bold text-ink text-[16.5px] mt-4">{s.title}</h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed mt-1.5">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
