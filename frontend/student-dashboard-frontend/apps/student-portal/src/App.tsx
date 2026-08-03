import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { DashboardV2 } from './pages/Dashboard/DashboardV2';
import { Login } from './pages/Login/Login';
import { TrackBusPage } from './pages/TrackBus/TrackBus';
import { TripHistoryPage } from './pages/TripHistory/TripHistory';
import { ReportIssuePage } from './pages/ReportIssue/ReportIssue';
import { ProfilePage } from './pages/Profile/Profile';
import { studentApi } from './services/api/studentApi';

/**
 * ProtectedRoute component - redirects to login if not authenticated
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!studentApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      // Check if token exists
      if (studentApi.isAuthenticated()) {
        setIsReady(true);
      } else if (process.env.NODE_ENV === 'development') {
        // Auto-login with test credentials in development
        try {
          await studentApi.login('CTU1001@busflow.com', 'demo-password');
          console.log('Auto-logged in with test credentials');
        } catch (error) {
          console.error('Auto-login failed:', error);
        }
        setIsReady(true);
      } else {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardV2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/track-bus"
          element={
            <ProtectedRoute>
              <TrackBusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip-history"
          element={
            <ProtectedRoute>
              <TripHistoryPage />
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
