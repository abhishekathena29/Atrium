import { Link } from 'react-router-dom';

const MENTOR_STEPS = ['Apply', 'Subject screen', 'Teaching demo', 'Safeguarding checks', 'Matched'];

export function Community() {
  return (
    <section id="mentors" className="bg-white border-y border-line">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid lg:grid-cols-2 gap-6">
        {/* Parents */}
        <article className="rounded-3xl bg-amber-50 border border-amber-100 p-8 flex flex-col">
          <span className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">family_restroom</span>
          </span>
          <p className="text-[13px] font-bold uppercase tracking-widest text-amber-700 mt-5">For parents</p>
          <h3 className="font-jakarta font-extrabold text-ink text-[28px] leading-tight mt-2">See the plan in plain language</h3>
          <ul className="mt-5 space-y-3 text-[14.5px] text-slate-700 flex-1">
            <li className="flex gap-2.5"><span className="material-symbols-outlined text-amber-600 text-[20px]">visibility</span>Your child invites you with a code, and you see their plan and the reasons behind it</li>
            <li className="flex gap-2.5"><span className="material-symbols-outlined text-amber-600 text-[20px]">verified</span>You approve and pay for any paid consult. Nothing happens without you</li>
            <li className="flex gap-2.5"><span className="material-symbols-outlined text-amber-600 text-[20px]">insights</span>Follow their streak, awards and outcomes as they go</li>
          </ul>
          <Link to="/signup?role=parent" className="mt-7 self-start inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-[14px] font-semibold rounded-full px-5 py-3 transition-colors">
            Join as a parent
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </article>

        {/* Mentors */}
        <article className="rounded-3xl bg-ink text-paper p-8 flex flex-col relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-leaf-600/30 blur-2xl" />
          <span className="relative w-12 h-12 rounded-2xl bg-white/10 text-leaf-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">volunteer_activism</span>
          </span>
          <p className="relative text-[13px] font-bold uppercase tracking-widest text-leaf-300 mt-5">For mentors · founding cohort</p>
          <h3 className="relative font-jakarta font-extrabold text-[28px] leading-tight mt-2">Teach what you just learned</h3>
          <p className="relative text-[14.5px] text-slate-300 mt-3 leading-relaxed">
            You might be a CBSE student who self-studied APs, or an athlete who carried IB through competition. We're
            recruiting our first mentors one at a time. Proposed: $28–$45/hr at a rate you set, for 4–10 hrs a week.
          </p>
          <ol className="relative mt-6 flex flex-wrap items-center gap-2 flex-1 content-start">
            {MENTOR_STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span className="text-[12.5px] font-medium bg-white/10 rounded-full px-3 py-1.5">{i + 1}. {s}</span>
                {i < MENTOR_STEPS.length - 1 && <span className="material-symbols-outlined text-[16px] text-slate-500">chevron_right</span>}
              </li>
            ))}
          </ol>
          <Link to="/signup?role=mentor" className="relative mt-7 self-start inline-flex items-center gap-2 bg-white text-ink text-[14px] font-semibold rounded-full px-5 py-3 hover:bg-paper-2 transition-colors">
            Apply to mentor
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </article>
      </div>
    </section>
  );
}
