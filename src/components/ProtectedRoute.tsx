import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import type { UserRole } from '../auth/types';
import { DashboardLayout } from '../pages/dashboard/DashboardLayout';
import { FocusLayout } from './FocusLayout';

/**
 * Requires a signed-in user and, optionally, one of `roles` (enforces the blueprint's
 * access matrix). Renders inside the dashboard shell, or the focused first-run shell when
 * `focusStep` is given.
 */
export function ProtectedRoute({ children, roles, focusStep }: { children: ReactNode; roles?: UserRole[]; focusStep?: number }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <span className="text-[13px] text-slate-400">Loading…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (focusStep !== undefined) return <FocusLayout step={focusStep}>{children}</FocusLayout>;
  return <DashboardLayout>{children}</DashboardLayout>;
}
