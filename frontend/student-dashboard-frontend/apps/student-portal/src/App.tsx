import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { DashboardStitch } from './pages/Dashboard/DashboardStitch';
import { Login } from './pages/Login/Login';
import { TrackBusStitch } from './pages/TrackBus/TrackBusStitch';
import { SchedulesStitch } from './pages/TripHistory/SchedulesStitch';
import { StopsStitch } from './pages/Stops/StopsStitch';
import { ReportIssuePage } from './pages/ReportIssue/ReportIssue';
import { ProfilePage } from './pages/Profile/Profile';
import { NotificationHistory } from './pages/Dashboard/components/NotificationHistory';
import { studentApi } from './services/api/studentApi';
import { pwaService } from './services/pwaService';
import { notificationService } from './services/notificationService';
import { NotificationToast } from './components/NotificationToast';

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
        console.log('Token found in localStorage');
        setIsReady(true);
      } else if (process.env.NODE_ENV === 'development') {
        // Auto-login with test credentials in development
        try {
          console.log('Attempting auto-login...');
          const result = await studentApi.login('CTU1001@busflow.com', 'demo-password');
          console.log('Auto-logged in successfully:', result.user.email);
          // Verify token was stored
          const storedToken = localStorage.getItem('accessToken');
          console.log('Token stored:', !!storedToken);
          setIsReady(true);
        } catch (error) {
          console.error('Auto-login failed:', error);
          console.log('Proceeding without authentication - will redirect to login');
          setIsReady(true);
        }
      } else {
        setIsReady(true);
      }

      // DISABLED: Service Worker was causing 401 errors on API calls
      // The SW was intercepting requests without auth headers
      // try {
      //   await pwaService.registerServiceWorker();
      //   console.log('Service Worker registered');
      // } catch (error) {
      //   console.warn('Service Worker registration failed:', error);
      // }

      // Request notification permission and subscribe to push
      if (studentApi.isAuthenticated()) {
        try {
          const permission = await notificationService.requestPermission();
          if (permission === 'granted') {
            await notificationService.subscribeToPushNotifications(
              'current-user-id',
              'STUDENT'
            );
            console.log('Push notifications enabled');
          }
        } catch (error) {
          console.warn('Push notification setup failed:', error);
        }
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <NotificationToast />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
