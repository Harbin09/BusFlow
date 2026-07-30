import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../services/api/studentApi';
import {
  Bus,
  Trip,
  Stop,
  Notification,
  StudentProfile,
  MissedBus,
  ApiError,
  LoadingState,
} from '../../types';
import { Card } from '../../components/Card';
import { DashboardSkeleton } from '../../components/Loading/LoadingSpinner';
import { ErrorAlert } from '../../components/Error/ErrorAlert';
import { BusCard } from './components/BusCard';
import { PickupPointCard } from './components/PickupPointCard';
import { NotificationsCard } from './components/NotificationsCard';
import { ReturnTripCard } from './components/ReturnTripCard';
import { MissedBusCard } from './components/MissedBusCard';
import { QuickActionsCard } from './components/QuickActionsCard';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<ApiError | null>(null);

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [todayBus, setTodayBus] = useState<Bus | null>(null);
  const [todayTrip, setTodayTrip] = useState<Trip | null>(null);
  const [pickupPoint, setPickupPoint] = useState<Stop | null>(null);
  const [returnTrip, setReturnTrip] = useState<Trip | null>(null);
  const [missedBusInfo, setMissedBusInfo] = useState<MissedBus | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoadingState('loading');
      setError(null);

      const data = await studentApi.getDashboardData();

      setStudent(data.student);
      setTodayBus(data.todayBus);
      setTodayTrip(data.todayTrip);
      setPickupPoint(data.pickupPoint);
      setReturnTrip(data.returnTrip || null);
      setMissedBusInfo(data.missedBusInfo || null);
      setNotifications(data.notifications);

      setLoadingState('success');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      setLoadingState('error');
    }
  };

  // Show loading skeleton
  if (loadingState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // Show error state
  if (loadingState === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <ErrorAlert error={error!} onRetry={loadDashboardData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 md:p-8 shadow-md">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">
            Welcome, {student?.firstName}! 👋
          </h1>
          <p className="text-blue-100 mt-2">
            Your daily bus schedule and updates
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Today's Bus Section */}
        {todayBus && (
          <Card
            title="Today's Bus"
            subtitle="Your assigned bus and status"
          >
            <BusCard bus={todayBus} />
          </Card>
        )}

        {/* Pickup Point Section */}
        {pickupPoint && (
          <Card
            title="Pickup Point"
            subtitle="Where to catch your bus"
          >
            <PickupPointCard
              pickupPoint={pickupPoint}
              tripTime={todayTrip?.scheduledTime}
            />
          </Card>
        )}

        {/* Notifications Section */}
        <Card title="Notifications" subtitle="Recent alerts and updates">
          {notifications.length > 0 ? (
            <NotificationsCard notifications={notifications} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>📭 No new notifications</p>
            </div>
          )}
        </Card>

        {/* Return Trip Section */}
        {returnTrip && (
          <Card title="Return Trip" subtitle="Your evening journey">
            <ReturnTripCard trip={returnTrip} bus={todayBus!} />
          </Card>
        )}

        {/* Missed Bus Section */}
        {missedBusInfo && (
          <Card title="Missed Bus" subtitle="Credit balance and options">
            <MissedBusCard
              missedBus={missedBusInfo}
              credits={student?.credits || 0}
            />
          </Card>
        )}

        {/* Quick Actions */}
        <Card title="Quick Actions" subtitle="Access key features">
          <QuickActionsCard navigate={navigate} />
        </Card>

        {/* Credits Info */}
        {student && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Available Credits</p>
                <p className="text-3xl font-bold">{student.credits}</p>
              </div>
              <div className="text-4xl">🎫</div>
            </div>
            <p className="text-sm mt-3 opacity-90">
              Credits deducted when you miss a bus
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 p-4 md:p-8 mt-8">
        <div className="max-w-6xl mx-auto text-center">
          <p>BUS FLOW - Student Dashboard</p>
          <p className="text-sm mt-2">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </footer>
    </div>
  );
};
