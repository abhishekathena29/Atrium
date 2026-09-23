import { useAuth } from '../../auth/AuthContext';
import { StudentDashboard } from './StudentDashboard';
import { MentorDashboard } from './MentorDashboard';
import { ParentDashboard } from './ParentDashboard';

export function Dashboard() {
  const { user } = useAuth();
  if (!user) return null; // guarded by ProtectedRoute

  if (user.role === 'mentor') return <MentorDashboard user={user} />;
  if (user.role === 'parent') return <ParentDashboard user={user} />;
  return <StudentDashboard user={user} />;
}
