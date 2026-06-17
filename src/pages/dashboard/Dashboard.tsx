import { useAuth } from '../../auth/AuthContext';
import { DashboardLayout } from './DashboardLayout';
import { StudentDashboard } from './StudentDashboard';
import { MentorDashboard } from './MentorDashboard';

export function Dashboard() {
  const { user } = useAuth();
  if (!user) return null; // guarded by ProtectedRoute

  return (
    <DashboardLayout>
      {user.role === 'mentor' ? (
        <MentorDashboard user={user} />
      ) : (
        <StudentDashboard user={user} />
      )}
    </DashboardLayout>
  );
}
