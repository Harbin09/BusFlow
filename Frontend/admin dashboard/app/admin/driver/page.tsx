'use client';

import React, { useState } from 'react';
import {
  useDriverTodayTrip,
  useTripPassengers,
  useStartTrip,
  useEndTrip,
  useActivateTracking,
  useCompleteTracking,
} from '@/lib/hooks/useOperations';

export default function DriverPortal() {
  const tripQuery = useDriverTodayTrip();
  const passengersQuery = useTripPassengers(tripQuery.data?.id || null);
  const startTripMutation = useStartTrip();
  const endTripMutation = useEndTrip();
  const activateTrackingMutation = useActivateTracking();
  const completeTrackingMutation = useCompleteTracking();

  const [expandedSection, setExpandedSection] = useState<'trip' | 'passengers' | 'tracking' | null>(null);

  const trip = tripQuery.data;
  const passengers = passengersQuery.data;

  const handleStartTrip = async () => {
    if (trip?.id) {
      await startTripMutation.mutateAsync(trip.id);
    }
  };

  const handleEndTrip = async () => {
    if (trip?.id) {
      await endTripMutation.mutateAsync(trip.id);
    }
  };

  const handleActivateTracking = async () => {
    if (trip?.id) {
      await activateTrackingMutation.mutateAsync(trip.id);
    }
  };

  const handleCompleteTracking = async () => {
    if (trip?.id) {
      await completeTrackingMutation.mutateAsync(trip.id);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Driver Portal</h2>
          <p className="text-gray-600 mt-2">Manage your assigned trip and track passengers</p>
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
              💡 Make sure you are logged in with a DRIVER account. Go to <a href="/login" className="underline font-semibold">login page</a>
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
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Trip #{trip.id.slice(0, 8)}</h3>
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

            {/* Trip Controls */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleStartTrip}
                disabled={
                  startTripMutation.isPending ||
                  trip.status !== 'SCHEDULED'
                }
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {startTripMutation.isPending ? '⏳ Starting...' : '▶️ Start Trip'}
              </button>

              <button
                onClick={handleEndTrip}
                disabled={
                  endTripMutation.isPending ||
                  trip.status !== 'IN_PROGRESS'
                }
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {endTripMutation.isPending ? '⏳ Ending...' : '⏹️ End Trip'}
              </button>

              <button
                onClick={handleActivateTracking}
                disabled={activateTrackingMutation.isPending}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {activateTrackingMutation.isPending ? '⏳ Activating...' : '📍 Activate GPS'}
              </button>

              <button
                onClick={handleCompleteTracking}
                disabled={completeTrackingMutation.isPending}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {completeTrackingMutation.isPending ? '⏳ Completing...' : '✓ Complete Tracking'}
              </button>
            </div>

            {/* Action Errors */}
            {(startTripMutation.isError ||
              endTripMutation.isError ||
              activateTrackingMutation.isError ||
              completeTrackingMutation.isError) && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  <strong>Error:</strong> Failed to perform action. Please try again.
                </p>
              </div>
            )}
          </div>

          {/* Passengers Section */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'passengers' ? null : 'passengers')}
              className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-200 flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900">Passengers</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {passengers?.summary.total || 0} total • {passengers?.summary.active || 0} active •{' '}
                  {passengers?.summary.noshow || 0} no-show
                </p>
              </div>
              <span
                className={`text-2xl transition-transform ${
                  expandedSection === 'passengers' ? 'rotate-180' : ''
                }`}
              >
                ▼
              </span>
            </button>

            {expandedSection === 'passengers' && (
              <div className="p-6">
                {passengersQuery.isPending && (
                  <div className="text-center py-8">
                    <div className="animate-spin text-4xl mb-3">⏳</div>
                    <p className="text-gray-600">Loading passengers...</p>
                  </div>
                )}

                {passengersQuery.isError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">Failed to load passenger list</p>
                  </div>
                )}

                {passengersQuery.isSuccess && passengers && (
                  <>
                    {passengers.passengers.length === 0 ? (
                      <div className="text-center py-8 text-gray-600">
                        <p className="text-lg mb-2">📭 No passengers assigned</p>
                        <p className="text-sm">This trip has no passenger assignments</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {passengers.passengers.map((passenger) => (
                          <div
                            key={passenger.id}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  Student {passenger.studentId.slice(0, 8)}
                                </p>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                  {passenger.boardingStopId && (
                                    <span>📍 Board: {passenger.boardingStopId}</span>
                                  )}
                                  {passenger.boardingTime && (
                                    <span>⏰ {new Date(passenger.boardingTime).toLocaleTimeString()}</span>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                                  passenger.status === 'BOARDED'
                                    ? 'bg-green-100 text-green-800'
                                    : passenger.status === 'ALIGHTED'
                                    ? 'bg-gray-100 text-gray-800'
                                    : passenger.status === 'NO_SHOW'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {passenger.status === 'BOARDED' && '✓'}
                                {passenger.status === 'ALIGHTED' && '✕'}
                                {passenger.status === 'NO_SHOW' && '❌'}
                                {passenger.status === 'SCHEDULED' && '📋'}
                                {passenger.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Trip Info Section */}
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
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">GENERATED BY</p>
                    <p className="text-sm text-gray-900 mt-1">
                      {trip.generatedByRuleEngine ? 'Rule Engine' : 'Manual'}
                    </p>
                  </div>
                  {trip.timetableId && (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">TIMETABLE ID</p>
                      <p className="text-sm font-mono text-gray-900 mt-1">{trip.timetableId}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">CREATED</p>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(trip.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">UPDATED</p>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(trip.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-2">Driver Workflow</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ View your assigned trip for today</li>
          <li>✓ Start and end your trip with one click</li>
          <li>✓ Monitor your assigned passengers and their status</li>
          <li>✓ Activate GPS tracking for real-time location updates</li>
          <li>✓ Complete tracking when your trip is finished</li>
        </ul>
      </div>
    </div>
  );
}
