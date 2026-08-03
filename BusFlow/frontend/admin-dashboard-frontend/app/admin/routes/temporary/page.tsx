'use client';

import React, { useEffect, useState } from 'react';
import { temporaryRoutesApi, routesApi, fleetApi } from '@/lib/api';
import { TemporaryRoute, Route, Bus, TemporaryStop } from '@/lib/types';

interface TemporaryRouteWithActions extends TemporaryRoute {
  isLoading?: boolean;
}

interface FormStop extends TemporaryStop {
  id: string;
}

export default function TemporaryRoutesPage() {
  const [routes, setRoutes] = useState<TemporaryRouteWithActions[]>([]);
  const [masterRoutes, setMasterRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    overrideDate: '',
    masterRouteId: '',
    busId: '',
    notes: '',
    stops: [
      { id: '1', name: '', latitude: 0, longitude: 0, sequenceNumber: 1, estimatedStopTime: 5, address: '' }
    ] as FormStop[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const [tempRoutesRes, masterRoutesRes, busesRes] = await Promise.all([
      temporaryRoutesApi.listTemporaryRoutes(),
      routesApi.listRoutes(),
      fleetApi.listBuses(),
    ]);

    if (tempRoutesRes.error) {
      setError(tempRoutesRes.error);
      setRoutes(MOCK_TEMPORARY_ROUTES);
    } else {
      setRoutes((tempRoutesRes.data as TemporaryRoute[]) || MOCK_TEMPORARY_ROUTES);
    }

    setMasterRoutes((masterRoutesRes.data as Route[]) || MOCK_MASTER_ROUTES);
    setBuses((busesRes.data as Bus[]) || MOCK_BUSES);

    setLoading(false);
  };

  const handleAddStop = () => {
    const newStop: FormStop = {
      id: Date.now().toString(),
      name: '',
      latitude: 0,
      longitude: 0,
      sequenceNumber: formData.stops.length + 1,
      estimatedStopTime: 5,
      address: '',
    };
    setFormData({
      ...formData,
      stops: [...formData.stops, newStop],
    });
  };

  const handleRemoveStop = (stopId: string) => {
    const updatedStops = formData.stops.filter((stop) => stop.id !== stopId);
    setFormData({
      ...formData,
      stops: updatedStops.map((stop, idx) => ({
        ...stop,
        sequenceNumber: idx + 1,
      })),
    });
  };

  const handleStopChange = (stopId: string, field: keyof TemporaryStop, value: any) => {
    setFormData({
      ...formData,
      stops: formData.stops.map((stop) =>
        stop.id === stopId ? { ...stop, [field]: value } : stop
      ),
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validation
    if (!formData.name.trim()) {
      setFormError('Route name is required');
      return;
    }
    if (!formData.overrideDate) {
      setFormError('Override date is required');
      return;
    }
    if (!formData.masterRouteId) {
      setFormError('Master route selection is required');
      return;
    }
    if (!formData.busId) {
      setFormError('Bus selection is required');
      return;
    }
    if (formData.stops.length === 0 || formData.stops.some((s) => !s.name.trim())) {
      setFormError('All stops must have a name');
      return;
    }

    setIsSubmitting(true);

    const submitData = {
      name: formData.name,
      overrideDate: formData.overrideDate,
      masterRouteId: formData.masterRouteId,
      busId: formData.busId,
      notes: formData.notes,
      stops: formData.stops.map(({ id, ...stop }) => stop),
    };

    const response = await temporaryRoutesApi.createTemporaryRoute(submitData);

    if (response.error) {
      setFormError(`Failed to schedule route: ${response.error}`);
    } else {
      setFormSuccess('Event route scheduled successfully!');
      // Reset form
      setFormData({
        name: '',
        overrideDate: '',
        masterRouteId: '',
        busId: '',
        notes: '',
        stops: [
          { id: '1', name: '', latitude: 0, longitude: 0, sequenceNumber: 1, estimatedStopTime: 5, address: '' }
        ],
      });
      // Refresh list
      setTimeout(() => {
        fetchData();
      }, 1500);
    }

    setIsSubmitting(false);
  };

  const filteredRoutes = routes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.overrideDate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBusName = (busId: string) => {
    return buses.find((b) => b.id === busId)?.busNumber || busId;
  };

  const getRouteName = (routeId: string) => {
    return masterRoutes.find((r) => r.id === routeId)?.name || routeId;
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Special Event Routes</h2>
          <p className="text-gray-600 mt-2">
            Schedule temporary routes for Saturdays, holidays, or special events
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200">
          <span className="text-lg">📅</span>
          <span className="text-sm font-semibold text-purple-700">{routes.length} event routes</span>
        </div>
      </div>

      {/* Create Event Route Form */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Schedule New Event Route</h3>

        {formError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{formError}</p>
            </div>
          </div>
        )}

        {formSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-green-800 font-medium">Success</p>
              <p className="text-green-700 text-sm">{formSuccess}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Name, Date, Master Route */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Route Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Route Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Campus Fest Route"
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
              />
            </div>

            {/* Override Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date (Override) *
              </label>
              <input
                type="date"
                value={formData.overrideDate}
                onChange={(e) => setFormData({ ...formData, overrideDate: e.target.value })}
                min={getMinDate()}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Select date for special event</p>
            </div>

            {/* Master Route */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Master Route *
              </label>
              <select
                value={formData.masterRouteId}
                onChange={(e) => setFormData({ ...formData, masterRouteId: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
              >
                <option value="">Select a master route</option>
                {masterRoutes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Bus Selection & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bus Selection */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Off-Peak Bus *
              </label>
              <select
                value={formData.busId}
                onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
              >
                <option value="">Select a bus</option>
                {buses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.busNumber} ({bus.status})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Available buses for event</p>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g., Special event for sports day, extended hours"
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Temporary Stops Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Temporary Stops</h4>
              <button
                type="button"
                onClick={handleAddStop}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                + Add Stop
              </button>
            </div>

            <div className="space-y-4">
              {formData.stops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">Stop {idx + 1}</p>
                    {formData.stops.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(stop.id)}
                        disabled={isSubmitting}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    {/* Stop Name */}
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={stop.name}
                        onChange={(e) => handleStopChange(stop.id, 'name', e.target.value)}
                        placeholder="Stop name"
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-white"
                      />
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={stop.address || ''}
                        onChange={(e) => handleStopChange(stop.id, 'address', e.target.value)}
                        placeholder="Address"
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-white"
                      />
                    </div>

                    {/* Estimated Stop Time */}
                    <div className="md:col-span-1">
                      <input
                        type="number"
                        value={stop.estimatedStopTime || 5}
                        onChange={(e) => handleStopChange(stop.id, 'estimatedStopTime', parseInt(e.target.value))}
                        placeholder="Min"
                        min="1"
                        max="60"
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">minutes</p>
                    </div>

                    {/* Sequence */}
                    <div className="md:col-span-1">
                      <input
                        type="number"
                        value={stop.sequenceNumber}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100 text-gray-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">sequence</p>
                    </div>
                  </div>

                  {/* Lat/Lon Row */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <input
                      type="number"
                      value={stop.latitude}
                      onChange={(e) => handleStopChange(stop.id, 'latitude', parseFloat(e.target.value))}
                      placeholder="Latitude"
                      step="0.0001"
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-white"
                    />
                    <input
                      type="number"
                      value={stop.longitude}
                      onChange={(e) => handleStopChange(stop.id, 'longitude', parseFloat(e.target.value))}
                      placeholder="Longitude"
                      step="0.0001"
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>ℹ️ Auto-Revert:</strong> This event route will automatically revert to the master route at 11:59 PM on the selected date.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="reset"
              disabled={isSubmitting}
              onClick={() => {
                setFormData({
                  name: '',
                  overrideDate: '',
                  masterRouteId: '',
                  busId: '',
                  notes: '',
                  stops: [
                    { id: '1', name: '', latitude: 0, longitude: 0, sequenceNumber: 1, estimatedStopTime: 5, address: '' }
                  ],
                });
                setFormError(null);
                setFormSuccess(null);
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '⏳ Scheduling...' : '📅 Schedule Event Route'}
            </button>
          </div>
        </form>
      </div>

      {/* Scheduled Routes Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Scheduled Event Routes</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin text-4xl mb-3">⏳</div>
                <p className="text-gray-600">Loading scheduled routes...</p>
              </div>
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <p className="text-gray-600 text-lg mb-2">No event routes scheduled</p>
                <p className="text-gray-500 text-sm">Create one using the form above</p>
              </div>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900 text-sm">
                <div>Event Name</div>
                <div>Date</div>
                <div>Bus</div>
                <div>Master Route</div>
                <div>Stops</div>
                <div>Status</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-gray-200">
                {filteredRoutes.map((route) => (
                  <div
                    key={route.id}
                    className={`grid grid-cols-6 gap-4 px-6 py-4 items-start hover:bg-gray-50 transition-colors ${
                      route.isLoading ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Event Name */}
                    <div>
                      <p className="font-medium text-gray-900">{route.name}</p>
                      {route.notes && (
                        <p className="text-xs text-gray-500 mt-1">{route.notes}</p>
                      )}
                    </div>

                    {/* Date */}
                    <div className="text-sm text-gray-700">
                      <p>{new Date(route.overrideDate).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(route.overrideDate).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                    </div>

                    {/* Bus */}
                    <div className="text-sm">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {getBusName(route.busId)}
                      </span>
                    </div>

                    {/* Master Route */}
                    <div className="text-sm">
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {getRouteName(route.masterRouteId)}
                      </span>
                    </div>

                    {/* Stops Count */}
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">{route.stops.length} stops</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {route.stops.map((s) => s.name).join(', ').substring(0, 30)}
                        {route.stops.map((s) => s.name).join(', ').length > 30 ? '...' : ''}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                          route.status
                        )}`}
                      >
                        {route.status === 'scheduled' && '📅'}
                        {route.status === 'active' && '▶️'}
                        {route.status === 'completed' && '✓'}
                        {statusLabel(route.status)}
                      </span>
                      <p className="text-xs text-gray-600">
                        🔄 Auto-reverts at 11:59 PM
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">How Event Routes Work</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Schedule special routes for Saturdays, holidays, or campus events</li>
              <li>✓ Select an off-peak bus and assign temporary stops</li>
              <li>✓ Route automatically reverts to the master route at 11:59 PM</li>
              <li>✓ View all scheduled events and their current status in the table below</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock Data
const MOCK_TEMPORARY_ROUTES: TemporaryRouteWithActions[] = [
  {
    id: 'TEMP-001',
    name: 'Campus Fest Route',
    overrideDate: '2024-08-15',
    masterRouteId: 'ROUTE-001',
    busId: 'BUS-001',
    driverId: 'DRV-001',
    stops: [
      { name: 'Main Gate', latitude: 28.5355, longitude: 77.1928, sequenceNumber: 1, estimatedStopTime: 5, address: 'South Campus Entrance' },
      { name: 'Sports Complex', latitude: 28.5405, longitude: 77.2028, sequenceNumber: 2, estimatedStopTime: 10, address: 'Athletic Fields' },
      { name: 'Amphitheater', latitude: 28.5455, longitude: 77.1928, sequenceNumber: 3, estimatedStopTime: 15, address: 'Central Campus' },
    ],
    status: 'scheduled',
    notes: 'Special event - Campus fest day',
    autoRevertTime: '23:59',
  },
  {
    id: 'TEMP-002',
    name: 'Sports Day Route',
    overrideDate: '2024-08-22',
    masterRouteId: 'ROUTE-002',
    busId: 'BUS-002',
    driverId: 'DRV-002',
    stops: [
      { name: 'Library', latitude: 28.5375, longitude: 77.1778, sequenceNumber: 1, estimatedStopTime: 5, address: 'Central Library' },
      { name: 'Sports Venue', latitude: 28.5505, longitude: 77.2228, sequenceNumber: 2, estimatedStopTime: 20, address: 'Main Stadium' },
    ],
    status: 'active',
    notes: 'Extended schedule for sports day',
    autoRevertTime: '23:59',
  },
  {
    id: 'TEMP-003',
    name: 'Workshop Route',
    overrideDate: '2024-08-08',
    masterRouteId: 'ROUTE-003',
    busId: 'BUS-004',
    stops: [
      { name: 'Registration Desk', latitude: 28.5355, longitude: 77.1928, sequenceNumber: 1, estimatedStopTime: 5, address: 'Main Campus' },
      { name: 'Workshop Hall', latitude: 28.5405, longitude: 77.2028, sequenceNumber: 2, estimatedStopTime: 30, address: 'Conference Center' },
      { name: 'Cafeteria', latitude: 28.5355, longitude: 77.2128, sequenceNumber: 3, estimatedStopTime: 10, address: 'Food Court' },
    ],
    status: 'completed',
    notes: 'Tech workshop event',
    autoRevertTime: '23:59',
  },
];

const MOCK_MASTER_ROUTES: Route[] = [
  {
    id: 'ROUTE-001',
    name: 'North Campus Express',
    routeCode: 'NCE-01',
    status: 'active',
    startPoint: { id: 'STOP-001', name: 'Main Gate', latitude: 28.5355, longitude: 77.1928, sequenceNumber: 1 },
    endPoint: { id: 'STOP-005', name: 'North Block', latitude: 28.5405, longitude: 77.2028, sequenceNumber: 5 },
    stops: [],
  },
  {
    id: 'ROUTE-002',
    name: 'East Wing Shuttle',
    routeCode: 'EWS-02',
    status: 'active',
    startPoint: { id: 'STOP-002', name: 'South Gate', latitude: 28.5305, longitude: 77.1828, sequenceNumber: 1 },
    endPoint: { id: 'STOP-006', name: 'East Block', latitude: 28.5455, longitude: 77.2128, sequenceNumber: 5 },
    stops: [],
  },
  {
    id: 'ROUTE-003',
    name: 'West Campus Loop',
    routeCode: 'WCL-03',
    status: 'active',
    startPoint: { id: 'STOP-003', name: 'Library', latitude: 28.5375, longitude: 77.1778, sequenceNumber: 1 },
    endPoint: { id: 'STOP-007', name: 'West Block', latitude: 28.5455, longitude: 77.1728, sequenceNumber: 5 },
    stops: [],
  },
];

const MOCK_BUSES: Bus[] = [
  {
    id: 'BUS-001',
    busNumber: 'BF-001',
    capacity: 50,
    status: 'active',
  },
  {
    id: 'BUS-002',
    busNumber: 'BF-002',
    capacity: 45,
    status: 'active',
  },
  {
    id: 'BUS-003',
    busNumber: 'BF-003',
    capacity: 50,
    status: 'maintenance',
  },
  {
    id: 'BUS-004',
    busNumber: 'BF-004',
    capacity: 48,
    status: 'active',
  },
];
