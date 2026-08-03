import React from 'react';
import { Stop } from '../../../types';

interface PickupPointCardProps {
  pickupPoint: Stop;
  tripTime?: string;
}

export const PickupPointCard: React.FC<PickupPointCardProps> = ({
  pickupPoint,
  tripTime,
}) => {
  const getTimeRemaining = () => {
    if (!tripTime) return null;
    const now = new Date();
    const trip = new Date(tripTime);
    const diff = trip.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className="space-y-4">
      {/* Stop Name */}
      <div className="flex items-start gap-3">
        <div className="text-3xl">📍</div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">Pickup Stop</p>
          <p className="text-2xl font-bold text-gray-800">
            {pickupPoint.stopName}
          </p>
        </div>
      </div>

      {/* Time Information */}
      {tripTime && (
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Pickup Time</p>
              <p className="text-lg font-semibold text-blue-600">
                {new Date(tripTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {timeRemaining && (
              <div>
                <p className="text-sm text-gray-600">Time Remaining</p>
                <p className="text-lg font-semibold text-orange-600">
                  {timeRemaining}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location Details */}
      {(pickupPoint.latitude || pickupPoint.longitude) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            {pickupPoint.latitude && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Latitude</p>
                <p className="text-sm font-mono text-gray-700">
                  {pickupPoint.latitude.toFixed(4)}
                </p>
              </div>
            )}
            {pickupPoint.longitude && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Longitude</p>
                <p className="text-sm font-mono text-gray-700">
                  {pickupPoint.longitude.toFixed(4)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stop Order */}
      {pickupPoint.stopOrder && (
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Stop Number</p>
          <p className="text-2xl font-bold text-purple-600">
            #{pickupPoint.stopOrder}
          </p>
        </div>
      )}

      {/* Reminder */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-700">
          ⏰ Please be at the pickup point at least 5 minutes early
        </p>
      </div>
    </div>
  );
};
