'use client';

export default function RouteComparePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Route Comparison</h2>
          <p className="text-gray-600 mt-2">Compare route efficiency and analytics</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
        <div className="flex items-start gap-4">
          <span className="text-4xl">⚠️</span>
          <div>
            <h3 className="text-xl font-bold text-yellow-900 mb-2">Backend API Not Available</h3>
            <p className="text-yellow-800 mb-3">Analytics endpoints don&apos;t exist in the current backend.</p>
            <p className="text-sm text-yellow-700"><strong>Status:</strong> Blocked - Requires backend analytics endpoints implementation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
