'use client';

import React, { useEffect, useState } from 'react';
import { Bus, Users, Navigation, AlertTriangle, Activity } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/cards/StatCard';
import { InteractiveMap } from '@/components/maps/InteractiveMap';
import { PassengerFlowChart } from '@/components/charts/PassengerFlowChart';
import { adminApi } from '@/services/api/admin';
import { trackingApi } from '@/services/api/tracking';
import { BusLocationUpdate, GeofenceAlert } from '@/types/tracking';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getRelativeTimeString } from '@/utils/date';

export default function AdminDashboardPage() {
  const [locations, setLocations] = useState<BusLocationUpdate[]>([]);
  const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const locs = await trackingApi.getAllActiveLocations();
      const alts = await trackingApi.getRecentAlerts();
      setLocations(locs);
      setAlerts(alts);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <Header title="Fleet Management Overview" />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Fleet Buses" value="12 / 16" icon={<Bus className="w-5 h-5" />} trend="+2 from yesterday" trendPositive={true} />
        <StatCard title="On-Duty Drivers" value="14" icon={<Users className="w-5 h-5" />} trend="100% capacity" trendPositive={true} />
        <StatCard title="Ongoing Trips" value="8" icon={<Navigation className="w-5 h-5" />} trend="Normal operations" trendPositive={true} />
        <StatCard title="Active Speed Alarms" value="1" icon={<AlertTriangle className="w-5 h-5" />} trend="Requires review" trendPositive={false} />
      </div>

      {/* Main Grid: Interactive Map & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InteractiveMap
            locations={locations}
            selectedBusId={selectedBusId}
            onSelectBus={(id) => setSelectedBusId(id)}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h4 className="font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Live Geofence Feed
              </h4>
              <Badge variant="neutral">{alerts.length} events</Badge>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {alerts.map((alt) => (
                <div key={alt.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{alt.busNumber}</span>
                    <span className="text-[10px] text-slate-400">{getRelativeTimeString(alt.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-300">{alt.message}</p>
                </div>
              ))}
            </div>
          </Card>

          <PassengerFlowChart />
        </div>
      </div>
    </div>
  );
}
