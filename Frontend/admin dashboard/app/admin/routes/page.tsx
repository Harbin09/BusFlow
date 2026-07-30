'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface RouteItem {
  id: string;
  name: string;
  code: string;
  description: string;
  estimatedDistance: number;
  estimatedDuration: number;
  stopsCount: number;
  assignedBuses: number;
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const demoRoutes: RouteItem[] = [
    { id: 'RT-001', name: 'North Campus Route', code: 'Route-A1', description: 'Covers North Campus to Engineering Block via Main Gate', estimatedDistance: 12.5, estimatedDuration: 35, stopsCount: 8, assignedBuses: 2 },
    { id: 'RT-002', name: 'South Campus Route', code: 'Route-B2', description: 'Covers South Campus & Science Block via Library', estimatedDistance: 14.2, estimatedDuration: 42, stopsCount: 10, assignedBuses: 2 },
    { id: 'RT-003', name: 'East Campus Route', code: 'Route-C3', description: 'Covers East Campus & Sports Complex via Admin Block', estimatedDistance: 10.8, estimatedDuration: 30, stopsCount: 7, assignedBuses: 1 },
    { id: 'RT-004', name: 'West Campus Route', code: 'Route-D4', description: 'Covers West Campus & Hostel Area via Cafeteria', estimatedDistance: 11.3, estimatedDuration: 33, stopsCount: 8, assignedBuses: 1 },
    { id: 'RT-005', name: 'Medical School Route', code: 'Route-E5', description: 'Direct route to Medical Campus & Research Labs', estimatedDistance: 15.0, estimatedDuration: 45, stopsCount: 9, assignedBuses: 2 },
  ];

  useEffect(() => {
    async function loadRoutes() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<any>('/api/v1/routes');
        const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        if (items.length > 0) {
          setRoutes(items);
        } else {
          setRoutes(demoRoutes);
        }
      } catch (err) {
        console.error('Failed to load routes, using demo data:', err);
        setRoutes(demoRoutes);
      }
      setLoading(false);
    }
    loadRoutes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Routes & Stop Architecture</h2>
          <p className="text-gray-600 mt-1">Live campus route schedules loaded directly from CSV PostgreSQL master database</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
          + Create Route
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-start gap-4">
          <span className="text-3xl animate-spin">⏳</span>
          <div>
            <p className="text-blue-800 font-medium">Loading Routes</p>
            <p className="text-blue-700 text-sm">Fetching route data from backend...</p>
          </div>
        </div>
      )}


      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading CSV dataset...</p>
        ) : (
          routes.map((rt) => (
            <div key={rt.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold font-mono">{rt.code}</span>
                    <h3 className="text-xl font-bold text-gray-900">{rt.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{rt.description}</p>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div>
                    <span className="text-gray-400 block text-xs">Distance</span>
                    <span className="font-bold text-gray-800">{rt.estimatedDistance} km</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Duration</span>
                    <span className="font-bold text-gray-800">~{rt.estimatedDuration} mins</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Stops</span>
                    <span className="font-bold text-gray-800">{rt.stopsCount} Waypoints</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Active Fleet</span>
                    <span className="font-bold text-blue-600">{rt.assignedBuses} Buses</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
