import React, { useState } from 'react';

interface MissedStudent {
  id: string;
  studentNo: string;
  name: string;
  program: string;
  semester: string;
  pickupStop: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  alternateStop?: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  status: 'MISSED' | 'BOARDED_ALTERNATE' | 'RESOLVED';
}

interface Props {
  students: MissedStudent[];
  onRefresh: () => void;
}

export const MissedBusStudents: React.FC<Props> = ({ students, onRefresh }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'MISSED':
        return 'bg-yellow-100 text-yellow-800';
      case 'BOARDED_ALTERNATE':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'MISSED':
        return '⚠️';
      case 'BOARDED_ALTERNATE':
        return '✅';
      case 'RESOLVED':
        return '🎉';
      default:
        return '📋';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-yellow-50 border-l-4 border-yellow-400">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              ⚠️ Students Who Missed Primary Bus
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {students.length} student(s) boarding alternate bus
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="divide-y">
        {students.map((student) => (
          <div key={student.id} className="p-6 hover:bg-gray-50 transition">
            {/* Header */}
            <div
              onClick={() => setExpandedId(expandedId === student.id ? null : student.id)}
              className="cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getStatusIcon(student.status)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">
                        ID: {student.studentNo} • {student.program} - Sem {student.semester}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(student.status)}`}>
                    {student.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-2xl">
                  {expandedId === student.id ? '▼' : '▶'}
                </span>
              </div>
            </div>

            {/* Detailed Info (Expanded) */}
            {expandedId === student.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                {/* Original Pickup Stop */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">📍 Original Pickup Stop</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Stop Name:</span> {student.pickupStop.name}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Coordinates:</span>{' '}
                      {student.pickupStop.latitude.toFixed(4)},
                      {student.pickupStop.longitude.toFixed(4)}
                    </p>
                    <div className="mt-2 text-xs text-red-600">
                      ❌ Student was not at this stop
                    </div>
                  </div>
                </div>

                {/* Allocated/Chosen Alternate Stop */}
                {student.alternateStop && (
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-semibold text-gray-900 mb-2">🚌 New Boarding Stop (Alternate Bus)</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Stop Name:</span> {student.alternateStop.name}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Coordinates:</span>{' '}
                        {student.alternateStop.latitude.toFixed(4)},
                        {student.alternateStop.longitude.toFixed(4)}
                      </p>
                      {student.status === 'BOARDED_ALTERNATE' && (
                        <div className="mt-2 text-sm text-green-600 font-medium">
                          ✅ Student is boarding at this stop
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Student Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">STUDENT ID</label>
                    <p className="text-sm text-gray-900 font-medium mt-1">{student.studentNo}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">PROGRAM</label>
                    <p className="text-sm text-gray-900 font-medium mt-1">{student.program}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">SEMESTER</label>
                    <p className="text-sm text-gray-900 font-medium mt-1">
                      {student.semester}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">STATUS</label>
                    <p className="text-sm text-gray-900 font-medium mt-1">
                      {student.status === 'BOARDED_ALTERNATE' ? '🟢 Onboard' : '⏳ Waiting'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {student.status === 'BOARDED_ALTERNATE' && (
                    <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                      ✅ Confirm Boarding
                    </button>
                  )}
                  <button className="flex-1 px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                    📞 Contact Student
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {students.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p className="text-sm">No students have missed their primary bus</p>
        </div>
      )}
    </div>
  );
};
