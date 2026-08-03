import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { DriverDashboard } from './pages/Dashboard/DriverDashboard';
import { Login } from './pages/Login/Login';
import { NotificationHistory } from './pages/Dashboard/components/NotificationHistory';
import { driverApi } from './services/api/driverApi';
import { pwaService } from './services/pwaService';
import { notificationService } from './services/notificationService';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!driverApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      if (driverApi.isAuthenticated()) {
        setIsReady(true);
      } else if (process.env.NODE_ENV === 'development') {
        try {
          await driverApi.login('DRV-001@busflow.com', 'demo-password');
          console.log('Auto-logged in with test credentials');
        } catch (error) {
          console.error('Auto-login failed:', error);
        }
        setIsReady(true);
      } else {
        setIsReady(true);
      }

      try {
        await pwaService.registerServiceWorker();
        console.log('Service Worker registered');
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }

      if (driverApi.isAuthenticated()) {
        try {
          const permission = await notificationService.requestPermission();
          if (permission === 'granted') {
            await notificationService.subscribeToPushNotifications(
              'current-driver-id',
              'DRIVER'
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
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DriverDashboard />
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
