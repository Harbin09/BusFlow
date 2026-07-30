import React from 'react';
import { Bus } from '../../../types';

interface TodaysBusCardProps {
  bus: Bus;
  onTrackClick: () => void;
}

export const TodaysBusCard: React.FC<TodaysBusCardProps> = ({
  bus,
  onTrackClick,
}) => {
  const getOccupancyStatus = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return { status: 'Seats Available', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage > 25) return { status: 'Seats Limited', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { status: 'Nearly Full', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const occupancy = getOccupancyStatus(bus.capacity.available, bus.capacity.total);
  const occupancyPercentage = ((bus.capacity.occupied / bus.capacity.total) * 100).toFixed(0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-blue-600">
      {/* Bus Number and Route */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 font-medium">YOUR BUS TODAY</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-blue-600">{bus.busNumber}</h3>
            <span className="text-lg text-gray-600">Bus</span>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              bus.status === 'APPROACHING'
                ? 'bg-orange-100 text-orange-700'
                : bus.status === 'ARRIVED'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
            }`}
          >
            {bus.status === 'APPROACHING'
              ? '🚌 Approaching'
              : bus.status === 'ARRIVED'
                ? '✅ Arrived'
                : '📍 ' + bus.status}
          </span>
        </div>
      </div>

      {/* ETA Section - Highlighted */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 mb-4 border border-blue-100">
        <p className="text-xs text-gray-600 font-medium mb-1">ESTIMATED ARRIVAL</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {bus.eta} <span className="text-sm text-gray-600">min</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Expected: {new Date(bus.etaTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="text-4xl">⏱️</div>
        </div>
      </div>

      {/* Occupancy Status */}
      <div className={`${occupancy.bg} rounded-lg p-4 mb-4`}>
        <p className="text-xs text-gray-600 font-medium mb-2">OCCUPANCY STATUS</p>
        <div className="flex items-center justify-between mb-3">
          <span className={`font-semibold ${occupancy.color}`}>
            {occupancy.status}
          </span>
          <span className="text-sm font-bold text-gray-800">
            {occupancyPercentage}% Full
          </span>
        </div>

        {/* Occupancy Bar */}
        <div className="w-full bg-white rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              bus.capacity.available > bus.capacity.total * 0.5
                ? 'bg-green-500'
                : bus.capacity.available > bus.capacity.total * 0.25
                  ? 'bg-orange-500'
                  : 'bg-red-500'
            }`}
            style={{
              width: `${occupancyPercentage}%`,
            }}
          ></div>
        </div>

        {/* Seat Details */}
        <div className="flex justify-between mt-3 text-xs">
          <div>
            <p className="text-gray-600">Occupied</p>
            <p className="font-bold text-gray-800">{bus.capacity.occupied}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Total</p>
            <p className="font-bold text-gray-800">{bus.capacity.total}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Available</p>
            <p className={`font-bold ${occupancy.color}`}>
              {bus.capacity.available}
            </p>
          </div>
        </div>
      </div>

      {/* Track Bus Button */}
      <button
        onClick={onTrackClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <span>📍</span> Track My Bus
      </button>

      {/* Warning if bus is nearly full */}
      {bus.capacity.available <= 2 && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2">
          <p className="text-xs text-red-700">
            ⚠️ Bus is nearly full. Only {bus.capacity.available} seat
            {bus.capacity.available !== 1 ? 's' : ''} remaining.
          </p>
        </div>
      )}
    </div>
  );
};
