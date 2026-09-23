import { Link } from 'react-router-dom';

export function CtaBand() {
  return (
    <section id="cta" className="bg-paper pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-leaf-600 to-leaf-800 px-8 py-14 sm:px-14 text-white">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/10" />
          <div className="absolute right-24 -top-16 w-40 h-40 rounded-full bg-amber-300/20" />
          <div className="relative grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <h2 className="font-jakarta font-extrabold text-[32px] sm:text-[40px] leading-tight">
                Your plan is about 10 minutes away.
              </h2>
              <p className="text-[16px] text-leaf-100 mt-3 max-w-xl">
                Free plan, free first consult, and streaks to keep you going. Choose your courses knowing why.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
              <Link to="/signup?role=student" className="inline-flex items-center gap-2 bg-white text-leaf-800 text-[15px] font-bold rounded-full px-6 py-3.5 hover:bg-leaf-50 transition-colors">
                Get your free plan
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link to="/signup?role=mentor" className="inline-flex items-center gap-2 border-2 border-white/60 text-white text-[15px] font-semibold rounded-full px-6 py-3 hover:bg-white/10 transition-colors">
                Become a mentor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
