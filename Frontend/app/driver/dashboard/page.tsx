'use client';

import React, { useEffect, useState } from 'react';
import { Navigation, Play, Square, AlertOctagon, Users, MapPin } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { driverApi } from '@/services/api/driver';
import { Trip } from '@/types/trip';

export default function DriverDashboardPage() {
  const [assignedTrip, setAssignedTrip] = useState<Trip | null>(null);
  const [passengers, setPassengers] = useState<number>(32);

  useEffect(() => {
    driverApi.getAssignedTrip().then(setAssignedTrip);
  }, []);

  const handleAdjustPassengers = async (delta: number) => {
    if (!assignedTrip) return;
    const updated = await driverApi.updatePassengerCount(assignedTrip.id, delta);
    setPassengers(updated);
  };

  return (
    <div className="space-y-6">
      <Header title="Driver Mobile Cockpit" />

      {assignedTrip ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 space-y-6 glass-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <Badge variant="success" className="mb-2">TRIP ACTIVE</Badge>
                <h2 className="text-2xl font-black text-slate-100">{assignedTrip.routeName}</h2>
                <p className="text-xs text-slate-400 font-mono mt-1">Trip Code: {assignedTrip.tripCode} | Unit: {assignedTrip.busNumber}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Next Stop</span>
                <span className="text-lg font-bold text-emerald-400">{assignedTrip.currentNextStopName}</span>
              </div>
            </div>

            {/* Quick Trip Controls */}
            <div className="grid grid-cols-2 gap-4">
              <Button size="lg" variant="danger" leftIcon={<Square className="w-5 h-5" />}>
                End Current Trip
              </Button>
              <Button size="lg" variant="secondary" leftIcon={<AlertOctagon className="w-5 h-5 text-rose-500" />}>
                Broadcast Panic Alert
              </Button>
            </div>
          </Card>

          {/* Passenger Counter Widget */}
          <Card className="flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-bold text-slate-100 flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                Live Passenger Tally
              </h4>
              <p className="text-xs text-slate-400">Single-tap passenger onboarding counter</p>
            </div>

            <div className="text-center py-4">
              <span className="text-5xl font-black text-slate-100">{passengers}</span>
              <span className="text-sm text-slate-400 block mt-1">/ {assignedTrip.maxCapacity} Max Capacity</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAdjustPassengers(-1)}
                className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xl rounded-xl border border-slate-700 active:scale-95 transition"
              >
                - 1
              </button>
              <button
                onClick={() => handleAdjustPassengers(1)}
                className="py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition"
              >
                + 1
              </button>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-slate-400 text-sm">No scheduled trip assigned at this moment.</p>
        </Card>
      )}
    </div>
  );
}
