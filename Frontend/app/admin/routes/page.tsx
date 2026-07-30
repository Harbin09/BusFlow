'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Clock, Navigation } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { adminApi } from '@/services/api/admin';
import { Route } from '@/types/route';

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    adminApi.getRoutes().then(setRoutes);
  }, []);

  return (
    <div className="space-y-6">
      <Header title="Campus Route Architecture" />

      <div className="flex justify-end">
        <Button leftIcon={<Plus className="w-4 h-4" />}>Build New Route</Button>
      </div>

      <div className="space-y-6">
        {routes.map((rt) => (
          <Card key={rt.id} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">{rt.code}</Badge>
                  <h3 className="text-lg font-bold text-slate-100">{rt.routeName}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  From <span className="text-slate-200">{rt.startLocationName}</span> to <span className="text-slate-200">{rt.endLocationName}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-slate-300">
                  <Navigation className="w-4 h-4 text-blue-400" />
                  {rt.totalDistanceKm} km
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  ~{rt.estimatedDurationMinutes} mins
                </span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Sequenced Bus Stops</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {rt.stops.map((stop) => (
                  <div key={stop.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                      {stop.sequenceOrder}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{stop.name}</p>
                      <p className="text-[10px] text-slate-400">+{stop.estimatedTimeFromStartMinutes}m from start</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
