import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { SEGMENT_LABEL, type UserRole } from '../../auth/types';
import { Logo } from '../../components/Logo';
import { getStudentState } from '../../engine/studentState';

interface NavItem {
  label: string;
  icon: string;
  to: string;
}

const NAV: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'Home', icon: 'home', to: '/dashboard' },
    { label: 'My plan', icon: 'route', to: '/plan' },
    { label: 'Progress & awards', icon: 'emoji_events', to: '/progress' },
    { label: 'Ask Atrium', icon: 'auto_awesome', to: '/coach' },
    { label: 'Consults', icon: 'forum', to: '/consults' },
    { label: 'Report outcome', icon: 'fact_check', to: '/outcomes' },
    { label: 'Profile', icon: 'person', to: '/onboarding' },
  ],
  parent: [{ label: 'Home', icon: 'home', to: '/dashboard' }],
  mentor: [
    { label: 'Home', icon: 'home', to: '/dashboard' },
    { label: 'Application', icon: 'verified_user', to: '/mentor/application' },
  ],
};

const ROLE_LABEL: Record<UserRole, string> = { student: 'Student', parent: 'Parent', mentor: 'Mentor' };

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;
  const items = NAV[user.role];
  const setup = user.role === 'student' ? getStudentState(user) : null;
  const setupDone = setup ? [setup.quizDone, setup.intakeDone].filter(Boolean).length : 2;

  function handleSignOut() {
    signOut();
    navigate('/');
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-colors ' +
    (isActive ? 'bg-leaf-50 text-leaf-700' : 'text-slate-600 hover:bg-slate-50 hover:text-ink');

  return (
    <div className="min-h-screen bg-paper text-ink flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-line bg-canvas px-4 py-6 sticky top-0 h-screen">
        <div className="px-2 mb-8">
          <Logo to="/dashboard" />
        </div>

        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end className={linkClass}>
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {setup && setupDone < 2 && (
          <Link
            to="/welcome"
            className="mt-6 mx-1 rounded-2xl bg-leaf-50 border border-leaf-100 p-4 block hover:border-leaf-300 transition-colors"
          >
            <p className="text-[12.5px] font-bold text-leaf-800">Finish setting up</p>
            <div className="h-1.5 rounded-full bg-canvas mt-2 overflow-hidden">
              <div className="h-full bg-leaf-500 rounded-full" style={{ width: `${(setupDone / 2) * 100}%` }} />
            </div>
            <p className="text-[12px] text-leaf-700 mt-2">{setupDone} of 2 done · continue →</p>
          </Link>
        )}

        <div className="mt-auto pt-5 border-t border-line">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-leaf-100 flex items-center justify-center shrink-0">
              <span className="font-jakarta font-bold text-leaf-700 text-[14px]">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold text-ink truncate">{user.name}</p>
              <p className="text-[11.5px] text-slate-500 truncate">{ROLE_LABEL[user.role]} · {SEGMENT_LABEL[user.segment]}</p>
            </div>
            <button onClick={handleSignOut} title="Sign out" className="text-slate-400 hover:text-ink">
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
          <div className="flex gap-3 px-2 mt-4 text-[11.5px]">
            <Link to="/safeguarding" className="text-slate-400 hover:text-ink">Safeguarding</Link>
            <Link to="/methodology" className="text-slate-400 hover:text-ink">Methodology</Link>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col overflow-x-clip">
        <header className="md:hidden border-b border-line bg-paper/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center justify-between px-5 h-14">
            <Logo to="/dashboard" />
            <button onClick={handleSignOut} className="text-[13px] font-semibold text-slate-600">Sign out</button>
          </div>
          {items.length > 1 && (
            <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    'shrink-0 text-[13px] font-semibold px-3 py-1.5 rounded-full ' +
                    (isActive ? 'bg-leaf-600 text-white' : 'text-slate-600')
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
