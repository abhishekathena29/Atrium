import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import type { UserRole } from '../../auth/types';

interface NavItem {
  label: string;
  icon: string;
}

const NAV: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'Overview', icon: 'dashboard' },
    { label: 'My mentors', icon: 'groups' },
    { label: 'Sessions', icon: 'calendar_month' },
    { label: 'Find a mentor', icon: 'search' },
    { label: 'Messages', icon: 'forum' },
  ],
  mentor: [
    { label: 'Overview', icon: 'dashboard' },
    { label: 'My mentees', icon: 'groups' },
    { label: 'Sessions', icon: 'calendar_month' },
    { label: 'Requests', icon: 'inbox' },
    { label: 'Messages', icon: 'forum' },
  ],
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('Overview');

  if (!user) return null;
  const items = NAV[user.role];

  function handleSignOut() {
    signOut();
    navigate('/');
  }

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

        <span className="eyebrow text-slate-400 mb-3 px-2">
          {user.role === 'mentor' ? 'Mentor' : 'Student'} workspace
        </span>

        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive = item.label === active;
            return (
              <button
                key={item.label}
                onClick={() => setActive(item.label)}
                className={
                  'flex items-center gap-3 px-3 py-2 rounded-sm text-[13.5px] font-medium transition-colors text-left ' +
                  (isActive
                    ? 'bg-ink text-paper'
                    : 'text-slate-600 hover:bg-line/60 hover:text-ink')
                }
              >
                <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

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
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between border-b border-line px-5 h-14 bg-paper/90 backdrop-blur-md sticky top-0 z-40">
          <Link to="/" className="font-serif text-[18px]">Atrium</Link>
          <button onClick={handleSignOut} className="text-[12.5px] font-medium text-slate-600">
            Sign out
          </button>
        </header>
        <main className="flex-1 px-5 sm:px-8 lg:px-12 py-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
