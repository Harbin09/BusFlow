'use client';

import React from 'react';
import { Navigation, MapPin } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function DriverTripPage() {
  return (
    <div className="space-y-6">
      <Header title="Active Route Navigation" />

      <Card className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <Badge variant="info">NCE-01</Badge>
            <h3 className="text-xl font-bold text-slate-100 mt-1">North Campus Express</h3>
          </div>
          <span className="text-xs text-emerald-400 font-semibold">GPS Telemetry Broadcasting: 38 km/h</span>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Route Waypoint Schedule</h4>
          <div className="space-y-3">
            {[
              { name: 'Main Gate Terminal', status: 'COMPLETED', time: '08:00 AM' },
              { name: 'Library Complex', status: 'CURRENT', time: '08:12 AM' },
              { name: 'Engineering Quad', status: 'NEXT', time: '08:24 AM' },
              { name: 'Science Block', status: 'PENDING', time: '08:35 AM' },
            ].map((st, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className={`w-5 h-5 ${st.status === 'CURRENT' ? 'text-emerald-400 animate-bounce' : 'text-slate-500'}`} />
                  <div>
                    <p className="text-sm font-bold text-slate-100">{st.name}</p>
                    <p className="text-xs text-slate-400">{st.time}</p>
                  </div>
                </div>
                <Badge variant={st.status === 'COMPLETED' ? 'neutral' : st.status === 'CURRENT' ? 'success' : 'info'}>
                  {st.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
