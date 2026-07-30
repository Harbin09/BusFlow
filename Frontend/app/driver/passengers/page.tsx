'use client';

import React from 'react';
import { Users, Clock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';

export default function DriverPassengersPage() {
  const passengerLogs = [
    { name: 'Alex Turner', stop: 'Library Complex', time: '08:12 AM' },
    { name: 'Sarah Jenkins', stop: 'Library Complex', time: '08:11 AM' },
    { name: 'Michael Chang', stop: 'Main Gate Terminal', time: '08:01 AM' },
  ];

  return (
    <div className="space-y-6">
      <Header title="Passenger Onboarding Log" />

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
              <th className="p-4">Passenger Name</th>
              <th className="p-4">Boarding Station</th>
              <th className="p-4">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {passengerLogs.map((p, i) => (
              <tr key={i} className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  {p.name}
                </td>
                <td className="p-4 text-slate-300">{p.stop}</td>
                <td className="p-4 text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {p.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
