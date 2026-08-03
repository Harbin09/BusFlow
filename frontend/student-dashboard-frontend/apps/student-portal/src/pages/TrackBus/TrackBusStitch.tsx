import React, { useEffect, useState } from 'react';
import { studentApi } from '../../services/api/studentApi';
import { TopNavBar, SideNavBar, BottomNavBar, GlassCard, Button, Badge } from '../../components/Stitch';
import { BusMap } from '../../components/BusMap';
import { Bus, ApiError } from '../../types';

export const TrackBusStitch: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);

  useEffect(() => {
    loadAvailableBuses();
  }, []);

  const loadAvailableBuses = async () => {
    try {
      setLoading(true);
      const data = await studentApi.getAvailableBuses();
      setBuses(data ? data.filter(b => b.currentLocation) : []);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  if (error) {
    return (
      <div className="bg-background min-h-screen">
        <TopNavBar />
        <SideNavBar />
        <main className="pt-20 pb-20 pl-0 lg:pl-20 px-4 md:px-8">
          <div className="bg-error-container text-on-error-container p-6 rounded-lg">
            <p className="font-headline-md text-headline-md mb-2">Error loading buses</p>
            <p className="font-body-md text-body-md">{error?.message}</p>
            <Button onClick={loadAvailableBuses} variant="primary" className="mt-4">
              Retry
            </Button>
          </div>
        </main>
        <BottomNavBar />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-on-surface">
      <TopNavBar />
      <SideNavBar />
      <BottomNavBar />

      <main className="pt-20 pb-20 pl-0 lg:pl-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <section className="mb-8">
            <h1 className="font-headline-xl text-headline-xl text-on-surface">Live Bus Tracking</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
              {buses.length > 0
                ? `${buses.length} bus${buses.length !== 1 ? 'es' : ''} available for tracking`
                : 'No buses currently available'}
            </p>
          </section>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map - 2/3 width */}
              <div className="lg:col-span-2">
                <GlassCard className="p-6 rounded-2xl overflow-hidden">
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Live Locations</h2>
                  <BusMap
                    buses={
                      buses.length > 0
                        ? buses.map(b => ({
                            id: b.id || '',
                            busNumber: b.busNumber,
                            latitude: b.currentLocation?.latitude || 0,
                            longitude: b.currentLocation?.longitude || 0,
                            status: b.status,
                          }))
                        : [
                            { id: 'f1', busNumber: 'BUS-101 (North Express)', latitude: 28.6139, longitude: 77.2090, status: 'IN_TRANSIT' },
                            { id: 'f2', busNumber: 'BUS-102 (South Gate)', latitude: 28.6200, longitude: 77.2150, status: 'IN_TRANSIT' },
                            { id: 'f3', busNumber: 'BUS-103 (East Wing)', latitude: 28.6080, longitude: 77.2200, status: 'SCHEDULED' },
                          ]
                    }
                    height="500px"
                  />
                </GlassCard>
              </div>


            {/* Bus List - 1/3 width */}
            <div>
              <GlassCard className="p-6 rounded-2xl">
                <h2 className="font-headline-md text-headline-md text-on-surface mb-4">
                  Available Buses ({buses.length})
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {buses.map((bus) => (
                    <div key={bus.id} className="p-3 bg-surface-container rounded-xl border border-outline-variant/30">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-body-md text-body-md font-semibold text-on-surface">{bus.busNumber}</p>
                          <p className="font-body-xs text-body-xs text-on-surface-variant">{bus.plateNumber}</p>
                        </div>
                        <Badge variant={bus.status === 'IN_TRANSIT' ? 'success' : 'secondary'}>
                          {bus.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">directions_bus</span>
                          <span className="text-on-surface">{bus.routeName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                          <span className="text-on-surface">{bus.etaTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                          <span className="text-on-surface">{bus.driverName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">event_seat</span>
                          <span className="text-on-surface">{bus.capacity} seats</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
