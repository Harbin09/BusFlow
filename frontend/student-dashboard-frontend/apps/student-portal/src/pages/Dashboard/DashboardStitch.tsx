import React, { useEffect, useState } from 'react';
import { studentApi } from '../../services/api/studentApi';
import { TopNavBar, SideNavBar, BottomNavBar, GlassCard, Button, Badge } from '../../components/Stitch';
import { BusMap } from '../../components/BusMap';
import {
  Bus,
  Trip,
  Stop,
  StudentProfile,
  Notification,
  MissedBus,
  ApiError,
  LoadingState,
} from '../../types';

export const DashboardStitch: React.FC = () => {
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

  if (loadingState === 'loading') {
    return (
      <div className="bg-background min-h-screen">
        <TopNavBar />
        <SideNavBar />
        <main className="pt-20 pb-20 pl-0 lg:pl-20 px-4 md:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-surface-container rounded-lg w-1/3"></div>
            <div className="h-96 bg-surface-container rounded-lg"></div>
          </div>
        </main>
        <BottomNavBar />
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="bg-background min-h-screen">
        <TopNavBar />
        <SideNavBar />
        <main className="pt-20 pb-20 pl-0 lg:pl-20 px-4 md:px-8">
          <div className="bg-error-container text-on-error-container p-6 rounded-lg">
            <p className="font-headline-md text-headline-md mb-2">Error loading dashboard</p>
            <p className="font-body-md text-body-md">{error?.message}</p>
            <Button onClick={loadDashboardData} variant="primary" className="mt-4">
              Retry
            </Button>
          </div>
        </main>
        <BottomNavBar />
      </div>
    );
  }

  const defaultCampusBuses = [
    { id: '1', busNumber: 'BUS-101 (North Express)', latitude: 28.6139, longitude: 77.2090, status: 'IN_TRANSIT' },
    { id: '2', busNumber: 'BUS-102 (Metro Shuttle)', latitude: 28.6250, longitude: 77.2180, status: 'IN_TRANSIT' },
    { id: '3', busNumber: 'BUS-104 (South Route)', latitude: 28.5950, longitude: 77.2100, status: 'IN_TRANSIT' },
  ];

  const busesForMap = todayBus && todayBus.currentLocation
    ? [{
        id: todayBus.id || '',
        busNumber: todayBus.busNumber,
        latitude: todayBus.currentLocation.latitude,
        longitude: todayBus.currentLocation.longitude,
        status: todayBus.status,
      }]
    : defaultCampusBuses;

  return (
    <div className="bg-background min-h-screen text-on-surface">
      <TopNavBar />
      <SideNavBar />
      <BottomNavBar />

      <main className="pt-20 pb-20 pl-0 lg:pl-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="mb-8">
            <h1 className="font-headline-xl text-headline-xl text-on-surface">
              Good Morning, {student?.name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
              {todayTrip
                ? `Your shuttle assigned to ${pickupPoint?.stopName || 'Main Gate'}`
                : 'No trips scheduled for today.'}
            </p>
          </section>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Map Card */}
              <GlassCard className="p-6 rounded-2xl overflow-hidden">
                <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Live Bus Location</h2>
                <BusMap buses={busesForMap} height="400px" />
              </GlassCard>

              {/* Bus Info Card */}
              {todayBus && (
                <GlassCard className="p-6 rounded-2xl">
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Today's Bus</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Bus Number</p>
                      <p className="font-headline-md text-headline-md text-on-surface mt-1">{todayBus.busNumber}</p>
                    </div>
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Status</p>
                      <Badge variant={todayBus.status === 'IN_TRANSIT' ? 'success' : 'secondary'} className="mt-1">
                        {todayBus.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Capacity</p>
                      <p className="font-headline-md text-headline-md text-on-surface mt-1">{todayBus.capacity} seats</p>
                    </div>
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">ETA</p>
                      <p className="font-headline-md text-headline-md text-on-surface mt-1">{todayBus.etaTime || 'Calculating...'}</p>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Trip Info Card */}
              {todayTrip && (
                <GlassCard className="p-6 rounded-2xl">
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Trip Details</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">location_on</span>
                      <div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Pickup Stop</p>
                        <p className="font-body-md text-body-md text-on-surface">
                          {pickupPoint?.stopName || (typeof todayTrip.pickupStop === 'string' ? todayTrip.pickupStop : todayTrip.pickupStop?.stopName) || 'Main Gate'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">schedule</span>
                      <div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Scheduled Time</p>
                        <p className="font-body-md text-body-md text-on-surface">{todayTrip.scheduledTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">directions_bus</span>
                      <div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Trip Status</p>
                        <p className="font-body-md text-body-md text-on-surface">{todayTrip.status}</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Right Column - 1/3 */}
            <div className="space-y-6">
              {/* Student Profile Card */}
              {student && (
                <GlassCard className="p-6 rounded-2xl">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Your Profile</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Name</p>
                      <p className="font-body-md text-body-md text-on-surface">{student.name}</p>
                    </div>
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Student No</p>
                      <p className="font-body-md text-body-md text-on-surface">{student.studentNo}</p>
                    </div>
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Program</p>
                      <p className="font-body-md text-body-md text-on-surface">{student.program}</p>
                    </div>
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Credits</p>
                      <p className="font-body-md text-body-md text-on-surface">{student.credits}</p>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Return Trip Card */}
              {returnTrip && (
                <GlassCard className="p-6 rounded-2xl">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Return Trip</h3>
                  <div className="space-y-2">
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Scheduled Time</p>
                    <p className="font-body-md text-body-md text-on-surface">{returnTrip.scheduledTime}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">Status</p>
                    <p className="font-body-md text-body-md text-on-surface">{returnTrip.status}</p>
                  </div>
                </GlassCard>
              )}

              {/* Missed Bus Alert */}
              {missedBusInfo && (
                <GlassCard className="p-6 rounded-2xl bg-error-container/20 border border-error">
                  <h3 className="font-headline-md text-headline-md text-error mb-2">Missed Bus Alert</h3>
                  <p className="font-body-sm text-body-sm text-error">
                    You missed bus {missedBusInfo.busNumber}. {missedBusInfo.creditsDeducted} credits deducted.
                  </p>
                </GlassCard>
              )}

              {/* Notifications Card */}
              {notifications.length > 0 && (
                <GlassCard className="p-6 rounded-2xl">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-4">
                    Notifications ({notifications.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notifications.slice(0, 3).map((notif) => (
                      <div key={notif.id} className="p-3 bg-surface-container rounded-lg">
                        <p className="font-body-sm text-body-sm font-semibold text-on-surface">{notif.title}</p>
                        <p className="font-body-xs text-body-xs text-on-surface-variant mt-1">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
