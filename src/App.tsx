import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/dashboard/Dashboard';
import { IndiaLanding } from './pages/public/IndiaLanding';
import { SgUsLanding } from './pages/public/SgUsLanding';
import { Methodology } from './pages/public/Methodology';
import { Safeguarding } from './pages/public/Safeguarding';
import { Onboarding } from './pages/student/Onboarding';
import { Questionnaire } from './pages/student/Questionnaire';
import { Plan } from './pages/student/Plan';
import { Consults } from './pages/student/Consults';
import { Outcomes } from './pages/student/Outcomes';
import { Progress } from './pages/student/Progress';
import { MentorApplication } from './pages/mentor/MentorApplication';

/** Scroll to `#hash` targets after client-side navigation, otherwise to the top. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollManager />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/india" element={<IndiaLanding />} />
          <Route path="/sg-us" element={<SgUsLanding />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/safeguarding" element={<Safeguarding />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute roles={['student']}><Onboarding /></ProtectedRoute>} />
          <Route path="/questionnaire" element={<ProtectedRoute roles={['student']}><Questionnaire /></ProtectedRoute>} />
          <Route path="/plan" element={<ProtectedRoute roles={['student']}><Plan /></ProtectedRoute>} />
          <Route path="/consults" element={<ProtectedRoute roles={['student']}><Consults /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute roles={['student']}><Progress /></ProtectedRoute>} />
          <Route path="/outcomes" element={<ProtectedRoute roles={['student']}><Outcomes /></ProtectedRoute>} />
          <Route path="/mentor/application" element={<ProtectedRoute roles={['mentor']}><MentorApplication /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
