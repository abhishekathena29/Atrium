import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const LINKS = [
  { to: '/india', label: 'India' },
  { to: '/sg-us', label: 'Singapore · US' },
  { to: '/#mentors', label: 'For Mentors' },
  { to: '/methodology', label: 'Methodology' },
];

export function TopNavBar() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-leaf-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </span>
          <span className="font-jakarta font-extrabold text-ink text-[20px] tracking-tight">Atrium</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((l) =>
            l.to.includes('#') ? (
              <a key={l.to} href={l.to} className="text-[14px] font-semibold text-slate-700 hover:text-leaf-700 transition-colors">
                {l.label}
              </a>
            ) : (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  'text-[14px] font-semibold transition-colors ' + (isActive ? 'text-leaf-700' : 'text-slate-700 hover:text-leaf-700')
                }
              >
                {l.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 bg-leaf-600 text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-full hover:bg-leaf-700 transition-colors"
            >
              Go to dashboard
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          ) : (
            <>
              <Link
                to="/signin"
                className="hidden sm:inline-flex text-[14px] font-semibold text-slate-700 hover:text-leaf-700 px-3 py-2 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 bg-leaf-600 text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-full hover:bg-leaf-700 transition-colors"
              >
                Get your free plan
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
