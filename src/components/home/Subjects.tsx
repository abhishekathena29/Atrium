const SUBJECTS = [
  { title: 'Mathematics', icon: 'function', color: 'bg-sky-100 text-sky-700', courses: ['AP Calculus AB / BC', 'AP Statistics', 'IB Math AA / AI', 'A-Level Further Maths'] },
  { title: 'Sciences', icon: 'science', color: 'bg-leaf-100 text-leaf-700', courses: ['AP Physics 1 / C', 'AP Chemistry', 'AP Biology', 'IB Sciences HL'] },
  { title: 'Computer Science', icon: 'terminal', color: 'bg-violet-100 text-violet-700', courses: ['AP CS A', 'IB Computer Science', 'A-Level Computing'] },
  { title: 'Economics & Business', icon: 'trending_up', color: 'bg-amber-100 text-amber-700', courses: ['AP Micro / Macro', 'IB Economics HL', 'IB Business'] },
  { title: 'Humanities', icon: 'history_edu', color: 'bg-rose-100 text-rose-700', courses: ['AP US History', 'AP Psychology', 'IB History HL'] },
  { title: 'Languages & English', icon: 'translate', color: 'bg-teal-100 text-teal-700', courses: ['AP English Language', 'IB English A', 'IB Language B'] },
];

export function Subjects() {
  return (
    <section id="subjects" className="bg-paper">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-widest text-leaf-600">Subjects</p>
            <h2 className="font-jakarta font-extrabold text-ink text-[34px] sm:text-[40px] leading-tight mt-3">
              Courses students weigh up most
            </h2>
          </div>
          <p className="text-[14.5px] text-slate-600 max-w-md">
            The planner covers these subject areas. Mentors are matched from your plan, and we're recruiting
            founding mentors in each.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUBJECTS.map((s) => (
            <article key={s.title} className="bg-white rounded-3xl border border-line p-6 shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined text-[26px]">{s.icon}</span>
              </div>
              <h3 className="font-jakarta font-bold text-ink text-[19px] mt-4">{s.title}</h3>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {s.courses.map((c) => (
                  <span key={c} className="text-[12px] text-slate-700 bg-slate-50 border border-line rounded-full px-2.5 py-1">{c}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
