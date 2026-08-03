'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { dashboardApi } from '@/lib/api';

interface BusStatus {
  id: string;
  routeName: string;
  driverId: string;
  status: 'running' | 'delayed' | 'completed';
  studentsOnBoard: number;
  estimatedArrival: string;
  delayMinutes?: number;
}

interface SpecialEvent {
  id: string;
  name: string;
  date: string;
  routesAffected: number;
  icon: string;
}

interface DashboardSummary {
  activeBuses: number;
  totalStudents: number;
  todaysTrips: number;
  delayedBuses: number;
  weatherStatus: string;
  rsvpCount: number;
  capacity?: number;
  capacityPercentage?: number;
  onTimePercentage?: number;
  busStatuses?: BusStatus[];
  specialEvents?: SpecialEvent[];
}

const MOCK_DASHBOARD: DashboardSummary = {
  activeBuses: 18,
  totalStudents: 1278,
  todaysTrips: 45,
  delayedBuses: 2,
  weatherStatus: 'Partly Cloudy',
  rsvpCount: 892,
  capacity: 856,
  capacityPercentage: 71,
  onTimePercentage: 89,
  busStatuses: [
    {
      id: 'BUS-001',
      routeName: 'Route A (North Campus)',
      driverId: 'Rajesh',
      status: 'running',
      studentsOnBoard: 48,
      estimatedArrival: '08:45 AM',
    },
    {
      id: 'BUS-002',
      routeName: 'Route B (East Campus)',
      driverId: 'Priya',
      status: 'running',
      studentsOnBoard: 42,
      estimatedArrival: '08:52 AM',
    },
    {
      id: 'BUS-004',
      routeName: 'Route D (West Campus)',
      driverId: 'Vikram',
      status: 'delayed',
      studentsOnBoard: 45,
      estimatedArrival: '09:15 AM',
      delayMinutes: 8,
    },
    {
      id: 'BUS-007',
      routeName: 'Route G (Downtown)',
      driverId: 'Anjali',
      status: 'running',
      studentsOnBoard: 50,
      estimatedArrival: '09:05 AM',
    },
  ],
  specialEvents: [
    {
      id: 'evt-001',
      name: 'Campus Fest 2024',
      date: 'Aug 15',
      routesAffected: 3,
      icon: '🎉',
    },
    {
      id: 'evt-002',
      name: 'Sports Day',
      date: 'Aug 22',
      routesAffected: 2,
      icon: '⚽',
    },
  ],
};

