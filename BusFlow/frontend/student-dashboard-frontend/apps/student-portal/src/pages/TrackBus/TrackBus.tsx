import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Navigation } from '../../components/Navigation';
import { BusMap } from '../../components/BusMap';
import { studentApi } from '../../services/api/studentApi';
import { Bus, ApiError } from '../../types';

export const TrackBusPage: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const busesData = await studentApi.getAvailableBuses();
      setBuses(busesData);
    } catch (err) {
      setError(err as ApiError);
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
            <h1 className="text-3xl font-bold text-gray-900">📍 Track Bus</h1>
            <p className="text-sm text-gray-600 mt-1">Monitor your bus location in real-time</p>
          </div>
        </div>
      </header>

      <main className="w-full p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {error ? (
            <Card title="Error" subtitle="Failed to load bus data">
              <p className="text-red-600">{error.message}</p>
              <button
                onClick={loadData}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </Card>
          ) : buses.length > 0 ? (
            <div className="space-y-8">
              {/* Live Map Section */}
              <div className="w-full">
                <Card title="🗺️ Live Bus Map" subtitle="Real-time bus locations">
                  <BusMap
                    buses={buses.map((bus) => ({
                      id: bus.id || bus.busNumber,
                      busNumber: bus.busNumber,
                      latitude: bus.currentLocation?.latitude || 28.5355,
                      longitude: bus.currentLocation?.longitude || 77.0522,
                      status: bus.status,
                    }))}
                    height="600px"
                  />
                </Card>
              </div>

              {/* Bus Details Grid */}
              <div className="w-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Bus Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {buses.map((bus, index) => (
                    <Card
                      key={bus.id || index}
                      title={`🚌 Bus ${index + 1}`}
                      subtitle={`Route ${index + 1} - Live Tracking`}
                    >
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-xs text-gray-600 font-medium">BUS NUMBER</p>
                          <p className="text-2xl font-bold text-blue-600 mt-2">{bus.busNumber}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <p className="text-xs text-gray-600 font-medium">STATUS</p>
                            <p className="text-sm font-bold text-green-600 mt-1">{bus.status}</p>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                            <p className="text-xs text-gray-600 font-medium">ETA</p>
                            <p className="text-sm font-bold text-orange-600 mt-1">
                              {bus.etaTime || `${Math.ceil((bus.eta || 500) / 60)}m`}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                            <p className="text-xs text-gray-600 font-medium">CAPACITY</p>
                            <p className="text-sm font-bold text-purple-600 mt-1">{bus.capacity} seats</p>
                          </div>
                          <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                            <p className="text-xs text-gray-600 font-medium">PLATE</p>
                            <p className="text-xs font-bold text-indigo-600 mt-1 break-all">{bus.plateNumber}</p>
                          </div>
                        </div>

                        {bus.currentLocation && (
                          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                            <p className="text-sm font-semibold text-gray-800 mb-3">📍 Live Location</p>
                            <div className="space-y-2">
                              <p className="text-xs text-green-700">
                                Latitude: <span className="font-mono font-bold">{bus.currentLocation.latitude.toFixed(4)}</span>
                              </p>
                              <p className="text-xs text-green-700">
                                Longitude: <span className="font-mono font-bold">{bus.currentLocation.longitude.toFixed(4)}</span>
                              </p>
                            </div>
                          </div>
                        )}

                        {bus.routeName && (
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <p className="text-xs text-gray-600 font-medium">ROUTE</p>
                            <p className="text-sm font-bold text-blue-600 mt-1">{bus.routeName}</p>
                          </div>
                        )}

                        {bus.driverName && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-600 font-medium">DRIVER</p>
                            <p className="text-sm font-bold text-gray-700 mt-1">{bus.driverName}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Card title="No Buses Available" subtitle="Bus tracking">
              <p className="text-gray-600">
                No buses available for tracking at this moment. Please try again later.
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};
