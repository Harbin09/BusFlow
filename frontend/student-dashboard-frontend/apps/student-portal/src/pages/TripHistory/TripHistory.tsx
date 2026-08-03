import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Navigation } from '../../components/Navigation';
import { studentApi } from '../../services/api/studentApi';
import { Trip } from '../../types';

export const TripHistoryPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const tripsData = await studentApi.getTripHistory();
      setTrips(tripsData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
        <Navigation />
        <div className="w-full p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 rounded w-1/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <Navigation />

      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }} className="sticky top-20 z-30 w-full">
        <div className="w-full px-4 md:px-8 py-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">📋 Trip History</h1>
            <p className="text-sm text-gray-600 mt-1">Your past and scheduled journeys</p>
          </div>
        </div>
      </header>

      <main className="w-full p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
        {trips.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {trips.map((trip, index) => (
              <Card key={trip.id || index} title={`🚌 Trip ${index + 1}`} subtitle={`Bus ${trip.busNumber}`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium">TRIP ID</p>
                    <p className="text-sm font-bold text-blue-600 mt-1 break-all">{trip.id}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-xs text-gray-600 font-medium">STATUS</p>
                    <p className="text-sm font-bold text-green-600 mt-1">{trip.status}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <p className="text-xs text-gray-600 font-medium">SCHEDULED TIME</p>
                    <p className="text-sm font-bold text-orange-600 mt-1">{trip.scheduledTime}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-xs text-gray-600 font-medium">DATE</p>
                    <p className="text-sm font-bold text-purple-600 mt-1">{trip.scheduledDate}</p>
                  </div>
                </div>

                {trip.routeName && (
                  <div className="mt-4 bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <p className="text-xs text-gray-600 font-medium">ROUTE</p>
                    <p className="text-sm font-bold text-indigo-600 mt-1">{trip.routeName}</p>
                  </div>
                )}

                {(trip.pickupStop || trip.droppingStop) && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
                    <p className="text-sm font-semibold text-gray-800 mb-3">📍 Route Details</p>
                    <div className="grid grid-cols-2 gap-4">
                      {trip.pickupStop && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium">FROM (Pickup)</p>
                          <p className="text-sm font-bold text-gray-800 mt-1">
                            {typeof trip.pickupStop === 'string' ? trip.pickupStop : trip.pickupStop?.stopName || 'TBD'}
                          </p>
                        </div>
                      )}
                      {trip.droppingStop && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium">TO (Dropping)</p>
                          <p className="text-sm font-bold text-gray-800 mt-1">
                            {typeof trip.droppingStop === 'string' ? trip.droppingStop : trip.droppingStop?.stopName || 'TBD'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card title="No Trips Found" subtitle="Trip history">
            <p className="text-gray-600">No trips scheduled or available in your history. Check back later!</p>
          </Card>
        )}
        </div>
      </main>
    </div>
  );
};
