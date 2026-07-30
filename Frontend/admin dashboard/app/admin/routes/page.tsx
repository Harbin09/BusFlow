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
          setError('No routes found');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load routes';
        setError(errorMsg);
        console.error('Failed to load routes:', err);
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

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
          <span className="text-3xl">❌</span>
          <div>
            <p className="text-red-800 font-medium">Error Loading Routes</p>
            <p className="text-red-700 text-sm">{error}</p>
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
