'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  useStudentTodayTrip,
} from '@/lib/hooks/useOperations';
import { useTripTracking } from '@/lib/hooks/useTracking';

// Dynamically import map component to avoid SSR issues with Leaflet
const TrackingMap = dynamic(() => import('@/lib/components/TrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-2 animate-spin">🗺️</div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function StudentPortal() {
  const tripQuery = useStudentTodayTrip();
  const { locations: trackingLocations, isConnected, error: wsError } = useTripTracking(tripQuery.data?.id || null, true);
  const [expandedSection, setExpandedSection] = useState<'trip' | 'bus' | null>(null);

  const trip = tripQuery.data;
  // Get the bus location from real-time tracking (Socket.IO), if available
  const busLocation = trackingLocations.length > 0 ? trackingLocations[0] : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'DELAYED':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return '📅';
      case 'IN_PROGRESS':
        return '▶️';
      case 'COMPLETED':
        return '✓';
      case 'CANCELLED':
        return '✕';
      case 'DELAYED':
        return '⏱️';
      default:
        return '•';
    }
  };

  const getBusStatusColor = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT':
        return 'bg-green-100 text-green-800';
      case 'AT_STOP':
        return 'bg-blue-100 text-blue-800';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-800';
      case 'OFFLINE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Student Portal</h2>
          <p className="text-gray-600 mt-2">Track your assigned trip and bus location in real-time</p>
        </div>
        <span className="text-5xl">🚌</span>
      </div>

      {/* Loading State */}
      {tripQuery.isPending && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-start gap-4">
          <span className="text-3xl animate-spin">⏳</span>
          <div>
            <p className="text-blue-800 font-medium">Loading Your Trip</p>
            <p className="text-blue-700 text-sm">Fetching your assigned trip for today...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {tripQuery.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
          <span className="text-3xl">❌</span>
          <div>
            <p className="text-red-800 font-medium">Error Loading Trip</p>
            <p className="text-red-700 text-sm">
              {tripQuery.error instanceof Error ? tripQuery.error.message : 'Failed to load your trip'}
            </p>
            <p className="text-red-700 text-xs mt-3">
              💡 Make sure you are logged in with a STUDENT account. Go to <a href="/login" className="underline font-semibold">login page</a>
            </p>
          </div>
        </div>
      )}

      {/* No Trip Assigned */}
      {tripQuery.isSuccess && !trip && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-amber-900 font-medium text-lg">No Trip Assigned</p>
          <p className="text-amber-800 text-sm mt-2">You don&apos;t have a trip assigned for today.</p>
        </div>
      )}

      {/* Trip Assigned */}
      {trip && (
        <>
          {/* Trip Overview Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Your Trip Today</h3>
                <p className="text-gray-600 mt-1">
                  {new Date(trip.date).toLocaleDateString()} • {trip.departureTime}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold border ${getStatusColor(
                  trip.status
                )}`}
              >
                <span>{getStatusIcon(trip.status)}</span>
                {trip.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white bg-opacity-60 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold">ROUTE</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{trip.routeId}</p>
              </div>
              <div className="bg-white bg-opacity-60 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold">BUS</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{trip.busId}</p>
              </div>
              <div className="bg-white bg-opacity-60 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold">DEPARTURE</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{trip.departureTime}</p>
              </div>
              <div className="bg-white bg-opacity-60 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold">ARRIVAL</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{trip.arrivalTime || '—'}</p>
              </div>
            </div>
          </div>

          {/* Real-time Bus Location with Interactive Map */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Live Bus Tracking</h3>
              <p className="text-sm text-gray-600 mt-1">Real-time location and tracking on interactive map</p>
            </div>

            <div className="p-6">
              {/* Interactive Map */}
              <TrackingMap
                busLocation={busLocation}
                isConnected={isConnected}
                tripStatus={trip?.status}
                busNumber={busLocation?.busId}
                eta={trip?.arrivalTime}
              />

              {/* Error Display */}
              {wsError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    <strong>Connection Error:</strong> {wsError}
                  </p>
                </div>
              )}

              {/* Bus Info Card Below Map */}
              {busLocation && (
                <div className="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">SPEED</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{busLocation.speed}</p>
                      <p className="text-xs text-gray-600">km/h</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">STATUS</p>
                      <p className="text-sm font-bold text-gray-900 mt-2">{busLocation.status}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">STUDENTS ABOARD</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{busLocation.totalStudentsOnboard}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">LAST UPDATE</p>
                      <p className="text-xs text-gray-700 mt-2">
                        {new Date(busLocation.lastUpdated).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'trip' ? null : 'trip')}
              className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <h3 className="text-lg font-bold text-gray-900">Trip Details</h3>
              <span
                className={`text-2xl transition-transform ${expandedSection === 'trip' ? 'rotate-180' : ''}`}
              >
                ▼
              </span>
            </button>

            {expandedSection === 'trip' && (
              <div className="p-6 border-t border-gray-200 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">TRIP ID</p>
                    <p className="text-sm font-mono text-gray-900 mt-1">{trip.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">ROUTE ID</p>
                    <p className="text-sm font-mono text-gray-900 mt-1">{trip.routeId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">BUS ID</p>
                    <p className="text-sm font-mono text-gray-900 mt-1">{trip.busId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">DRIVER ID</p>
                    <p className="text-sm font-mono text-gray-900 mt-1">{trip.driverId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">DATE</p>
                    <p className="text-sm text-gray-900 mt-1">{new Date(trip.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">STATUS</p>
                    <p className="text-sm text-gray-900 mt-1">{trip.status}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">DEPARTURE</p>
                    <p className="text-sm text-gray-900 mt-1">{trip.departureTime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">ARRIVAL</p>
                    <p className="text-sm text-gray-900 mt-1">{trip.arrivalTime || '—'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Info Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-semibold text-green-900 mb-2">Student Portal Features</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>✓ View your assigned trip details for today</li>
          <li>✓ Track your bus location in real-time</li>
          <li>✓ See current speed and number of students aboard</li>
          <li>✓ View your bus&apos;s current and next stop</li>
          <li>✓ Stay updated with real-time location updates</li>
        </ul>
      </div>
    </div>
  );
}
