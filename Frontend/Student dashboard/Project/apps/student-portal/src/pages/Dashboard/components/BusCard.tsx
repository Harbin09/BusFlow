import React from 'react';
import { Bus } from '../../../types';

interface BusCardProps {
  bus: Bus;
}

export const BusCard: React.FC<BusCardProps> = ({ bus }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROACHING':
        return '📍';
      case 'ARRIVED':
        return '✅';
      case 'DEPARTED':
        return '🚌';
      case 'IN_TRANSIT':
        return '🛣️';
      case 'DELAYED':
        return '⏰';
      default:
        return '🚌';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROACHING':
        return 'text-yellow-600';
      case 'ARRIVED':
        return 'text-green-600';
      case 'DEPARTED':
        return 'text-blue-600';
      case 'IN_TRANSIT':
        return 'text-blue-600';
      case 'DELAYED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Bus Number and Status */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-600">Bus Number</p>
          <p className="text-3xl font-bold text-blue-600">{bus.busNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Status</p>
          <p className={`text-lg font-semibold ${getStatusColor(bus.status)}`}>
            {getStatusIcon(bus.status)} {bus.status}
          </p>
        </div>
      </div>

      {/* ETA Section */}
      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
        <p className="text-sm text-gray-600">Estimated Time of Arrival</p>
        <p className="text-2xl font-bold text-blue-600">
          {bus.eta} minutes away
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Expected at: {new Date(bus.etaTime).toLocaleTimeString()}
        </p>
      </div>

      {/* Capacity Section */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-600">Total Seats</p>
          <p className="text-2xl font-bold text-gray-800">
            {bus.capacity.total}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-600">Available</p>
          <p className="text-2xl font-bold text-yellow-600">
            {bus.capacity.available}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-600">Occupied</p>
          <p className="text-2xl font-bold text-red-600">
            {bus.capacity.occupied}
          </p>
        </div>
      </div>

      {/* Capacity Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">Bus Occupancy</p>
          <p className="text-sm text-gray-600">
            {Math.round((bus.capacity.occupied / bus.capacity.total) * 100)}%
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              bus.capacity.available > 0 ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{
              width: `${(bus.capacity.occupied / bus.capacity.total) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Availability Notice */}
      {bus.capacity.available <= 2 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">
            ⚠️ Bus is nearly full. Only {bus.capacity.available} seats
            remaining.
          </p>
        </div>
      )}
    </div>
  );
};
