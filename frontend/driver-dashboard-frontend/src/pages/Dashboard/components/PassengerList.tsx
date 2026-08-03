import React from 'react';

interface PassengerListProps {
  passengers: any[];
  onRefresh: () => void;
}

export const PassengerList: React.FC<PassengerListProps> = ({ passengers, onRefresh }) => {
  const boarded = passengers.filter((p) => p.status === 'BOARDED');
  const boarding = passengers.filter((p) => p.status === 'BOARDING');

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-400">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">👥 Passenger List</h2>
            <p className="text-sm text-gray-600 mt-1">
              {boarded.length} boarded • {boarding.length} boarding soon
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Boarding Soon */}
      {boarding.length > 0 && (
        <div className="border-b">
          <div className="px-6 py-3 bg-yellow-50 border-b">
            <h3 className="font-semibold text-gray-900 text-sm">
              ⏳ Boarding Soon ({boarding.length})
            </h3>
          </div>
          <div className="divide-y">
            {boarding.map((passenger) => (
              <div key={passenger.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-900">{passenger.name}</p>
                  <p className="text-sm text-gray-600">{passenger.studentNo}</p>
                </div>
                <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-semibold rounded">
                  📍 Waiting at stop
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Already Boarded */}
      {boarded.length > 0 && (
        <div>
          <div className="px-6 py-3 bg-green-50 border-b">
            <h3 className="font-semibold text-gray-900 text-sm">
              ✅ Boarded ({boarded.length})
            </h3>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {boarded.map((passenger) => (
              <div key={passenger.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-900">{passenger.name}</p>
                  <p className="text-sm text-gray-600">{passenger.studentNo}</p>
                </div>
                <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded">
                  ✅ Onboard
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {passengers.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>No passengers assigned for this trip</p>
        </div>
      )}
    </div>
  );
};
