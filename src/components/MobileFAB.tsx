import { Link } from 'react-router-dom';

export function MobileFAB() {
  return (
    <Link
      to="/signup?role=student"
      className="md:hidden fixed bottom-5 right-5 inline-flex items-center gap-2 bg-leaf-600 text-white text-[13.5px] font-semibold px-5 py-3 rounded-full shadow-elev z-50"
    >
      Get your free plan
      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
    </Link>
  );
}
