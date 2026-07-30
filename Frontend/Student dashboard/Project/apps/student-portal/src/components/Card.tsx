import React from 'react';
import { CardProps } from '../types';
import { LoadingSpinner } from './Loading/LoadingSpinner';
import { ErrorAlert } from './Error/ErrorAlert';

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  loading = false,
  error = null,
  onRetry,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[100px]">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorAlert error={error} onRetry={onRetry} />
        ) : (
          children
        )}
      </div>
    </div>
  );
};
