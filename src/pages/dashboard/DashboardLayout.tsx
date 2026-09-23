import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { SEGMENT_LABEL, type UserRole } from '../../auth/types';

interface NavItem {
  label: string;
  icon: string;
  to: string;
}

const NAV: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'Overview', icon: 'dashboard', to: '/dashboard' },
    { label: 'Profile & intake', icon: 'badge', to: '/onboarding' },
    { label: 'Questionnaire', icon: 'psychology', to: '/questionnaire' },
    { label: 'My plan', icon: 'route', to: '/plan' },
    { label: 'Progress & awards', icon: 'emoji_events', to: '/progress' },
    { label: 'Consults', icon: 'calendar_month', to: '/consults' },
    { label: 'Report outcome', icon: 'fact_check', to: '/outcomes' },
  ],
  parent: [{ label: 'Overview', icon: 'dashboard', to: '/dashboard' }],
  mentor: [
    { label: 'Overview', icon: 'dashboard', to: '/dashboard' },
    { label: 'Application & vetting', icon: 'verified_user', to: '/mentor/application' },
  ],
};

const ROLE_LABEL: Record<UserRole, string> = { student: 'Student', parent: 'Parent', mentor: 'Mentor' };

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;
  const items = NAV[user.role];

  function handleSignOut() {
    signOut();
    navigate('/');
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    'flex items-center gap-3 px-3 py-2 rounded-sm text-[13.5px] font-medium transition-colors ' +
    (isActive ? 'bg-ink text-paper' : 'text-slate-600 hover:bg-line/60 hover:text-ink');

  return (
    <div className="min-h-screen bg-paper text-ink flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-line bg-paper-2/40 p-5 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <span className="w-7 h-7 rounded-sm bg-ink flex items-center justify-center">
            <span className="font-serif text-paper text-[15px] leading-none mt-[2px]">A</span>
          </span>
          <span className="font-serif text-ink text-[20px] tracking-tight">Atrium</span>
        </Link>

        <span className="eyebrow text-slate-400 mb-1 px-2">{ROLE_LABEL[user.role]} workspace</span>
        <span className="text-[11.5px] text-slate-500 mb-3 px-2">{SEGMENT_LABEL[user.segment]}</span>

        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end className={linkClass}>
              <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 flex flex-col gap-1 text-[12.5px] px-3">
          <Link to="/safeguarding" className="text-slate-500 hover:text-ink">Safeguarding &amp; report a concern</Link>
          <Link to="/methodology" className="text-slate-500 hover:text-ink">Methodology</Link>
        </div>

        <div className="mt-auto pt-5 border-t border-line">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-bronze-100 flex items-center justify-center shrink-0">
              <span className="font-serif text-bronze-700 text-[15px]">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-ink truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-slate-600 hover:text-ink border border-line-2 rounded-sm py-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar + nav */}
        <header className="md:hidden border-b border-line bg-paper/90 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center justify-between px-5 h-14">
            <Link to="/" className="font-serif text-[18px]">Atrium</Link>
            <button onClick={handleSignOut} className="text-[12.5px] font-medium text-slate-600">
              Sign out
            </button>
          </div>
          {items.length > 1 && (
            <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    'shrink-0 text-[12.5px] font-medium px-3 py-1.5 rounded-sm ' +
                    (isActive ? 'bg-ink text-paper' : 'text-slate-600')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}
        </header>
        <main className="flex-1 px-5 sm:px-8 lg:px-12 py-8 lg:py-10 max-w-6xl w-full">{children}</main>
      </div>
    </div>
  );
}
