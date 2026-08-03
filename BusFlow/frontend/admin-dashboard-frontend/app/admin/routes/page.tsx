'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { routesApi, fleetApi, driversApi } from '@/lib/api';
import { Route, Stop, Bus, Driver } from '@/lib/types';

interface RouteWithActions extends Route {
  isLoading?: boolean;
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteWithActions[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    routeCode: '',
    startPointName: '',
    endPointName: '',
    totalDistance: 12,
    assignedBusId: '',
    assignedDriverId: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const [routesRes, busesRes, driversRes] = await Promise.all([
      routesApi.listRoutes(),
      fleetApi.listBuses(),
      driversApi.listDrivers(),
    ]);

    if (routesRes.error) {
      setError(routesRes.error);
      setRoutes(MOCK_ROUTES);
    } else {
      setRoutes(Array.isArray(routesRes.data) ? routesRes.data : MOCK_ROUTES);
    }

    if (!busesRes.error && busesRes.data) {
      setBuses(Array.isArray(busesRes.data) ? busesRes.data : []);
    }
    if (!driversRes.error && driversRes.data) {
      setDrivers(Array.isArray(driversRes.data) ? driversRes.data : []);
    }

    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setEditingRoute(null);
    setFormData({
      name: '',
      routeCode: '',
      startPointName: '',
      endPointName: '',
      totalDistance: 10,
      assignedBusId: '',
      assignedDriverId: '',
      status: 'active',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      routeCode: route.routeCode,
      startPointName: route.startPoint.name,
      endPointName: route.endPoint.name,
      totalDistance: route.totalDistance || 10,
      assignedBusId: route.assignedBusId || '',
      assignedDriverId: route.assignedDriverId || '',
      status: route.status,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.routeCode.trim()) {
      setFormError('Route Name and Code are required.');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    const payload: Partial<Route> = {
      name: formData.name,
      routeCode: formData.routeCode,
      startPoint: {
        id: 'sp-1',
        name: formData.startPointName || 'Main Terminal',
        latitude: 12.9716,
        longitude: 77.5946,
        sequenceNumber: 1,
      },
      endPoint: {
        id: 'ep-1',
        name: formData.endPointName || 'Campus West',
        latitude: 12.9856,
        longitude: 77.6056,
        sequenceNumber: 5,
      },
      stops: [
        {
          id: 'sp-1',
          name: formData.startPointName || 'Main Terminal',
          latitude: 12.9716,
          longitude: 77.5946,
          sequenceNumber: 1,
          estimatedStopTime: 2,
        },
        {
          id: 'ep-1',
          name: formData.endPointName || 'Campus West',
          latitude: 12.9856,
          longitude: 77.6056,
          sequenceNumber: 5,
          estimatedStopTime: 2,
        },
      ],
      totalDistance: Number(formData.totalDistance),
      assignedBusId: formData.assignedBusId || undefined,
      assignedDriverId: formData.assignedDriverId || undefined,
      status: formData.status,
    };

    if (editingRoute) {
      const response = await routesApi.updateRoute(editingRoute.id, payload);
      if (response.error) {
        setFormError(response.error);
      } else {
        setRoutes(
          routes.map((r) =>
            r.id === editingRoute.id
              ? { ...r, ...payload, name: formData.name, routeCode: formData.routeCode }
              : r
          )
        );
        setShowModal(false);
      }
    } else {
      const response = await routesApi.createRoute(payload);
      if (response.error) {
        setFormError(response.error);
      } else {
        const newRoute: RouteWithActions = {
          id: `rt-${Date.now()}`,
          name: formData.name,
          routeCode: formData.routeCode,
          startPoint: payload.startPoint!,
          endPoint: payload.endPoint!,
          stops: payload.stops!,
          totalDistance: payload.totalDistance,
          assignedBusId: payload.assignedBusId,
          assignedDriverId: payload.assignedDriverId,
          status: payload.status!,
        };
        setRoutes([newRoute, ...routes]);
        setShowModal(false);
      }
    }

    setFormLoading(false);
  };

  const handleToggleStatus = async (route: RouteWithActions) => {
    const newStatus = route.status === 'active' ? 'inactive' : 'active';
    setRoutes(routes.map((r) => (r.id === route.id ? { ...r, isLoading: true } : r)));

    const response = await routesApi.updateRoute(route.id, { status: newStatus });
    if (response.error) {
      setError(`Failed to update route status: ${response.error}`);
    }

    setRoutes(
      routes.map((r) =>
        r.id === route.id ? { ...r, status: newStatus, isLoading: false } : r
      )
    );
  };

  const filteredRoutes = routes.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.routeCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Route Management</h2>
          <p className="text-gray-600 mt-1">
            Manage master transit routes, stops, schedules, and active bus assignments.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm flex items-center gap-2"
          >
            <span>➕</span> Add New Route
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Routes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{routes.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
              🗺️
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Routes</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                {routes.filter((r) => r.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-2xl">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Campus Stops</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {routes.reduce((acc, r) => acc + (r.stops?.length || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-2xl">
              📍
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Assigned Fleet</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {routes.filter((r) => r.assignedBusId).length} Buses
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl">
              🚌
            </div>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between text-amber-800 text-sm">
          <span>⚠️ Backend unavailable ({error}). Displaying local route data.</span>
          <button onClick={fetchData} className="underline font-semibold hover:text-amber-900">
            Retry
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Search by route name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Status:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({routes.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Active ({routes.filter((r) => r.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'inactive'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Inactive ({routes.filter((r) => r.status === 'inactive').length})
          </button>
        </div>
      </div>

      {/* Routes Cards List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <div className="animate-spin text-3xl mb-2">🌀</div>
          Loading campus routes...
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <p className="text-lg font-medium text-gray-700">No routes found matching filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRoutes.map((route) => {
            const isExpanded = expandedRouteId === route.id;
            const assignedBus = buses.find((b) => b.id === route.assignedBusId);
            const assignedDriver = drivers.find((d) => d.id === route.assignedDriverId);

            return (
              <div
                key={route.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:border-gray-300"
              >
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-mono font-bold rounded">
                        {route.routeCode}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">{route.name}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          route.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {route.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Route Details */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                      <div>
                        📍 <span className="font-medium text-gray-900">{route.startPoint?.name}</span>{' '}
                        ➔ <span className="font-medium text-gray-900">{route.endPoint?.name}</span>
                      </div>
                      <div>📏 {route.totalDistance || 10} km</div>
                      <div>🪧 {route.stops?.length || 0} Stops</div>
                    </div>

                    {/* Assignments */}
                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-gray-500">
                      <span>
                        🚌 Bus:{' '}
                        <strong className="text-gray-800">
                          {assignedBus ? `Bus ${assignedBus.busNumber}` : 'Unassigned'}
                        </strong>
                      </span>
                      <span>
                        👨‍✈️ Driver:{' '}
                        <strong className="text-gray-800">
                          {assignedDriver ? assignedDriver.name : 'Unassigned'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Right: Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedRouteId(isExpanded ? null : route.id)}
                      className="px-3.5 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <span>{isExpanded ? '▲ Hide Stops' : '▼ View Stops'}</span>
                    </button>
                    <button
                      onClick={() => handleToggleStatus(route)}
                      disabled={route.isLoading}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                        route.status === 'active'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                    >
                      {route.isLoading
                        ? 'Updating...'
                        : route.status === 'active'
                        ? 'Deactivate'
                        : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(route)}
                      className="px-3.5 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Expanded Stops Timeline */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-gray-200 p-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                      Route Stops Sequence
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {(route.stops && route.stops.length > 0 ? route.stops : [route.startPoint, route.endPoint]).map(
                        (stop, idx) => (
                          <div
                            key={stop.id || idx}
                            className="bg-white p-4 rounded-lg border border-gray-200 relative shadow-2xs"
                          >
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                              {idx + 1}
                            </span>
                            <p className="font-semibold text-gray-900 text-sm">{stop.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Stop time: {stop.estimatedStopTime || 2} mins
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Route Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="text-lg font-bold">
                {editingRoute ? 'Edit Route' : 'Add New Campus Route'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              {formError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Route Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Route A - North Campus"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Route Code</label>
                  <input
                    type="text"
                    required
                    placeholder="RT-101"
                    value={formData.routeCode}
                    onChange={(e) => setFormData({ ...formData, routeCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Start Point</label>
                  <input
                    type="text"
                    placeholder="Main Campus Terminal"
                    value={formData.startPointName}
                    onChange={(e) => setFormData({ ...formData, startPointName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">End Point</label>
                  <input
                    type="text"
                    placeholder="West Housing Complex"
                    value={formData.endPointName}
                    onChange={(e) => setFormData({ ...formData, endPointName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Assigned Bus</label>
                  <select
                    value={formData.assignedBusId}
                    onChange={(e) => setFormData({ ...formData, assignedBusId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {buses.map((b) => (
                      <option key={b.id} value={b.id}>
                        Bus {b.busNumber} (Cap: {b.capacity})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Assigned Driver</label>
                  <select
                    value={formData.assignedDriverId}
                    onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.phoneNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    value={formData.totalDistance}
                    onChange={(e) => setFormData({ ...formData, totalDistance: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  {formLoading ? 'Saving...' : editingRoute ? 'Update Route' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Mock Routes Data
const MOCK_ROUTES: RouteWithActions[] = [
  {
    id: 'rt-1',
    name: 'Route A (North Campus)',
    routeCode: 'RT-101',
    startPoint: {
      id: 'st-1',
      name: 'Main Gate Terminal',
      latitude: 12.9716,
      longitude: 77.5946,
      sequenceNumber: 1,
      estimatedStopTime: 2,
    },
    endPoint: {
      id: 'st-4',
      name: 'North Hostel Complex',
      latitude: 12.9856,
      longitude: 77.6056,
      sequenceNumber: 4,
      estimatedStopTime: 2,
    },
    stops: [
      { id: 'st-1', name: 'Main Gate Terminal', latitude: 12.9716, longitude: 77.5946, sequenceNumber: 1, estimatedStopTime: 2 },
      { id: 'st-2', name: 'Science Block B', latitude: 12.9756, longitude: 77.5986, sequenceNumber: 2, estimatedStopTime: 3 },
      { id: 'st-3', name: 'Central Library', latitude: 12.9806, longitude: 77.6016, sequenceNumber: 3, estimatedStopTime: 2 },
      { id: 'st-4', name: 'North Hostel Complex', latitude: 12.9856, longitude: 77.6056, sequenceNumber: 4, estimatedStopTime: 2 },
    ],
    totalDistance: 12.4,
    assignedBusId: '1',
    assignedDriverId: '1',
    status: 'active',
  },
  {
    id: 'rt-2',
    name: 'Route B (East Campus)',
    routeCode: 'RT-102',
    startPoint: {
      id: 'st-1',
      name: 'Main Gate Terminal',
      latitude: 12.9716,
      longitude: 77.5946,
      sequenceNumber: 1,
      estimatedStopTime: 2,
    },
    endPoint: {
      id: 'st-7',
      name: 'Engineering Labs',
      latitude: 12.9656,
      longitude: 77.6156,
      sequenceNumber: 3,
      estimatedStopTime: 2,
    },
    stops: [
      { id: 'st-1', name: 'Main Gate Terminal', latitude: 12.9716, longitude: 77.5946, sequenceNumber: 1, estimatedStopTime: 2 },
      { id: 'st-6', name: 'Sports Complex', latitude: 12.9686, longitude: 77.6086, sequenceNumber: 2, estimatedStopTime: 2 },
      { id: 'st-7', name: 'Engineering Labs', latitude: 12.9656, longitude: 77.6156, sequenceNumber: 3, estimatedStopTime: 2 },
    ],
    totalDistance: 9.8,
    assignedBusId: '2',
    assignedDriverId: '2',
    status: 'active',
  },
  {
    id: 'rt-3',
    name: 'Route C (South Express)',
    routeCode: 'RT-103',
    startPoint: {
      id: 'st-8',
      name: 'South Metro Station',
      latitude: 12.9516,
      longitude: 77.5846,
      sequenceNumber: 1,
      estimatedStopTime: 3,
    },
    endPoint: {
      id: 'st-1',
      name: 'Main Gate Terminal',
      latitude: 12.9716,
      longitude: 77.5946,
      sequenceNumber: 3,
      estimatedStopTime: 2,
    },
    stops: [
      { id: 'st-8', name: 'South Metro Station', latitude: 12.9516, longitude: 77.5846, sequenceNumber: 1, estimatedStopTime: 3 },
      { id: 'st-9', name: 'Medical Center', latitude: 12.9616, longitude: 77.5896, sequenceNumber: 2, estimatedStopTime: 2 },
      { id: 'st-1', name: 'Main Gate Terminal', latitude: 12.9716, longitude: 77.5946, sequenceNumber: 3, estimatedStopTime: 2 },
    ],
    totalDistance: 14.2,
    assignedBusId: '3',
    assignedDriverId: '3',
    status: 'active',
  },
  {
    id: 'rt-4',
    name: 'Route D (West Campus Express)',
    routeCode: 'RT-104',
    startPoint: {
      id: 'st-1',
      name: 'Main Gate Terminal',
      latitude: 12.9716,
      longitude: 77.5946,
      sequenceNumber: 1,
    },
    endPoint: {
      id: 'st-10',
      name: 'West Auditorium',
      latitude: 12.9786,
      longitude: 77.5746,
      sequenceNumber: 2,
    },
    stops: [
      { id: 'st-1', name: 'Main Gate Terminal', latitude: 12.9716, longitude: 77.5946, sequenceNumber: 1 },
      { id: 'st-10', name: 'West Auditorium', latitude: 12.9786, longitude: 77.5746, sequenceNumber: 2 },
    ],
    totalDistance: 8.5,
    status: 'inactive',
  },
];
