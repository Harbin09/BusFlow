import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { DashboardStitch } from './pages/Dashboard/DashboardStitch';
import { TrackBusStitch } from './pages/TrackBus/TrackBusStitch';
import { SchedulesStitch } from './pages/TripHistory/SchedulesStitch';
import { StopsStitch } from './pages/Stops/StopsStitch';
import { ReportIssuePage } from './pages/ReportIssue/ReportIssue';
import { ProfilePage } from './pages/Profile/Profile';
import { NotificationHistory } from './pages/Dashboard/components/NotificationHistory';
import { Alerts } from './pages/Alerts/Alerts';
import { Login } from './pages/Login/Login';
import { NotificationToast } from './components/NotificationToast';

// Simple helper to check if token exists in localStorage
const hasToken = (): boolean => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('studentToken');
  return !!token;
};

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!hasToken()) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  console.log('✅ Authenticated, showing protected route');
  return <>{children}</>;
};

function App() {
  const [authState, setAuthState] = useState(hasToken());

  // Listen for storage changes from login
  React.useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 Storage changed, updating auth state');
      setAuthState(hasToken());
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for a custom auth event
    window.addEventListener('authUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authUpdated', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <NotificationToast />
      <Routes>
        <Route
          path="/login"
          element={<Login onLoginSuccess={() => setAuthState(true)} />}
        />

        <Route
          path="/"
          element={
            authState && hasToken() ? (
              <DashboardStitch />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardStitch />
            </ProtectedRoute>
          }
        />

        <Route
          path="/track-bus"
          element={
            <ProtectedRoute>
              <TrackBusStitch />
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedules"
          element={
            <ProtectedRoute>
              <SchedulesStitch />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stops"
          element={
            <ProtectedRoute>
              <StopsStitch />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report-issue"
          element={
            <ProtectedRoute>
              <ReportIssuePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={authState && hasToken() ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
