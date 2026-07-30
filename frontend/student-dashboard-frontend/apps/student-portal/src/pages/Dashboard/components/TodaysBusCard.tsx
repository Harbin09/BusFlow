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
  const getStatusDisplay = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROACHING':
        return { icon: '🚌', label: 'Approaching', bg: 'bg-orange-100', text: 'text-orange-700' };
      case 'ARRIVED':
        return { icon: '✅', label: 'Arrived', bg: 'bg-green-100', text: 'text-green-700' };
      case 'IN_TRANSIT':
        return { icon: '🚌', label: 'In Transit', bg: 'bg-blue-100', text: 'text-blue-700' };
      case 'DELAYED':
        return { icon: '⏸️', label: 'Delayed', bg: 'bg-red-100', text: 'text-red-700' };
      default:
        return { icon: '📍', label: status, bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const statusDisplay = getStatusDisplay(bus.status);
  const etaMinutes = bus.eta ? Math.ceil(bus.eta / 60) : null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-blue-600">
      {/* Bus Number and Status */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 font-medium">YOUR BUS TODAY</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-blue-600">{bus.busNumber}</h3>
            <span className="text-lg text-gray-600">Bus</span>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusDisplay.bg} ${statusDisplay.text}`}>
            {statusDisplay.icon} {statusDisplay.label}
          </span>
        </div>
      </div>

      {/* ETA Section - Highlighted */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 mb-4 border border-blue-100">
        <p className="text-xs text-gray-600 font-medium mb-1">ESTIMATED ARRIVAL</p>
        <div className="flex items-center justify-between">
          <div>
            {bus.etaTime ? (
              <>
                <p className="text-2xl font-bold text-blue-600">{bus.etaTime}</p>
                {etaMinutes && (
                  <p className="text-xs text-gray-600 mt-1">
                    In approximately {etaMinutes} {etaMinutes === 1 ? 'minute' : 'minutes'}
                  </p>
                )}
              </>
            ) : etaMinutes ? (
              <>
                <p className="text-2xl font-bold text-blue-600">
                  {etaMinutes} <span className="text-sm text-gray-600">min</span>
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-blue-600">Calculating...</p>
            )}
          </div>
          <div className="text-4xl">⏱️</div>
        </div>
      </div>

      {/* Bus Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-xs text-gray-600 font-medium mb-3">BUS DETAILS</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600">Bus Number</p>
            <p className="font-bold text-gray-800">{bus.busNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Plate Number</p>
            <p className="font-bold text-gray-800">{bus.plateNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Capacity</p>
            <p className="font-bold text-gray-800">{bus.capacity} seats</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Status</p>
            <p className="font-bold text-gray-800">{bus.status}</p>
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
    </div>
  );
};