export default function AdminOverview() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
    const fetchSummary = async () => {
      setLoading(true);
      const response = await dashboardApi.getSummary();

      if (response.error) {
        setError(response.error);
        setSummary(MOCK_DASHBOARD);
      } else {
        setSummary((response.data as DashboardSummary) || MOCK_DASHBOARD);
        setError(null);
      }
      setLoading(false);
    };

    fetchSummary();
  }, []);

  const kpiCards = [
    {
      label: 'Active Buses',
      value: summary?.activeBuses || 0,
      icon: '🚌',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      unit: 'buses',
    },
    {
      label: 'Total Students',
      value: summary?.totalStudents || 0,
      icon: '👨‍🎓',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      unit: 'students',
    },
    {
      label: "Today's Trips",
      value: summary?.todaysTrips || 0,
      icon: '📍',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      unit: 'trips',
    },
    {
      label: 'Delayed Buses',
      value: summary?.delayedBuses || 0,
      icon: '⚠️',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      unit: 'delayed',
    },
    {
      label: 'Weather Status',
      value: summary?.weatherStatus || 'N/A',
      icon: '🌤️',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      unit: 'conditions',
      isText: true,
    },
    {
      label: 'RSVP Count',
      value: summary?.rsvpCount || 0,
      icon: '✅',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-700',
      unit: 'confirmed',
    },
  ];

  const statusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: string }> = {
      running: { bg: 'bg-green-100', text: 'text-green-700', icon: '▶️' },
      delayed: { bg: 'bg-red-100', text: 'text-red-700', icon: '⏸️' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-700', icon: '✓' },
    };
    const style = styles[status] || styles.running;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <span>{style.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Command Center</h2>
          <p className="text-gray-600 mt-2">
            Real-time fleet monitoring and operational metrics
          </p>
        </div>
        <div className="text-sm text-gray-500" suppressHydrationWarning>
          Last updated: {lastUpdated || 'Loading...'}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-yellow-800 font-medium">Using Demo Data</p>
            <p className="text-yellow-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid - 6 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`${card.bgColor} border ${card.borderColor} rounded-lg p-4 hover:shadow-md transition-all hover:scale-105`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-xs font-semibold text-gray-500 uppercase">{card.unit}</span>
            </div>
            <p className="text-xs text-gray-600 font-medium mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.textColor}`}>
              {loading ? '—' : card.isText ? card.value : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Today's Operational Status Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Today&apos;s Operational Status</h3>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-400 bg-opacity-20 rounded-full text-sm font-medium">
            <span className="inline-block w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
            Live Monitoring
          </span>
        </div>

        {/* Status Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
            <p className="text-blue-100 text-sm mb-1">Fleet Utilization</p>
            <p className="text-2xl font-bold">
              {summary?.capacityPercentage || 71}%
            </p>
            <p className="text-blue-200 text-xs mt-1">
              {summary?.capacity || 856} / {Math.round((summary?.totalStudents || 1278) * 0.67)} capacity
            </p>
          </div>
          <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
            <p className="text-blue-100 text-sm mb-1">On-Time Performance</p>
            <p className="text-2xl font-bold">
              {summary?.onTimePercentage || 89}%
            </p>
            <p className="text-blue-200 text-xs mt-1">
              {summary?.todaysTrips && summary?.delayedBuses
                ? Math.round(((summary.todaysTrips - summary.delayedBuses) / summary.todaysTrips) * 100)
                : 89}% running on schedule
            </p>
          </div>
          <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
            <p className="text-blue-100 text-sm mb-1">Average Delay</p>
            <p className="text-2xl font-bold">
              {summary?.delayedBuses && summary?.delayedBuses > 0 ? '8' : '0'} min
            </p>
            <p className="text-blue-200 text-xs mt-1">
              {summary?.delayedBuses} buses delayed today
            </p>
          </div>
          <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
            <p className="text-blue-100 text-sm mb-1">Weather Impact</p>
            <p className="text-2xl font-bold">{summary?.weatherStatus?.split(' ')[0] || 'Clear'}</p>
            <p className="text-blue-200 text-xs mt-1">
              {summary?.weatherStatus || 'Normal conditions'}
            </p>
          </div>
        </div>

        {/* Active Bus Status */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-3 text-blue-100">Active Buses & Routes</h4>
          <div className="space-y-2">
            {summary?.busStatuses && summary.busStatuses.slice(0, 4).map((bus) => (
              <div key={bus.id} className="flex items-center justify-between bg-white bg-opacity-5 rounded px-3 py-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{bus.routeName}</p>
                  <p className="text-xs text-blue-200">Driver: {bus.driverId} • {bus.studentsOnBoard} aboard</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{bus.estimatedArrival}</p>
                    {bus.delayMinutes && (
                      <p className="text-xs text-red-200">+{bus.delayMinutes} min</p>
                    )}
                  </div>
                  {statusBadge(bus.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Widget Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Special Event Routes Widget */}
        <Link href="/admin/routes" className="group">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                  Special Event Routes
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Upcoming routes with special services
                </p>
              </div>
              <span className="text-3xl">🎪</span>
            </div>

            <div className="space-y-3">
              {summary?.specialEvents && summary.specialEvents.length > 0 ? (
                summary.specialEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg border border-purple-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{event.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{event.name}</p>
                        <p className="text-sm text-gray-600">{event.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-purple-600">
                        {event.routesAffected} routes
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No upcoming special events</p>
                </div>
              )}
            </div>

            <button className="w-full mt-4 py-2 px-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium group-hover:bg-purple-700">
              Manage Routes →
            </button>
          </div>
        </Link>

        {/* Live Tracking Map Widget */}
        <Link href="/admin/tracking" className="group">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Live Tracking Map
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Real-time bus locations and ETAs
                </p>
              </div>
              <span className="text-3xl">📍</span>
            </div>

            <div className="relative h-56 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg overflow-hidden border-2 border-dashed border-blue-200 flex items-center justify-center group-hover:border-blue-400 transition-colors">
              <div className="text-center">
                <div className="text-4xl mb-3 animate-bounce">📍</div>
                <p className="text-blue-700 font-medium mb-1">Interactive Map</p>
                <p className="text-sm text-blue-600">
                  {summary?.activeBuses || 0} buses currently active
                </p>
                <p className="text-xs text-blue-500 mt-2">Click to view live map</p>
              </div>
            </div>

            <button className="w-full mt-4 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium group-hover:bg-blue-700">
              Open Live Map →
            </button>
          </div>
        </Link>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="group flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-transparent border border-blue-200 rounded-lg hover:bg-gradient-to-r hover:from-blue-100 hover:to-transparent transition-colors">
            <span className="text-2xl">📤</span>
            <div className="text-left">
              <p className="font-medium text-blue-900 group-hover:text-blue-600">Upload Students</p>
              <p className="text-xs text-blue-700">Import CSV file</p>
            </div>
          </button>

          <button className="group flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-transparent border border-purple-200 rounded-lg hover:bg-gradient-to-r hover:from-purple-100 hover:to-transparent transition-colors">
            <span className="text-2xl">📅</span>
            <div className="text-left">
              <p className="font-medium text-purple-900 group-hover:text-purple-600">Upload Timetable</p>
              <p className="text-xs text-purple-700">Academic schedule</p>
            </div>
          </button>

          <button className="group flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-50 to-transparent border border-green-200 rounded-lg hover:bg-gradient-to-r hover:from-green-100 hover:to-transparent transition-colors">
            <span className="text-2xl">📢</span>
            <div className="text-left">
              <p className="font-medium text-green-900 group-hover:text-green-600">Broadcast Message</p>
              <p className="text-xs text-green-700">Send notifications</p>
            </div>
          </button>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
        <div className="py-3 border border-gray-200 rounded-lg bg-gray-50">
          <p className="font-semibold text-gray-900">System Uptime</p>
          <p>99.8%</p>
        </div>
        <div className="py-3 border border-gray-200 rounded-lg bg-gray-50">
          <p className="font-semibold text-gray-900">Avg Response</p>
          <p>125ms</p>
        </div>
        <div className="py-3 border border-gray-200 rounded-lg bg-gray-50">
          <p className="font-semibold text-gray-900">Data Freshness</p>
          <p>Real-time</p>
        </div>
      </div>
    </div>
  );
}
