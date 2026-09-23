import { Link } from 'react-router-dom';

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-leaf-50 via-paper to-paper">
      {/* soft decorative shapes */}
      <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-leaf-100/70 blur-3xl pointer-events-none" />
      <div className="absolute top-40 -left-32 w-[360px] h-[360px] rounded-full bg-amber-100/60 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6">
          <h1 className="font-jakarta font-extrabold text-ink text-[42px] sm:text-[54px] lg:text-[60px] leading-[1.05] tracking-tight">
            Pick the right courses.{' '}
            <span className="relative inline-block text-leaf-600">
              Study smarter
              <svg className="absolute left-0 -bottom-2 w-full" height="12" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden>
                <path d="M2 9 C 50 2, 150 2, 198 8" stroke="#F2B544" strokeWidth="5" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            , not more.
          </h1>

          <p className="mt-6 text-[17px] text-slate-600 leading-relaxed max-w-xl">
            Tell us what you already study and where you're aiming. You get a free, reasoned plan: which APs to
            self-study, or which course load to carry. A mentor who recently made the same choice can then check it
            with you.
          </p>

          <p className="mt-8 text-[13px] font-semibold text-slate-700">Where are you studying?</p>
          <div className="mt-3 grid sm:grid-cols-2 gap-3 max-w-xl">
            <Link
              to="/signup?role=student&segment=india"
              className="group flex items-center gap-3 bg-white border-2 border-leaf-200 hover:border-leaf-500 rounded-2xl p-4 shadow-sm transition-colors"
            >
              <span className="w-11 h-11 rounded-xl bg-leaf-100 text-leaf-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">menu_book</span>
              </span>
              <span className="flex-1">
                <span className="block font-jakarta font-bold text-ink text-[15.5px]">India</span>
                <span className="block text-[12.5px] text-slate-500">APs on top of your boards</span>
              </span>
              <span className="material-symbols-outlined text-leaf-600 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            <Link
              to="/signup?role=student&segment=sgus"
              className="group flex items-center gap-3 bg-white border-2 border-sky-200 hover:border-sky-500 rounded-2xl p-4 shadow-sm transition-colors"
            >
              <span className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">public</span>
              </span>
              <span className="flex-1">
                <span className="block font-jakarta font-bold text-ink text-[15.5px]">Singapore · US</span>
                <span className="block text-[12.5px] text-slate-500">IB, A-Level or AP load</span>
              </span>
              <span className="material-symbols-outlined text-sky-600 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Visual: photo + floating product previews */}
        <div className="lg:col-span-6 relative">
          <div className="relative mx-auto max-w-[520px]">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] bg-leaf-200" />
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80"
              alt="Students studying together at a table"
              className="relative w-full aspect-[4/4.2] object-cover rounded-[2rem] shadow-elev"
            />

            <div className="absolute -left-4 sm:-left-10 top-8 bg-white rounded-2xl shadow-elev p-4 w-60 border border-line">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">Sample plan</p>
              <p className="font-jakarta font-bold text-ink text-[15px] mt-1">AP Calculus AB</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-2 py-0.5">High overlap</span>
                <span className="text-[11.5px] text-slate-500">~1.4 hrs/wk</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className="h-full w-2/3 rounded-full bg-emerald-500" /></div>
              <p className="text-[11px] text-slate-500 mt-1.5">Most of it is already on your Class 11–12 maths syllabus</p>
            </div>

            <div className="absolute -right-3 sm:-right-8 top-1/2 bg-white rounded-2xl shadow-elev px-4 py-3 border border-line flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </span>
              <div>
                <p className="font-jakarta font-extrabold text-ink text-[18px] leading-none">5 days</p>
                <p className="text-[11px] text-slate-500 mt-0.5">study streak</p>
              </div>
            </div>

            <div className="absolute left-6 -bottom-6 bg-white rounded-2xl shadow-elev px-4 py-3 border border-line flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-violet-100 ring-4 ring-violet-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-violet-700 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
              </span>
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">Award unlocked</p>
                <p className="font-jakarta font-bold text-ink text-[14px]">Gap closer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
