import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
}

export const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<EmergencyAlert[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  useEffect(() => {
    loadAlerts();
    // Poll for new alerts every 3 seconds
    const interval = setInterval(loadAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, severityFilter]);

  const loadAlerts = () => {
    const storedAlerts = JSON.parse(localStorage.getItem('emergencyAlerts') || '[]');
    setAlerts(storedAlerts);
  };

  const filterAlerts = () => {
    if (severityFilter === 'ALL') {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter((a) => a.severity === severityFilter));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-50 border-l-4 border-red-500 text-red-900';
      case 'HIGH':
        return 'bg-orange-50 border-l-4 border-orange-500 text-orange-900';
      case 'MEDIUM':
        return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900';
      case 'LOW':
        return 'bg-blue-50 border-l-4 border-blue-500 text-blue-900';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500 text-gray-900';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return '🚨';
      case 'HIGH':
        return '⚠️';
      case 'MEDIUM':
        return '⚡';
      case 'LOW':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 md:p-8 shadow-md">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">📢 Emergency Alerts</h1>
              <p className="text-blue-100 mt-2">
                Real-time notifications and emergency updates from the admin
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg font-semibold transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filter Alerts</h3>
          <div className="flex flex-wrap gap-2">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => (
              <button
                key={severity}
                onClick={() => setSeverityFilter(severity)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  severityFilter === severity
                    ? severity === 'ALL'
                      ? 'bg-gray-700 text-white'
                      : `${getSeverityBadge(severity)} ring-2 ring-offset-2`
                    : `${getSeverityBadge(severity)} opacity-50 hover:opacity-100`
                }`}
              >
                {severity === 'ALL' ? '📋 All' : `${getSeverityIcon(severity)} ${severity}`}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-gray-600 text-sm mb-1">Total Alerts</p>
            <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-md p-4 text-center border-l-4 border-red-500">
            <p className="text-red-600 text-sm mb-1">🚨 Critical</p>
            <p className="text-3xl font-bold text-red-900">{alerts.filter((a) => a.severity === 'CRITICAL').length}</p>
          </div>
          <div className="bg-orange-50 rounded-lg shadow-md p-4 text-center border-l-4 border-orange-500">
            <p className="text-orange-600 text-sm mb-1">⚠️ High</p>
            <p className="text-3xl font-bold text-orange-900">{alerts.filter((a) => a.severity === 'HIGH').length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4 text-center border-l-4 border-yellow-500">
            <p className="text-yellow-600 text-sm mb-1">⚡ Medium</p>
            <p className="text-3xl font-bold text-yellow-900">{alerts.filter((a) => a.severity === 'MEDIUM').length}</p>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`${getSeverityColor(alert.severity)} rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-4xl flex-shrink-0">{getSeverityIcon(alert.severity)}</span>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold">{alert.title}</h3>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-base leading-relaxed mb-4 mt-3">{alert.message}</p>

                <div className="flex items-center justify-between pt-4 border-t border-current border-opacity-20">
                  <p className="text-sm opacity-75">
                    🕐 Received: <span className="font-semibold">{alert.timestamp}</span>
                  </p>
                  <p className="text-xs font-mono opacity-75">ID: {alert.id.slice(0, 12)}...</p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-4xl mb-4">✨</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Alerts</h3>
              <p className="text-gray-600">
                {severityFilter === 'ALL'
                  ? 'No emergency alerts at the moment. Stay safe!'
                  : `No ${severityFilter} severity alerts.`}
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h4 className="font-bold text-blue-900 mb-2">📌 About Emergency Alerts</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Emergency alerts are broadcast by the admin in real-time</li>
            <li>✓ Severity levels: LOW | MEDIUM | HIGH | CRITICAL</li>
            <li>✓ Alerts also appear as banner notifications on your dashboard</li>
            <li>✓ Check this page regularly for the latest emergency information</li>
            <li>✓ Alerts are automatically refreshed every few seconds</li>
          </ul>
        </div>
      </main>
    </div>
  );
};
