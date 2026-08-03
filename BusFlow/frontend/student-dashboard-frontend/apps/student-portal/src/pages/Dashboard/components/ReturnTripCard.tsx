import React from 'react';
import { Trip, Bus } from '../../../types';

interface ReturnTripCardProps {
  trip: Trip;
  bus: Bus;
}

export const ReturnTripCard: React.FC<ReturnTripCardProps> = ({ trip, bus }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          label: 'Scheduled',
          icon: '📅',
        };
      case 'BOARDING':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Boarding',
          icon: '✈️',
        };
      case 'COMPLETED':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: 'Completed',
          icon: '✅',
        };
      case 'CANCELLED':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Cancelled',
          icon: '❌',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: status,
          icon: '📌',
        };
    }
  };

  const badge = getStatusBadge(trip.status);

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <span className={`${badge.bg} ${badge.text} px-4 py-2 rounded-full font-semibold text-sm`}>
          {badge.icon} {badge.label}
        </span>
      </div>

      {/* Return Time */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border-l-4 border-orange-500">
        <p className="text-sm text-gray-600">Return Journey Time</p>
        <p className="text-2xl font-bold text-orange-600">
          {new Date(trip.scheduledTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {new Date(trip.scheduledTime).toLocaleDateString()}
        </p>
      </div>

      {/* Route Information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Pickup Stop</p>
          <p className="font-semibold text-gray-800 text-sm">
            {trip.pickupStop
              ? typeof trip.pickupStop === 'string'
                ? trip.pickupStop
                : trip.pickupStop.stopName
              : 'TBD'}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Dropping Stop</p>
          <p className="font-semibold text-gray-800 text-sm">
            {trip.droppingStop
              ? typeof trip.droppingStop === 'string'
                ? trip.droppingStop
                : trip.droppingStop.stopName
              : 'TBD'}
          </p>
        </div>
      </div>

      {/* Bus Information for Return Trip */}
      <div className="bg-purple-50 rounded-lg p-3">
        <p className="text-xs text-gray-600">Bus for Return Journey</p>
        <p className="font-semibold text-purple-600 text-lg">
          {bus.busNumber}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Status: {bus.status} • Capacity: {bus.capacity} seats
        </p>
      </div>

      {/* Timeline */}
      <div className="border-l-2 border-orange-300 pl-4 py-2">
        <div className="relative">
          <div className="absolute -left-6 w-3 h-3 bg-orange-500 rounded-full mt-1.5"></div>
          <p className="text-sm font-semibold text-gray-800">Scheduled</p>
          <p className="text-xs text-gray-600">
            {new Date(trip.scheduledTime).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          💡 The return journey will take you back to your pickup location
        </p>
      </div>
    </div>
  );
};
