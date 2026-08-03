import React from 'react';

interface BusStatusCardProps {
  bus: any;
  lastUpdate: string;
}

export const BusStatusCard: React.FC<BusStatusCardProps> = ({ bus, lastUpdate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Bus Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚌 Assigned Bus</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Bus Number</label>
            <p className="text-2xl font-bold text-blue-600">{bus.plateNumber || bus.id}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Capacity</label>
            <p className="text-lg font-semibold text-gray-900">{bus.capacity} seats</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Status</label>
            <p className={`text-lg font-semibold ${bus.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'}`}>
              {bus.status === 'ACTIVE' ? '🟢 Active' : '⚪ Inactive'}
            </p>
          </div>
        </div>
      </div>

      {/* Location & Time */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Location Status</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">GPS Status</label>
            <p className="text-lg font-semibold text-green-600">🟢 Active (Auto-updating every 10s)</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Last Updated</label>
            <p className="text-lg font-semibold text-gray-900">
              {lastUpdate ? lastUpdate : 'Not yet updated'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Update Frequency</label>
            <p className="text-lg font-semibold text-gray-900">⏱️ Every 10 seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
};
