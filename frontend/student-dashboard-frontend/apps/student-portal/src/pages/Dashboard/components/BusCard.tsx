import React from 'react';
import { Bus } from '../../../types';

interface BusCardProps {
  bus: Bus;
}

export const BusCard: React.FC<BusCardProps> = ({ bus }) => {
  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
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
    switch (status.toUpperCase()) {
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

  const etaMinutes = bus.eta ? Math.ceil(bus.eta / 60) : null;

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
        {bus.etaTime ? (
          <>
            <p className="text-2xl font-bold text-blue-600">{bus.etaTime}</p>
            {etaMinutes && (
              <p className="text-sm text-gray-600 mt-1">
                In approximately {etaMinutes} {etaMinutes === 1 ? 'minute' : 'minutes'}
              </p>
            )}
          </>
        ) : etaMinutes ? (
          <p className="text-2xl font-bold text-blue-600">
            {etaMinutes} {etaMinutes === 1 ? 'minute' : 'minutes'} away
          </p>
        ) : (
          <p className="text-2xl font-bold text-blue-600">Calculating...</p>
        )}
      </div>

      {/* Bus Details Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Bus Number</p>
          <p className="text-xl font-bold text-gray-800">{bus.busNumber}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Plate Number</p>
          <p className="text-xl font-bold text-gray-800">{bus.plateNumber}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Capacity</p>
          <p className="text-xl font-bold text-yellow-600">{bus.capacity} seats</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Status</p>
          <p className="text-xl font-bold text-blue-600">{bus.status}</p>
        </div>
      </div>

      {/* Location Info */}
      {bus.currentLocation && (
        <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Current Location</p>
          <p className="text-sm text-green-700 mt-1">
            📍 Latitude: {bus.currentLocation.latitude.toFixed(4)}
          </p>
          <p className="text-sm text-green-700">
            📍 Longitude: {bus.currentLocation.longitude.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
};
