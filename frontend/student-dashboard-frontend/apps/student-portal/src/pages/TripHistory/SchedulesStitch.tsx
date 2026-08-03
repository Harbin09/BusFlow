import React, { useEffect, useState } from 'react';
import { studentApi } from '../../services/api/studentApi';
import { TopNavBar, SideNavBar, BottomNavBar, GlassCard, Button, Badge } from '../../components/Stitch';
import { Trip, ApiError } from '../../types';

export const SchedulesStitch: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await studentApi.getTripHistory();
      setTrips(data || []);
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
            <div className="space-y-2">{[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-surface-container rounded-lg"></div>
            ))}</div>
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
            <p className="font-headline-md text-headline-md mb-2">Error loading trip history</p>
            <p className="font-body-md text-body-md">{error?.message}</p>
            <Button onClick={loadTrips} variant="primary" className="mt-4">
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <section className="mb-8">
            <h1 className="font-headline-xl text-headline-xl text-on-surface">Trip History</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
              {trips.length > 0
                ? `${trips.length} trip${trips.length !== 1 ? 's' : ''} recorded in your history`
                : 'No trips found'}
            </p>
          </section>

          {/* Trips List */}
          <GlassCard className="p-6 rounded-2xl">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Your Trips</h2>
            {trips.length > 0 ? (
              <div className="space-y-4">
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="p-4 border border-outline-variant/30 rounded-xl hover:bg-surface-container-lowest transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-headline-md text-headline-md text-on-surface">{trip.routeName || 'Trip'}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          {trip.scheduledDate || trip.tripDate}
                        </p>
                      </div>
                      <Badge variant={
                        trip.status === 'COMPLETED' ? 'success' :
                        trip.status === 'SCHEDULED' ? 'primary' :
                        'secondary'
                      }>
                        {trip.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-outline-variant/20">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">location_on</span>
                        <div>
                          <p className="font-body-xs text-body-xs text-on-surface-variant">Pickup Stop</p>
                          <p className="font-body-md text-body-md text-on-surface">
                            {typeof trip.pickupStop === 'string'
                              ? trip.pickupStop
                              : trip.pickupStop?.stopName || 'Not assigned'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">schedule</span>
                        <div>
                          <p className="font-body-xs text-body-xs text-on-surface-variant">Scheduled Time</p>
                          <p className="font-body-md text-body-md text-on-surface">{trip.scheduledTime}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">directions_bus</span>
                        <div>
                          <p className="font-body-xs text-body-xs text-on-surface-variant">Bus Number</p>
                          <p className="font-body-md text-body-md text-on-surface">{trip.busNumber || 'Not assigned'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">flag</span>
                        <div>
                          <p className="font-body-xs text-body-xs text-on-surface-variant">Destination</p>
                          <p className="font-body-md text-body-md text-on-surface">
                            {typeof trip.droppingStop === 'string'
                              ? trip.droppingStop
                              : trip.droppingStop?.stopName || 'Not assigned'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">directions_bus</span>
                <p className="text-on-surface-variant">No trips found in your history</p>
              </div>
            )}
          </GlassCard>
        </div>
      </main>
    </div>
  );
};
