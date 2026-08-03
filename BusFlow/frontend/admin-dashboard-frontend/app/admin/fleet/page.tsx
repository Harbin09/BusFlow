'use client';

import React, { useEffect, useState } from 'react';
import { fleetApi, driversApi, routesApi } from '@/lib/api';
import { Bus, Driver, Route } from '@/lib/types';

interface BusWithActions extends Bus {
  isLoading?: boolean;
}

interface EditModalState {
  isOpen: boolean;
  busId: string | null;
  mode: 'assignment' | 'status';
  driverId?: string;
  routeId?: string;
  status?: string;
}

export default function FleetPage() {
  const [buses, setBuses] = useState<BusWithActions[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    busId: null,
    mode: 'assignment',
  });
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const [busesRes, driversRes, routesRes] = await Promise.all([
      fleetApi.listBuses(),
      driversApi.listDrivers(),
      routesApi.listRoutes(),
    ]);

    if (busesRes.error) {
      setError(busesRes.error);
      setBuses([]);
      setBuses(MOCK_BUSES);
    } else {
      setBuses(Array.isArray(busesRes.data) ? busesRes.data : MOCK_BUSES);
    }

    setDrivers(Array.isArray(driversRes.data) ? driversRes.data : MOCK_DRIVERS);
    setRoutes(Array.isArray(routesRes.data) ? routesRes.data : MOCK_ROUTES);

    setLoading(false);
  };

  const handleOpenEditModal = (busId: string, mode: 'assignment' | 'status') => {
    const bus = buses.find((b) => b.id === busId);
    if (bus) {
      setEditModal({
        isOpen: true,
        busId,
        mode,
        driverId: bus.driverId,
        routeId: bus.routeId,
        status: bus.status,
      });
      setUpdateError(null);
      setUpdateSuccess(null);
    }
  };

  const handleCloseModal = () => {
    setEditModal({
      isOpen: false,
      busId: null,
      mode: 'assignment',
    });
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const handleSaveChanges = async () => {
    if (!editModal.busId) return;

    const busIndex = buses.findIndex((b) => b.id === editModal.busId);
    if (busIndex === -1) return;

    const updatedBuses = [...buses];
    updatedBuses[busIndex] = { ...updatedBuses[busIndex], isLoading: true };
    setBuses(updatedBuses);
    setUpdateError(null);
    setUpdateSuccess(null);

    let updateData: any = {};

    if (editModal.mode === 'assignment') {
      updateData = {
        driverId: editModal.driverId || null,
        routeId: editModal.routeId || null,
      };
    } else {
      updateData = {
        status: editModal.status,
      };
    }

    const response = await fleetApi.updateBus(editModal.busId, updateData);

    const updatedBus = response.data ? (response.data as Bus) : { ...updatedBuses[busIndex], ...updateData };
    updatedBuses[busIndex] = { ...updatedBuses[busIndex], ...updatedBus, isLoading: false };
    setBuses(updatedBuses);
    setUpdateSuccess(
      `Bus updated successfully (${editModal.mode === 'assignment' ? 'assignment' : 'status'})`
    );
    setTimeout(() => {
      handleCloseModal();
    }, 1500);
  };

  const filteredBuses = buses.filter(
    (bus) =>
      bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Running';
      case 'maintenance':
        return 'Maintenance';
      case 'inactive':
        return 'Disabled';
      default:
        return status;
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '▶️';
      case 'maintenance':
        return '🔧';
      case 'inactive':
        return '⛔';
      default:
        return '•';
    }
  };

  const getDriverName = (driverId?: string) => {
    return drivers.find((d) => d.id === driverId)?.name || '—';
  };

  const getRouteName = (routeId?: string) => {
    return routes.find((r) => r.id === routeId)?.name || '—';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Fleet Management</h2>
          <p className="text-gray-600 mt-2">
            Manage buses, assign drivers and routes, and monitor operational status
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
          <span className="text-lg">🚌</span>
          <span className="text-sm font-semibold text-blue-700">{buses.length} buses</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-yellow-800 font-medium">Using Demo Data</p>
            <p className="text-yellow-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by bus number or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <span className="absolute right-3 top-3 text-gray-400">🔍</span>
      </div>

      {/* Fleet Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-3">⏳</div>
              <p className="text-gray-600">Loading fleet...</p>
            </div>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-gray-600 text-lg mb-2">No buses found</p>
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'Try adjusting your search' : 'No buses in the fleet'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900 text-sm">
              <div>Bus Number</div>
              <div>Capacity</div>
              <div>Assigned Driver</div>
              <div>Assigned Route</div>
              <div>Status</div>
              <div>Service</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
              {filteredBuses.map((bus) => (
                <div
                  key={bus.id}
                  className={`grid grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors ${
                    bus.isLoading ? 'opacity-60' : ''
                  }`}
                >
                  {/* Bus Number */}
                  <div>
                    <p className="font-medium text-gray-900">{bus.busNumber}</p>
                    <p className="text-xs text-gray-500">{bus.id}</p>
                  </div>

                  {/* Capacity */}
                  <div className="text-sm text-gray-700">{bus.capacity} seats</div>

                  {/* Assigned Driver */}
                  <div className="text-sm">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {getDriverName(bus.driverId)}
                    </span>
                  </div>

                  {/* Assigned Route */}
                  <div className="text-sm">
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {getRouteName(bus.routeId)}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                        bus.status
                      )}`}
                    >
                      <span>{statusIcon(bus.status)}</span>
                      {statusLabel(bus.status)}
                    </span>
                  </div>

                  {/* Service Info */}
                  <div className="text-sm">
                    <p className="text-gray-700">
                      {bus.lastServiceDate
                        ? new Date(bus.lastServiceDate).toLocaleDateString()
                        : 'N/A'}
                    </p>
                    {bus.mileage && (
                      <p className="text-xs text-gray-500">{bus.mileage.toLocaleString()} km</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditModal(bus.id, 'assignment')}
                      disabled={bus.isLoading}
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                      title="Edit driver/route"
                    >
                      📋 Assign
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(bus.id, 'status')}
                      disabled={bus.isLoading}
                      className="px-3 py-1 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                      title="Edit operational status"
                    >
                      🔧 Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-1">Total Buses</p>
          <p className="text-2xl font-bold text-gray-900">{buses.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-1">Running</p>
          <p className="text-2xl font-bold text-green-600">
            {buses.filter((b) => b.status === 'active').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-1">Maintenance</p>
          <p className="text-2xl font-bold text-yellow-600">
            {buses.filter((b) => b.status === 'maintenance').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-1">Disabled</p>
          <p className="text-2xl font-bold text-red-600">
            {buses.filter((b) => b.status === 'inactive').length}
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <EditBusModal
          bus={buses.find((b) => b.id === editModal.busId)}
          mode={editModal.mode}
          drivers={drivers}
          routes={routes}
          driverId={editModal.driverId}
          routeId={editModal.routeId}
          status={editModal.status}
          onDriverChange={(driverId) => setEditModal({ ...editModal, driverId })}
          onRouteChange={(routeId) => setEditModal({ ...editModal, routeId })}
          onStatusChange={(status) => setEditModal({ ...editModal, status })}
          onSave={handleSaveChanges}
          onClose={handleCloseModal}
          loading={buses.find((b) => b.id === editModal.busId)?.isLoading || false}
          error={updateError}
          success={updateSuccess}
        />
      )}
    </div>
  );
}

interface EditBusModalProps {
  bus?: BusWithActions;
  mode: 'assignment' | 'status';
  drivers: Driver[];
  routes: Route[];
  driverId?: string;
  routeId?: string;
  status?: string;
  onDriverChange: (driverId: string) => void;
  onRouteChange: (routeId: string) => void;
  onStatusChange: (status: string) => void;
  onSave: () => void;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  success: string | null;
}

function EditBusModal({
  bus,
  mode,
  drivers,
  routes,
  driverId,
  routeId,
  status,
  onDriverChange,
  onRouteChange,
  onStatusChange,
  onSave,
  onClose,
  loading,
  error,
  success,
}: EditBusModalProps) {
  const statusOptions = [
    { value: 'active', label: 'Running', icon: '▶️' },
    { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { value: 'inactive', label: 'Disabled', icon: '⛔' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'assignment' ? 'Edit Driver & Route' : 'Edit Operational Status'}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6 space-y-4">
          {bus && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Bus</p>
              <p className="text-lg font-semibold text-gray-900">{bus.busNumber}</p>
              <p className="text-sm text-gray-500">{bus.id}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">✅ {success}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {mode === 'assignment' ? (
            <>
              {/* Driver Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Driver
                </label>
                <select
                  value={driverId || ''}
                  onChange={(e) => onDriverChange(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                >
                  <option value="">— Unassigned —</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} ({driver.status})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select a driver for this bus</p>
              </div>

              {/* Route Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Route
                </label>
                <select
                  value={routeId || ''}
                  onChange={(e) => onRouteChange(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                >
                  <option value="">— Unassigned —</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name} ({route.routeCode})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select a route for this bus</p>
              </div>
            </>
          ) : (
            <>
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Operational Status
                </label>
                <div className="space-y-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onStatusChange(option.value)}
                      disabled={loading}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                        status === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      } disabled:opacity-50`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{option.label}</p>
                        {option.value === 'active' && (
                          <p className="text-xs text-gray-500">Bus is operational</p>
                        )}
                        {option.value === 'maintenance' && (
                          <p className="text-xs text-gray-500">Bus is in service</p>
                        )}
                        {option.value === 'inactive' && (
                          <p className="text-xs text-gray-500">Bus is out of service</p>
                        )}
                      </div>
                      {status === option.value && (
                        <span className="text-blue-600 text-lg">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Mock Data
const MOCK_BUSES: BusWithActions[] = [
  {
    id: 'BUS-001',
    busNumber: 'BF-001',
    capacity: 50,
    driverId: 'DRV-001',
    routeId: 'ROUTE-001',
    status: 'active',
    purchaseYear: 2020,
    lastServiceDate: '2024-06-15',
    mileage: 125000,
    licensePlate: 'DL01AB1234',
  },
  {
    id: 'BUS-002',
    busNumber: 'BF-002',
    capacity: 45,
    driverId: 'DRV-002',
    routeId: 'ROUTE-002',
    status: 'active',
    purchaseYear: 2021,
    lastServiceDate: '2024-07-10',
    mileage: 98000,
    licensePlate: 'DL01AB1235',
  },
  {
    id: 'BUS-003',
    busNumber: 'BF-003',
    capacity: 50,
    driverId: 'DRV-003',
    routeId: 'ROUTE-003',
    status: 'maintenance',
    purchaseYear: 2019,
    lastServiceDate: '2024-08-01',
    mileage: 156000,
    licensePlate: 'DL01AB1236',
  },
  {
    id: 'BUS-004',
    busNumber: 'BF-004',
    capacity: 48,
    routeId: 'ROUTE-004',
    status: 'active',
    purchaseYear: 2022,
    lastServiceDate: '2024-05-20',
    mileage: 65000,
    licensePlate: 'DL01AB1237',
  },
  {
    id: 'BUS-005',
    busNumber: 'BF-005',
    capacity: 52,
    driverId: 'DRV-005',
    status: 'inactive',
    purchaseYear: 2018,
    lastServiceDate: '2023-12-10',
    mileage: 180000,
    licensePlate: 'DL01AB1238',
  },
];

const MOCK_DRIVERS: Driver[] = [
  {
    id: 'DRV-001',
    name: 'Rajesh Kumar',
    licenseNumber: 'DL-0001234567890',
    licenseExpiry: '2026-12-31',
    phoneNumber: '+91-9876543210',
    email: 'rajesh.kumar@busflow.com',
    yearsOfExperience: 8,
    status: 'active',
  },
  {
    id: 'DRV-002',
    name: 'Priya Singh',
    licenseNumber: 'DL-0001234567891',
    licenseExpiry: '2025-08-15',
    phoneNumber: '+91-9876543211',
    email: 'priya.singh@busflow.com',
    yearsOfExperience: 5,
    status: 'active',
  },
  {
    id: 'DRV-003',
    name: 'Vikram Patel',
    licenseNumber: 'DL-0001234567892',
    licenseExpiry: '2024-11-20',
    phoneNumber: '+91-9876543212',
    email: 'vikram.patel@busflow.com',
    yearsOfExperience: 12,
    status: 'on_leave',
  },
];

const MOCK_ROUTES: Route[] = [
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
  {
    id: 'ROUTE-004',
    name: 'Downtown Link',
    routeCode: 'DTL-04',
    status: 'active',
    startPoint: { id: 'STOP-004', name: 'Hostel Area', latitude: 28.5425, longitude: 77.1928, sequenceNumber: 1 },
    endPoint: { id: 'STOP-008', name: 'City Center', latitude: 28.5505, longitude: 77.2228, sequenceNumber: 5 },
    stops: [],
  },
];
