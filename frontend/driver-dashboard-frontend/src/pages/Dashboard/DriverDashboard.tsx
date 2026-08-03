import React, { useEffect, useState } from 'react';
import { driverApi } from '../../services/api/driverApi';
import { BusStatusCard } from './components/BusStatusCard';
import { DriverMap } from './components/DriverMap';
import { MissedBusStudents } from './components/MissedBusStudents';
import { PassengerList } from './components/PassengerList';
import { NotificationCenter } from './components/NotificationCenter';

export const DriverDashboard: React.FC = () => {
  const [bus, setBus] = useState<any>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [missedStudents, setMissedStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [locationUpdating, setLocationUpdating] = useState(false);

  useEffect(() => {
    initializeDashboard();
    const interval = setInterval(updateLocation, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const initializeDashboard = async () => {
    try {
      const busData = await driverApi.getAssignedBus();
      setBus(busData);

      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
          },
          (err) => {
            console.error('Geolocation error:', err);
            setLocation({ latitude: 28.6139, longitude: 77.209 }); // Default
          },
          { enableHighAccuracy: true, maximumAge: 5000 }
        );
      }

      await fetchPassengers();
      await fetchMissedStudents();
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
      setLoading(false);
    }
  };

  const updateLocation = async () => {
    if (!location || !bus) return;

    setLocationUpdating(true);
    try {
      await driverApi.updateLocation(location.latitude, location.longitude);
      setLastUpdate(new Date().toLocaleTimeString());
      console.log('Location updated:', location);
    } catch (error) {
      console.error('Failed to update location:', error);
    } finally {
      setLocationUpdating(false);
    }
  };

  const fetchPassengers = async () => {
    try {
      const data = await driverApi.getPassengerList();
      setPassengers(data);
    } catch (error) {
      console.error('Failed to fetch passengers:', error);
    }
  };

  const fetchMissedStudents = async () => {
    try {
      const data = await driverApi.getMissedBusStudents();
      setMissedStudents(data);
    } catch (error) {
      console.error('Failed to fetch missed students:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Driver Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">🚌 Driver Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className={`text-sm ${locationUpdating ? 'text-yellow-600' : 'text-green-600'}`}>
                {locationUpdating ? '📍 Updating...' : '✅ Live'}
              </span>
              <button
                onClick={() => window.location.href = '/'}
                className="text-gray-600 hover:text-gray-900"
              >
                🔄
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
          {error}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Bus Status */}
        {bus && <BusStatusCard bus={bus} lastUpdate={lastUpdate} />}

        {/* Map */}
        {location && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <DriverMap location={location} bus={bus} />
          </div>
        )}

        {/* Missed Bus Students (with detailed info) */}
        {missedStudents.length > 0 && (
          <MissedBusStudents
            students={missedStudents}
            onRefresh={fetchMissedStudents}
          />
        )}

        {/* Passengers */}
        <PassengerList passengers={passengers} onRefresh={fetchPassengers} />

        {/* Notifications */}
        <NotificationCenter />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden flex justify-around py-3">
        <a href="/" className="flex flex-col items-center text-blue-600">
          <span className="text-xl">🏠</span>
          <span className="text-xs">Home</span>
        </a>
        <button
          onClick={updateLocation}
          className="flex flex-col items-center text-gray-600"
          title="Update location now"
        >
          <span className="text-xl">📍</span>
          <span className="text-xs">Update</span>
        </button>
        <a href="/notifications" className="flex flex-col items-center text-gray-600">
          <span className="text-xl">🔔</span>
          <span className="text-xs">Alerts</span>
        </a>
        <button
          onClick={() => {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
          }}
          className="flex flex-col items-center text-gray-600"
        >
          <span className="text-xl">🚪</span>
          <span className="text-xs">Logout</span>
        </button>
      </nav>
    </div>
  );
};
