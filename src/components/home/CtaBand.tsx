import { Link } from 'react-router-dom';

export function CtaBand() {
  return (
    <section id="cta" className="bg-paper pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-hero-1 to-hero-2 ring-1 ring-leaf-300/40 px-8 py-14 sm:px-14 text-ink">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-leaf-400/10 blur-2xl animate-float-slow" aria-hidden />
          <div className="absolute right-24 -top-16 w-40 h-40 rounded-full bg-violet-500/20 blur-2xl animate-float" aria-hidden />
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <h2 className="font-jakarta font-extrabold text-[32px] sm:text-[40px] leading-tight">
                Your AP plan is about 10 minutes away.
              </h2>
              <p className="text-[16px] text-leaf-900 mt-3 max-w-xl">
                Free planner, every reason shown, streaks to keep you going.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
              <Link to="/signup?role=student" className="animate-glow inline-flex items-center gap-2 bg-leaf-600 text-white text-[15px] font-bold rounded-full px-6 py-3.5 hover:brightness-110 transition-colors">
                Start the free planner
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link to="/signup?role=mentor" className="inline-flex items-center gap-2 border-2 border-leaf-300 text-ink text-[15px] font-semibold rounded-full px-6 py-3 hover:bg-leaf-50 transition-colors">
                Become a mentor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
