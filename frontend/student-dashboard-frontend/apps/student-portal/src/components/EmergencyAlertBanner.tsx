import React, { useState, useEffect } from 'react';

interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
}

export const EmergencyAlertBanner: React.FC = () => {
  const [alert, setAlert] = useState<EmergencyAlert | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check localStorage for emergency alerts
    const checkForAlerts = () => {
      const alerts = JSON.parse(localStorage.getItem('emergencyAlerts') || '[]');
      if (alerts.length > 0) {
        setAlert(alerts[0]); // Show the most recent alert
        setIsVisible(true);
      }
    };

    checkForAlerts();

    // Poll for new alerts every 2 seconds
    const interval = setInterval(checkForAlerts, 2000);

    // Listen for storage changes (alerts from other tabs/windows)
    window.addEventListener('storage', checkForAlerts);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkForAlerts);
    };
  }, []);

  if (!alert || !isVisible) return null;

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-600 text-white border-red-800';
      case 'HIGH':
        return 'bg-orange-500 text-white border-orange-700';
      case 'MEDIUM':
        return 'bg-yellow-500 text-white border-yellow-700';
      case 'LOW':
        return 'bg-blue-500 text-white border-blue-700';
      default:
        return 'bg-gray-600 text-white border-gray-800';
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
    <div className={`${getSeverityStyles(alert.severity)} border-l-4 p-4 rounded-lg shadow-lg animate-pulse`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-3xl flex-shrink-0">{getSeverityIcon(alert.severity)}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg">{alert.title}</h3>
            <p className="text-sm mt-1 opacity-90">{alert.message}</p>
            <p className="text-xs mt-2 opacity-75">Severity: {alert.severity} • {alert.timestamp}</p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 text-2xl opacity-75 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
