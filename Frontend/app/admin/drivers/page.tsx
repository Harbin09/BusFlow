'use client';

import React, { useEffect, useState } from 'react';
import { UserCheck, Plus, Search, Star } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/common/StatusBadge';
import { adminApi } from '@/services/api/admin';
import { Driver } from '@/types/driver';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi.getDrivers().then(setDrivers);
  }, []);

  const filtered = drivers.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <Header title="Driver Registry & Rosters" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search driver by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>Add Driver Profile</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((drv) => (
          <Card key={drv.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center border border-blue-500/30">
                  {drv.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-100">{drv.name}</h4>
                  <p className="text-xs text-slate-400">{drv.email}</p>
                </div>
              </div>
              <StatusBadge status={drv.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-400 block">License</span>
                <span className="font-mono text-slate-200">{drv.licenseNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Assigned Unit</span>
                <span className="font-semibold text-blue-400">{drv.assignedBusNumber || 'None'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Safety Rating</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {drv.rating}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Trips Done</span>
                <span className="font-bold text-slate-200">{drv.totalTripsCompleted}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
