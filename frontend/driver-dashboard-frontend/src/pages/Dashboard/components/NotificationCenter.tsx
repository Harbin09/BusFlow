import React, { useEffect, useState } from 'react';
import { driverApi } from '../../../services/api/driverApi';

interface Notification {
  id: string;
  message: string;
  type: string;
  readAt?: string;
  createdAt: string;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await driverApi.getDriverNotifications(5);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-400">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">🔔 Recent Alerts</h2>
          <a href="/notifications" className="text-sm text-blue-600 hover:text-blue-800">
            View all →
          </a>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <p className="text-sm">No alerts at the moment</p>
        </div>
      ) : (
        <>
          <div className="divide-y">
            {displayedNotifications.map((notif) => (
              <div key={notif.id} className="px-6 py-4 hover:bg-gray-50 border-l-4 border-transparent">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📢</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notif.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {notifications.length > 3 && !showAll && (
            <div className="px-6 py-3 bg-gray-50 text-center">
              <button
                onClick={() => setShowAll(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
              >
                Show {notifications.length - 3} more notifications
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
