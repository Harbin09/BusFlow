import React, { useEffect, useState } from 'react';
import { studentApi } from '../../../services/api/studentApi';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'DELAY' | 'STATUS_UPDATE' | 'ALERT' | 'GENERAL';
  readAt?: string;
  createdAt: string;
}

export const NotificationHistory: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'DELAY' | 'ALERT'>('ALL');

  useEffect(() => {
    fetchNotificationHistory();
  }, []);

  const fetchNotificationHistory = async () => {
    try {
      const data = await studentApi.getNotificationHistory(50);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notification history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'DELAY':
        return 'bg-yellow-100 text-yellow-800';
      case 'ALERT':
        return 'bg-red-100 text-red-800';
      case 'STATUS_UPDATE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'DELAY':
        return '⏱️';
      case 'ALERT':
        return '🚨';
      case 'STATUS_UPDATE':
        return '📊';
      default:
        return '📢';
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'UNREAD') return !notif.readAt;
    if (filter === 'DELAY') return notif.type === 'DELAY';
    if (filter === 'ALERT') return notif.type === 'ALERT';
    return true;
  });

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Notification History</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'UNREAD', 'DELAY', 'ALERT'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f === 'ALL' ? 'All' : f === 'UNREAD' ? 'Unread' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No notifications to display</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg border-l-4 ${
                notif.readAt ? 'bg-gray-50 border-gray-300' : 'bg-white border-blue-500 shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getTypeIcon(notif.type)}</span>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(notif.type)}`}>
                      {notif.type.replace(/_/g, ' ')}
                    </span>
                    {!notif.readAt && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                  </div>
                  <p className="text-gray-700 mb-2">{notif.message}</p>
                  <p className="text-xs text-gray-500">{formatTime(notif.createdAt)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
