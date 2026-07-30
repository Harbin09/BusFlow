'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bus, MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { studentApi } from '@/services/api/student';
import { Student } from '@/types/student';

export default function StudentDashboardPage() {
  const [profile, setProfile] = useState<Student | null>(null);

  useEffect(() => {
    studentApi.getProfile().then(setProfile);
  }, []);

  return (
    <div className="space-y-6">
      <Header title="Student Transit Portal" />

      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick ETA Highlight Card */}
          <Card className="md:col-span-2 space-y-6 glass-card border-blue-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <Badge variant="info">Assigned Shuttle</Badge>
                <h2 className="text-2xl font-black text-slate-100 mt-1">{profile.assignedRouteName}</h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Next Arrival ETA</span>
                <span className="text-3xl font-black text-emerald-400">~6 mins</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <MapPin className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">Your Primary Stop</p>
                  <p className="text-base font-bold text-slate-100">{profile.preferredStopName}</p>
                </div>
              </div>
              <Link href="/student/tracking">
                <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Track Live Map
                </Button>
              </Link>
            </div>
          </Card>

          {/* Bus Pass Digital Badge Card */}
          <Card className="space-y-4 text-center border-emerald-500/30">
            <div className="p-3 w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <Badge variant="success" className="mb-2">PASS ACTIVE</Badge>
              <h3 className="text-lg font-bold text-slate-100">{profile.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{profile.rollNumber}</p>
            </div>
            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
              <span>Valid through {profile.passExpiryDate}</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
