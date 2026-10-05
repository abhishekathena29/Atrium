import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const LINKS = [
  { to: '/india', label: 'India' },
  { to: '/sg-us', label: 'Singapore · US' },
  { to: '/#mentors', label: 'For Mentors' },
  { to: '/methodology', label: 'Methodology' },
];

const pill =
  'inline-flex items-center gap-1.5 bg-leaf-600 text-white text-[13.5px] font-semibold px-3.5 sm:px-4 py-2.5 rounded-full hover:brightness-110 hover:shadow-glow transition-colors whitespace-nowrap';

export function TopNavBar() {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Close the mobile menu whenever the route (or hash) changes.
  const routeKey = location.pathname + location.hash;
  const [lastRoute, setLastRoute] = useState(routeKey);
  if (lastRoute !== routeKey) {
    setLastRoute(routeKey);
    setOpen(false);
  }

  // Close on Escape or a click outside the header while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const close = () => setOpen(false);

  const renderLink = (l: (typeof LINKS)[number], mobile: boolean) => {
    const base = mobile
      ? 'block rounded-2xl px-4 py-3 text-[15px] font-semibold transition-colors '
      : 'text-[14px] font-semibold transition-colors ';
    const idle = mobile ? 'text-slate-700 hover:bg-paper-2 hover:text-leaf-700' : 'text-slate-700 hover:text-leaf-700';
    return l.to.includes('#') ? (
      <a key={l.to} href={l.to} onClick={close} className={base + idle}>
        {l.label}
      </a>
    ) : (
      <NavLink
        key={l.to}
        to={l.to}
        onClick={close}
        className={({ isActive }) => base + (isActive ? 'text-leaf-700' : idle)}
      >
        {l.label}
      </NavLink>
    );
  };

  return (
    <header ref={headerRef} className="fixed top-0 inset-x-0 z-50 bg-paper/80 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-xl bg-leaf-600 flex items-center justify-center">
            <span aria-hidden="true" className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </span>
          <span className="font-jakarta font-extrabold text-ink text-[20px] tracking-tight">Atrium</span>
        </Link>

        <nav aria-label="Main" className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => renderLink(l, false))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {user ? (
            <Link to="/dashboard" className={pill}>
              <span className="sm:hidden">Dashboard</span>
              <span className="hidden sm:inline">Go to dashboard</span>
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          ) : (
            <>
              <Link
                to="/signin"
                className="hidden sm:inline-flex text-[14px] font-semibold text-slate-700 hover:text-leaf-700 px-3 py-2 transition-colors"
              >
                Sign in
              </Link>
              <Link to="/signup" className={pill}>
                <span className="sm:hidden">Free plan</span>
                <span className="hidden sm:inline">Get your free plan</span>
                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="md:hidden w-10 h-10 shrink-0 rounded-full border border-line bg-canvas text-ink flex items-center justify-center hover:border-leaf-300 transition-colors"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[22px]">{open ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      <div id="mobile-nav" hidden={!open} className="md:hidden border-t border-line bg-paper">
        <nav aria-label="Main mobile" className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-1">
          {LINKS.map((l) => renderLink(l, true))}
          {!user && (
            <Link
              to="/signin"
              onClick={close}
              className="sm:hidden block rounded-2xl px-4 py-3 text-[15px] font-semibold text-slate-700 hover:bg-paper-2 hover:text-leaf-700 transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
