import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../services/api/studentApi';
import { Navigation } from '../../components/Navigation';
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
import { JourneyStatusCard, JourneyStage } from './components/JourneyStatusCard';
import { TodaysBusCard } from './components/TodaysBusCard';
import { Card } from '../../components/Card';
import { DashboardSkeleton } from '../../components/Loading/LoadingSpinner';
import { ErrorAlert } from '../../components/Error/ErrorAlert';

export const DashboardV2: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<ApiError | null>(null);

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [todayBus, setTodayBus] = useState<Bus | null>(null);
  const [todayTrip, setTodayTrip] = useState<Trip | null>(null);
  const [pickupPoint, setPickupPoint] = useState<Stop | null>(null);
  const [returnTrip, setReturnTrip] = useState<Trip | null>(null);
  const [missedBusInfo, setMissedBusInfo] = useState<MissedBus | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

  // Determine journey stage
  const getJourneyStage = (): JourneyStage => {
    if (!todayTrip) {
      if (student?.enrolledRoutes && student.enrolledRoutes.length === 0) return 'HOLIDAY';
      return 'NO_TRIP';
    }

    switch (todayTrip.status) {
      case 'SCHEDULED':
        return todayBus?.eta ? 'BUS_ARRIVING' : 'PICKUP_PENDING';
      case 'BOARDING':
        return 'BOARDED';
      case 'COMPLETED':
        return returnTrip ? 'REACHED_UNIVERSITY' : 'COMPLETED';
      case 'MISSED':
        return 'PICKUP_PENDING';
      default:
        return 'PICKUP_PENDING';
    }
  };

  if (loadingState === 'loading') {
    return (
      <div className="w-full min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
        <Navigation />
        <div className="w-full p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <DashboardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="w-full min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
        <Navigation />
        <div className="w-full p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <ErrorAlert error={error!} onRetry={loadDashboardData} />
          </div>
        </div>
      </div>
    );
  }

  const journeyStage = getJourneyStage();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <Navigation />

      {/* Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }} className="sticky top-20 z-30 w-full">
        <div className="w-full px-4 md:px-8 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back, {student?.name || 'Student'}!
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
        {/* Journey Status - Most Important */}
        {todayBus && todayTrip && (
          <JourneyStatusCard
            stage={journeyStage}
            delayMinutes={5}
            timeRemaining={
              todayBus?.etaTime || (todayBus?.eta ? `${Math.ceil(todayBus.eta / 60)} minutes` : 'Calculating...')
            }
            busNumber={todayBus?.busNumber}
          />
        )}

        {/* Today's Bus */}
        {todayBus && (
          <TodaysBusCard
            bus={todayBus}
            onTrackClick={() => navigate('/track-bus')}
          />
        )}

        {/* Pickup Point */}
        {pickupPoint && (
          <Card
            title="📍 Your Pickup Point"
            subtitle="Where your bus will pick you up"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📌</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">
                    {pickupPoint.stopName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Stop #{pickupPoint.stopOrder} on the route
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-gray-600 font-medium">
                    PICKUP TIME
                  </p>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    {todayTrip?.scheduledTime
                      ? new Date(todayTrip.scheduledTime).toLocaleTimeString(
                          [],
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )
                      : 'TBD'}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                  <p className="text-xs text-gray-600 font-medium">
                    ARRIVAL STATUS
                  </p>
                  <p className="text-sm font-bold text-green-600 mt-1">
                    {todayBus?.etaTime
                      ? `🚌 At ${todayBus.etaTime}`
                      : todayBus?.eta
                        ? `🚌 In ${Math.ceil(todayBus.eta / 60)} minutes`
                        : '⏳ Approaching'}
                  </p>
                </div>
              </div>

              <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 rounded-lg transition-colors">
                📍 View on Map
              </button>

              <p className="text-xs text-amber-700 bg-amber-50 rounded p-2">
                ⏰ Please be at the pickup point 5 minutes early
              </p>
            </div>
          </Card>
        )}

        {/* Notifications */}
        <Card title="🔔 Today's Updates" subtitle="Important notifications">
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notif) => (
                <div
                  key={notif.id}
                  className="bg-gray-50 border-l-4 border-blue-500 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {notif.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatTime(notif.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {notif.message}
                  </p>
                </div>
              ))}

              {notifications.length > 3 && (
                <button className="w-full text-center py-2 text-blue-600 hover:text-blue-700 font-semibold text-sm">
                  View All Notifications →
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-2xl mb-2">📭</p>
              <p className="font-medium">No notifications for today</p>
              <p className="text-xs mt-1">
                You're all caught up!
              </p>
            </div>
          )}
        </Card>

        {/* Missed Bus Feature */}
        {missedBusInfo && (
          <Card
            title="🚗 Missed Bus? No Problem"
            subtitle="Bus Switching Feature"
          >
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
                <p className="text-xs text-gray-600 font-medium mb-2">
                  CREDITS REMAINING
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-purple-600">
                    {student?.credits || 0}
                  </p>
                  <span className="text-sm text-gray-600">
                    Credits / Month
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-3">
                  ⚠️ You missed Bus {missedBusInfo.busNumber}
                </h4>
                <p className="text-sm text-amber-800 mb-3">
                  Route: {missedBusInfo.routeName}
                </p>
                <p className="text-xs text-amber-700">
                  Missed at{' '}
                  {new Date(missedBusInfo.missedAt).toLocaleTimeString()}
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-medium mb-2">
                  NEARBY BUS AVAILABLE
                </p>
                <div className="text-center py-2">
                  <p className="text-2xl font-bold text-indigo-600">
                    Bus-06
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    ⏱️ ETA: 14 minutes
                  </p>
                </div>
              </div>

              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors">
                🔄 Switch to Bus-06
              </button>

              <p className="text-xs text-gray-600">
                💡 One credit will be deducted for missing this bus
              </p>
            </div>
          </Card>
        )}

        {/* Return Trip */}
        {returnTrip && (
          <Card
            title="🔄 Return Trip"
            subtitle="Evening journey details"
          >
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4 border border-pink-100">
                <p className="text-xs text-gray-600 font-medium mb-1">
                  RETURN DEPARTURE
                </p>
                <p className="text-3xl font-bold text-pink-600">
                  {new Date(returnTrip.scheduledTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Status:{' '}
                  <span className="font-semibold text-pink-700">
                    {returnTrip.status === 'SCHEDULED'
                      ? '📅 Scheduled'
                      : returnTrip.status === 'BOARDING'
                        ? '✅ Boarding'
                        : '⏳ Pending'}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">FROM</p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {typeof returnTrip.pickupStop === 'string'
                      ? returnTrip.pickupStop
                      : returnTrip.pickupStop?.stopName || 'Pickup Point'}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">TO</p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {typeof returnTrip.droppingStop === 'string'
                      ? returnTrip.droppingStop
                      : returnTrip.droppingStop?.stopName || 'Dropping Point'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card title="⚡ Quick Actions" subtitle="Important features">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { icon: '📍', label: 'Track Bus', action: '/track-bus' },
              { icon: '📋', label: 'History', action: '/trip-history' },
              { icon: '🆘', label: 'Report', action: '/report-issue' },
              { icon: '👤', label: 'Profile', action: '/profile' },
              { icon: '🔔', label: 'Alerts', action: '/notifications' },
            ].map((action) => (
              <button
                key={action.action}
                onClick={() => navigate(action.action)}
                className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-3 text-center transition-colors"
              >
                <p className="text-2xl mb-1">{action.icon}</p>
                <p className="text-xs font-semibold text-gray-700">
                  {action.label}
                </p>
              </button>
            ))}
          </div>
        </Card>

        {/* Credits Info */}
        {student && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 font-medium">
                  AVAILABLE CREDITS
                </p>
                <p className="text-4xl font-bold mt-1">
                  {student.credits}
                  <span className="text-base opacity-75 ml-2">credits</span>
                </p>
              </div>
              <div className="text-6xl opacity-30">🎫</div>
            </div>
            <p className="text-sm mt-3 opacity-90">
              Credits are deducted when you miss a bus. Manage wisely!
            </p>
          </div>
        )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 text-center text-sm text-gray-600">
          <p>
            BUS FLOW - Smart Transportation Management for Students
          </p>
          <p className="mt-2 text-xs">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </footer>
    </div>
  );
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}
