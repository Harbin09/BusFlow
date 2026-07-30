'use client';

import React, { useEffect, useState } from 'react';
import { Navigation, Play, CheckCircle2, Clock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { adminApi } from '@/services/api/admin';
import { Trip } from '@/types/trip';
import { formatTime } from '@/utils/date';
import { formatOccupancy } from '@/utils/format';

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    adminApi.getTrips().then(setTrips);
  }, []);

  return (
    <div className="space-y-6">
      <Header title="Live Trip Monitor & Dispatch" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trips.map((trp) => (
          <Card key={trp.id} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-slate-100">{trp.tripCode}</span>
              </div>
              <StatusBadge status={trp.status} />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Bus Unit:</span>
                <span className="font-bold text-slate-100">{trp.busNumber}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Assigned Driver:</span>
                <span>{trp.driverName}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Active Route:</span>
                <span>{trp.routeName}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Current Next Stop:</span>
                <span className="font-semibold text-emerald-400">{trp.currentNextStopName || 'Terminal'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Live Passengers:</span>
                <span>{formatOccupancy(trp.currentPassengerCount, trp.maxCapacity)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Dispatch Time:</span>
                <span>{formatTime(trp.startTime)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
