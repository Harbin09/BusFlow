'use client';

import React from 'react';
import { Settings, Shield, Bell, Database, Save } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <Header title="System & Telemetry Settings" />

      <Card className="max-w-3xl space-y-6">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
          <Settings className="w-5 h-5 text-blue-400" />
          Gateway Telemetry Parameters
        </h3>

        <div className="space-y-4">
          <Input label="GPS Broadcast Ping Interval (Seconds)" defaultValue="3" type="number" />
          <Input label="Max Speed Alarm Threshold (km/h)" defaultValue="50" type="number" />
          <Input label="Geofence Arrival Buffer Radius (Meters)" defaultValue="40" type="number" />
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <Button leftIcon={<Save className="w-4 h-4" />}>Save System Configuration</Button>
        </div>
      </Card>
    </div>
  );
}
