'use client';

import React, { useState, useEffect } from 'react';
import { useAllBusLocations, BusLocation } from '@/lib/hooks/useTracking';

export default function TrackingPage() {
  const { locations: socketLocations, isConnected, error: wsError } = useAllBusLocations(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const defaultLocations: BusLocation[] = [
    {
      id: 'BUS-001',
      busId: 'BUS-001',
      tripId: 'TRIP-101',
      latitude: 28.6139,
      longitude: 77.2090,
      speed: 38,
      status: 'IN_TRANSIT',
      timestamp: new Date().toISOString(),
      currentStopId: 'Main Gate Terminal',
      nextStopId: 'Library Complex',
      totalStudentsOnboard: 32,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'BUS-002',
      busId: 'BUS-002',
      tripId: 'TRIP-102',
      latitude: 28.6210,
      longitude: 77.2150,
      speed: 25,
      status: 'AT_STOP',
      timestamp: new Date().toISOString(),
      currentStopId: 'Hostel Block B',
      nextStopId: 'Engineering Block',
      totalStudentsOnboard: 18,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'BUS-003',
      busId: 'BUS-003',
      tripId: 'TRIP-103',
      latitude: 28.6080,
      longitude: 77.2010,
      speed: 42,
      status: 'IN_TRANSIT',
      timestamp: new Date().toISOString(),
      currentStopId: 'East Gate Loop',
      nextStopId: 'Science Block',
      totalStudentsOnboard: 27,
      lastUpdated: new Date().toISOString(),
    },
  ];

  const locations = socketLocations.length > 0 ? socketLocations : defaultLocations;

  useEffect(() => {
    setLastUpdate(new Date().toLocaleTimeString());
  }, [locations]);

  const stats = {
    activeBuses: locations.length,
    inTransit: locations.filter((l) => l.status === 'IN_TRANSIT').length,
    atStops: locations.filter((l) => l.status === 'AT_STOP').length,
    avgSpeed:
      locations.length > 0
        ? Math.round(locations.reduce((sum, l) => sum + l.speed, 0) / locations.length)
        : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Live Bus Telemetry Map</h2>
          <p className="text-gray-600 mt-1">Real-time GPS coordinates, speed telemetry, and student counts via Socket.IO</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-600 animate-pulse' : 'bg-blue-600 animate-ping'
              }`}
            ></span>
            {isConnected ? 'Socket Connected' : 'Simulating Live GPS Streams'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Active Buses</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.activeBuses}</p>
          <p className="text-xs text-gray-500 mt-1">Currently tracked</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">In Transit</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.inTransit}</p>
          <p className="text-xs text-gray-500 mt-1">On active routes</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">At Stops</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.atStops}</p>
          <p className="text-xs text-gray-500 mt-1">Stopped for passenger boarding</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Average Speed</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.avgSpeed} km/h</p>
          <p className="text-xs text-gray-500 mt-1">Across active fleet</p>
        </div>
      </div>

      {/* Live Visualizer Map View */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Campus GPS Visualizer</h3>
          <span className="text-xs text-gray-500">Updated: {lastUpdate}</span>
        </div>

        {/* Map Grid Grid Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <div key={loc.busId} className="p-5 border border-gray-200 rounded-lg space-y-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚌</span>
                  <div>
                    <h4 className="font-bold text-white">{loc.busId}</h4>
                    <p className="text-xs text-slate-400 font-mono">{loc.tripId}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  loc.status === 'IN_TRANSIT' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {loc.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>GPS Coordinates:</span>
                  <span className="font-mono text-emerald-400">{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <span className="font-bold text-amber-400">{loc.speed} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span>Onboard Tally:</span>
                  <span className="font-bold text-purple-400">{loc.totalStudentsOnboard} Students</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700 text-xs text-slate-400">
                <span>Next Stop: </span>
                <span className="font-semibold text-white">{loc.nextStopId || 'Terminal'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
