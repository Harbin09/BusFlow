import React, { useState, useEffect } from 'react';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

// Global notification queue
const notificationQueue: Toast[] = [];
let listeners: Array<(notifications: Toast[]) => void> = [];

export const addNotification = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 5000) => {
  const toast: Toast = {
    id: Date.now().toString(),
    title,
    message,
    type,
    duration,
  };

  notificationQueue.push(toast);
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      removeNotification(toast.id);
    }, duration);
  }
};

export const removeNotification = (id: string) => {
  const index = notificationQueue.findIndex((n) => n.id === id);
  if (index > -1) {
    notificationQueue.splice(index, 1);
    notifyListeners();
  }
};

const notifyListeners = () => {
  listeners.forEach((listener) => listener([...notificationQueue]));
};

const subscribeToNotifications = (callback: (notifications: Toast[]) => void) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
};

export const NotificationToast: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(setToasts);
    return unsubscribe;
  }, []);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg ${getTypeStyles(toast.type)} animate-slide-in`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl mt-1">{getTypeIcon(toast.type)}</span>
            <div className="flex-1">
              <h3 className="font-semibold">{toast.title}</h3>
              <p className="text-sm opacity-90">{toast.message}</p>
            </div>
            <button
              onClick={() => removeNotification(toast.id)}
              className="text-xl opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
