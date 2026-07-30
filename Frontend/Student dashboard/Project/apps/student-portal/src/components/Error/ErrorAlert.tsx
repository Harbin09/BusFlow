import React from 'react';
import { ApiError } from '../../types';

interface ErrorAlertProps {
  error: ApiError;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onRetry }) => {
  const getErrorIcon = () => {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return '📡';
      case 'NOT_FOUND':
        return '🔍';
      case 'UNAUTHORIZED':
        return '🔐';
      case 'SERVER_ERROR':
        return '⚠️';
      default:
        return '❌';
    }
  };

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
      <div className="flex items-start">
        <span className="text-2xl mr-3">{getErrorIcon()}</span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800">
            {getErrorMessage(error.code)}
          </h3>
          <p className="text-red-700 mt-1">{error.message}</p>
          {error.details && (
            <pre className="text-xs text-red-600 mt-2 bg-white p-2 rounded overflow-auto">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  icon: string;
  title: string;
  message: string;
}> = ({ icon, title, message }) => (
  <div className="text-center py-8">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    <p className="text-gray-600 mt-1">{message}</p>
  </div>
);

function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    NETWORK_ERROR: 'Connection Error',
    NOT_FOUND: 'Not Found',
    UNAUTHORIZED: 'Authentication Error',
    SERVER_ERROR: 'Server Error',
    TIMEOUT: 'Request Timeout',
  };
  return messages[code] || 'Error Loading Data';
}
