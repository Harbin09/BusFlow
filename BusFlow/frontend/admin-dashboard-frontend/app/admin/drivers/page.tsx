'use client';

import React, { useEffect, useState } from 'react';
import { driversApi } from '@/lib/api';
import { Driver } from '@/lib/types';

interface DriverWithActions extends Driver {
  isLoading?: boolean;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);
    const response = await driversApi.listDrivers();

    if (response.error) {
      setError(response.error);
      setDrivers(MOCK_DRIVERS);
    } else {
      setDrivers(Array.isArray(response.data) ? response.data : MOCK_DRIVERS);
    }
    setLoading(false);
  };

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'on_leave':
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
        return 'Active';
      case 'on_leave':
        return 'On-Leave';
      case 'inactive':
        return 'Suspended';
      default:
        return status;
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '✓';
      case 'on_leave':
        return '⏸';
      case 'inactive':
        return '✕';
      default:
        return '•';
    }
  };

  const isLicenseExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Drivers Management</h2>
          <p className="text-gray-600 mt-2">
            View and manage driver details, licenses, and contact information
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
          <span className="text-lg">👨‍✈️</span>
          <span className="text-sm font-semibold text-blue-700">{drivers.length} drivers</span>
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
          placeholder="Search by name, email, or license number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <span className="absolute right-3 top-3 text-gray-400">🔍</span>
      </div>

      {/* Drivers Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-3">⏳</div>
              <p className="text-gray-600">Loading drivers...</p>
            </div>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-gray-600 text-lg mb-2">No drivers found</p>
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'Try adjusting your search' : 'No drivers in the system'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900 text-sm">
              <div>Name</div>
              <div>Contact</div>
              <div>License</div>
              <div>Expiry</div>
              <div>Experience</div>
              <div>Assigned Bus</div>
              <div>Status</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
              {filteredDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className={`grid grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors ${
                    driver.isLoading ? 'opacity-60' : ''
                  }`}
                >
                  {/* Name */}
                  <div>
                    <p className="font-medium text-gray-900">{driver.name}</p>
                    <p className="text-xs text-gray-500">ID: {driver.id}</p>
                  </div>

                  {/* Contact */}
                  <div className="text-sm">
                    <p className="text-gray-700">{driver.phoneNumber}</p>
                    <p className="text-xs text-gray-500">{driver.email}</p>
                  </div>

                  {/* License */}
                  <div className="text-sm font-mono text-gray-700">{driver.licenseNumber}</div>

                  {/* License Expiry */}
                  <div className="text-sm">
                    <p className={isLicenseExpired(driver.licenseExpiry) ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                      {new Date(driver.licenseExpiry).toLocaleDateString()}
                    </p>
                    {isLicenseExpired(driver.licenseExpiry) && (
                      <p className="text-xs text-red-600">⚠️ Expired</p>
                    )}
                  </div>

                  {/* Experience */}
                  <div className="text-sm text-gray-700">
                    {driver.yearsOfExperience} years
                    {driver.rating && <p className="text-xs text-gray-500">⭐ {driver.rating}/5</p>}
                  </div>

                  {/* Assigned Bus */}
                  <div className="text-sm text-gray-700">
                    {driver.assignedBusId ? (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Bus {driver.assignedBusId}
                      </span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                        driver.status
                      )}`}
                    >
                      <span>{statusIcon(driver.status)}</span>
                      {statusLabel(driver.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-1">Total Drivers</p>
          <p className="text-2xl font-bold text-gray-900">{drivers.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {drivers.filter((d) => d.status === 'active').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-1">On Leave</p>
          <p className="text-2xl font-bold text-yellow-600">
            {drivers.filter((d) => d.status === 'on_leave').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-1">Suspended</p>
          <p className="text-2xl font-bold text-red-600">
            {drivers.filter((d) => d.status === 'inactive').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-1">License Expiring Soon</p>
          <p className="text-2xl font-bold text-orange-600">
            {drivers.filter((d) => {
              const expiryDate = new Date(d.licenseExpiry);
              const thirtyDaysFromNow = new Date();
              thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
              return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
            }).length}
          </p>
        </div>
      </div>
    </div>
  );
}

const MOCK_DRIVERS: DriverWithActions[] = [
  {
    id: 'DRV-001',
    name: 'Rajesh Kumar',
    licenseNumber: 'DL-0001234567890',
    licenseExpiry: '2026-12-31',
    phoneNumber: '+91-9876543210',
    email: 'rajesh.kumar@busflow.com',
    assignedBusId: 'BUS-001',
    yearsOfExperience: 8,
    status: 'active',
    rating: 4.8,
    totalTripsCompleted: 245,
  },
  {
    id: 'DRV-002',
    name: 'Priya Singh',
    licenseNumber: 'DL-0001234567891',
    licenseExpiry: '2025-08-15',
    phoneNumber: '+91-9876543211',
    email: 'priya.singh@busflow.com',
    assignedBusId: 'BUS-002',
    yearsOfExperience: 5,
    status: 'active',
    rating: 4.6,
    totalTripsCompleted: 178,
  },
  {
    id: 'DRV-003',
    name: 'Vikram Patel',
    licenseNumber: 'DL-0001234567892',
    licenseExpiry: '2024-11-20',
    phoneNumber: '+91-9876543212',
    email: 'vikram.patel@busflow.com',
    assignedBusId: 'BUS-003',
    yearsOfExperience: 12,
    status: 'on_leave',
    rating: 4.7,
    totalTripsCompleted: 312,
  },
  {
    id: 'DRV-004',
    name: 'Anjali Sharma',
    licenseNumber: 'DL-0001234567893',
    licenseExpiry: '2027-03-10',
    phoneNumber: '+91-9876543213',
    email: 'anjali.sharma@busflow.com',
    yearsOfExperience: 6,
    status: 'active',
    rating: 4.5,
    totalTripsCompleted: 156,
  },
  {
    id: 'DRV-005',
    name: 'Rohan Gupta',
    licenseNumber: 'DL-0001234567894',
    licenseExpiry: '2023-07-15',
    phoneNumber: '+91-9876543214',
    email: 'rohan.gupta@busflow.com',
    assignedBusId: 'BUS-005',
    yearsOfExperience: 3,
    status: 'inactive',
    rating: 3.8,
    totalTripsCompleted: 89,
  },
];
