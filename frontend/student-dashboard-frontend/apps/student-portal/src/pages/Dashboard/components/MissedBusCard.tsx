import React from 'react';
import { MissedBus } from '../../../types';

interface MissedBusCardProps {
  missedBus: MissedBus;
  credits: number;
}

export const MissedBusCard: React.FC<MissedBusCardProps> = ({
  missedBus,
  credits,
}) => {
  const creditPercentage = (credits / 100) * 100;

  return (
    <div className="space-y-4">
      {/* Warning Notice */}
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
        <h3 className="font-semibold text-red-800 mb-2">
          ⚠️ Missed Bus Alert
        </h3>
        <p className="text-sm text-red-700">
          You missed bus {missedBus.busNumber} on route{' '}
          {missedBus.routeName}
        </p>
        <p className="text-xs text-red-600 mt-2">
          Missed at: {new Date(missedBus.missedAt).toLocaleString()}
        </p>
      </div>

      {/* Bus Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Bus Number</p>
          <p className="text-xl font-bold text-gray-800">
            {missedBus.busNumber}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Route</p>
          <p className="text-xl font-bold text-gray-800">
            {missedBus.routeName}
          </p>
        </div>
      </div>

      {/* Credits Deducted */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-2">Credits Deducted</p>
        <p className="text-3xl font-bold text-yellow-600">
          -{missedBus.creditsDeducted}
        </p>
        <p className="text-xs text-gray-600 mt-2">
          One credit is deducted each time you miss a bus
        </p>
      </div>

      {/* Current Credit Balance */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-2">Current Credit Balance</p>
        <p className="text-3xl font-bold text-blue-600">{credits}</p>

        {/* Credit Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                credits > 50
                  ? 'bg-green-500'
                  : credits > 20
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(creditPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Credit Warning */}
        {credits <= 20 && (
          <p className="text-xs text-red-600 mt-2">
            ⚠️ You're running low on credits. Please be on time for your next bus.
          </p>
        )}
      </div>

      {/* What Happens */}
      <div className="bg-red-50 rounded-lg p-4">
        <p className="font-semibold text-red-800 mb-2">What Happens:</p>
        <ul className="text-sm text-red-700 space-y-1">
          <li>✓ One credit is deducted from your account</li>
          <li>✓ You cannot take the same bus trip twice in a day</li>
          <li>✓ Excessive missed buses may result in account suspension</li>
        </ul>
      </div>

      {/* Action */}
      <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
        → Learn More About Credits
      </button>
    </div>
  );
};
