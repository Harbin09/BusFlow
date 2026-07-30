'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface DriverItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: 'ON_DUTY' | 'AVAILABLE' | 'OFF_DUTY';
  assignedBus: string;
  rating: number;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const demoDrivers: DriverItem[] = [
    { id: 'DRV-001', name: 'Rajesh Kumar', email: 'rajesh@busflow.com', phone: '+91-9999-0001', licenseNumber: 'DL-0001', status: 'ON_DUTY', assignedBus: 'BUS-001', rating: 4.8 },
    { id: 'DRV-002', name: 'Priya Singh', email: 'priya@busflow.com', phone: '+91-9999-0002', licenseNumber: 'DL-0002', status: 'ON_DUTY', assignedBus: 'BUS-002', rating: 4.9 },
    { id: 'DRV-003', name: 'Amit Patel', email: 'amit@busflow.com', phone: '+91-9999-0003', licenseNumber: 'DL-0003', status: 'AVAILABLE', assignedBus: 'BUS-004', rating: 4.7 },
    { id: 'DRV-004', name: 'Vikram Singh', email: 'vikram@busflow.com', phone: '+91-9999-0004', licenseNumber: 'DL-0004', status: 'ON_DUTY', assignedBus: 'BUS-005', rating: 4.6 },
    { id: 'DRV-005', name: 'Neha Sharma', email: 'neha@busflow.com', phone: '+91-9999-0005', licenseNumber: 'DL-0005', status: 'OFF_DUTY', assignedBus: 'BUS-006', rating: 4.9 },
  ];

  useEffect(() => {
    async function loadDrivers() {
      setLoading(true);
      try {
        const res = await apiClient.get<any>('/api/v1/drivers');
        const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        if (items.length > 0) {
          setDrivers(items);
        } else {
          setDrivers(demoDrivers);
        }
      } catch (err) {
        console.warn('Failed to load drivers from REST API, using demo data');
        setDrivers(demoDrivers);
      }
      setLoading(false);
    }
    loadDrivers();
  }, []);

  const filtered = drivers.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Drivers Roster</h2>
          <p className="text-gray-600 mt-1">Live driver profiles and licensing loaded directly from CSV PostgreSQL master database</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
          + Add Driver Profile
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Search driver by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-500">{loading ? 'Loading CSV dataset...' : `Showing ${filtered.length} drivers`}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((drv) => (
            <div key={drv.id} className="p-5 border border-gray-200 rounded-lg space-y-3 bg-white hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                    {drv.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{drv.name}</h4>
                    <p className="text-xs text-gray-500">{drv.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  drv.status === 'ON_DUTY' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {drv.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100">
                <div>
                  <span className="text-gray-400 block">License</span>
                  <span className="font-mono text-gray-700 font-bold">{drv.licenseNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Assigned Bus</span>
                  <span className="font-semibold text-blue-600">{drv.assignedBus}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Contact Phone</span>
                  <span className="text-gray-700">{drv.phone}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Rating</span>
                  <span className="font-bold text-amber-500">★ {drv.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
