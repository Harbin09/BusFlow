'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  type?: string;
  status: string;
  createdAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'ALT-001',
      title: 'Heavy Rain Warning',
      message: 'Precipitation expected in South Campus area. Driver advisory issued for Route 2.',
      severity: 'HIGH',
      type: 'WEATHER',
      status: 'UNREAD',
      createdAt: new Date().toLocaleTimeString(),
    },
    {
      id: 'ALT-002',
      title: 'Bus BUS-004 Maintenance Inspection',
      message: 'Routine engine inspection scheduled for vehicle BUS-004 tomorrow.',
      severity: 'MEDIUM',
      type: 'SYSTEM',
      status: 'READ',
      createdAt: new Date(Date.now() - 3600000).toLocaleTimeString(),
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    async function loadAlerts() {
      setLoading(true);
      try {
        const res = await apiClient.get<AlertItem[]>('/api/v1/notifications');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setAlerts(res.data);
        }
      } catch (err) {
        console.warn('Using fallback alerts dataset');
      }
      setLoading(false);
    }
    loadAlerts();
  }, []);

  const handleTriggerRain = async () => {
    setTriggering(true);
    try {
      await apiClient.post('/api/v1/weather/check', {});
      const res = await apiClient.get<AlertItem[]>('/api/v1/notifications');
      if (res.data && Array.isArray(res.data)) {
        setAlerts(res.data);
      }
      alert('🌧️ Rain alert simulation successfully broadcast!');
    } catch (err) {
      // Add local alert
      const newAlert: AlertItem = {
        id: `ALT-${Date.now()}`,
        title: 'Rain Alert Simulation Active',
        message: 'Heavy rainfall warning active. Route speeds reduced across all sectors.',
        severity: 'HIGH',
        type: 'WEATHER',
        status: 'UNREAD',
        createdAt: new Date().toLocaleTimeString(),
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
    setTriggering(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Weather & System Alerts</h2>
          <p className="text-gray-600 mt-1">
            Real-time advisory broadcasts, rain alerts, and system health notifications
          </p>
        </div>
        <button
          onClick={handleTriggerRain}
          disabled={triggering}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-2"
        >
          <span>🌧️</span>
          <span>{triggering ? 'Broadcasting...' : 'Simulate Rain Alert'}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Active Alerts</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{alerts.length} Notifications</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Weather Advisories</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {alerts.filter((a) => a.type === 'WEATHER' || a.severity === 'HIGH').length} Severe
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">System Status</p>
          <p className="text-2xl font-bold text-green-600 mt-1">Operational</p>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-lg">Broadcast History</h3>
          <span className="text-xs text-gray-500">{loading ? 'Syncing...' : 'Live'}</span>
        </div>

        <div className="space-y-3">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-4 rounded-lg border flex items-start gap-4 transition ${
                alt.severity === 'HIGH'
                  ? 'bg-red-50 border-red-200'
                  : alt.severity === 'MEDIUM'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <span className="text-2xl">
                {alt.severity === 'HIGH' ? '⚠️' : alt.severity === 'MEDIUM' ? '🔧' : 'ℹ️'}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900">{alt.title}</h4>
                  <span className="text-xs text-gray-500">{alt.createdAt}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{alt.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
