import React from 'react';
import { Notification } from '../../../types';

interface NotificationsCardProps {
  notifications: Notification[];
}

export const NotificationsCard: React.FC<NotificationsCardProps> = ({
  notifications,
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ROUTE_UPDATE':
        return '📋';
      case 'DELAY_ALERT':
        return '⏰';
      case 'CAPACITY_WARNING':
        return '🚌';
      case 'RETURN_TRIP':
        return '🔄';
      case 'SYSTEM_ALERT':
        return '⚠️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ROUTE_UPDATE':
        return 'bg-blue-50 border-blue-200';
      case 'DELAY_ALERT':
        return 'bg-red-50 border-red-200';
      case 'CAPACITY_WARNING':
        return 'bg-yellow-50 border-yellow-200';
      case 'RETURN_TRIP':
        return 'bg-green-50 border-green-200';
      case 'SYSTEM_ALERT':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`border-l-4 rounded-lg p-4 ${getNotificationColor(
            notification.type || 'SYSTEM_ALERT',
          )}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">{getNotificationIcon(notification.type || 'SYSTEM_ALERT')}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-800">
                  {notification.title}
                </h4>
                <span className="text-xs text-gray-500">
                  {formatTime(notification.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{notification.message}</p>
              {notification.actionUrl && (
                <button className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800">
                  → View Details
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}
