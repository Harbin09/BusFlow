'use client';

import React, { useEffect, useState } from 'react';
import { Bus as BusIcon, Plus, Search } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/common/StatusBadge';
import { adminApi } from '@/services/api/admin';
import { Bus } from '@/types/bus';
import { formatOccupancy } from '@/utils/format';

export default function AdminBusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi.getBuses().then(setBuses);
  }, []);

  const filteredBuses = buses.filter(
    (b) => b.busNumber.toLowerCase().includes(search.toLowerCase()) || b.licensePlate.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Header title="Bus Fleet Inventory" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by bus number or plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>Register New Bus</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <th className="p-4">Bus Unit</th>
              <th className="p-4">License Plate</th>
              <th className="p-4">Assigned Driver</th>
              <th className="p-4">Route</th>
              <th className="p-4">Occupancy</th>
              <th className="p-4">Fuel Level</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredBuses.map((bus) => (
              <tr key={bus.id} className="hover:bg-slate-900/40 transition">
                <td className="p-4 font-bold text-slate-100 flex items-center gap-2">
                  <BusIcon className="w-4 h-4 text-blue-400" />
                  {bus.busNumber}
                </td>
                <td className="p-4 text-slate-300 font-mono">{bus.licensePlate}</td>
                <td className="p-4 text-slate-300">{bus.driverName || 'Unassigned'}</td>
                <td className="p-4 text-slate-300">{bus.assignedRouteName || 'None'}</td>
                <td className="p-4 text-slate-300">{formatOccupancy(bus.currentOccupancy, bus.capacity)}</td>
                <td className="p-4 font-semibold text-emerald-400">{bus.fuelLevelPercent}%</td>
                <td className="p-4"><StatusBadge status={bus.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
