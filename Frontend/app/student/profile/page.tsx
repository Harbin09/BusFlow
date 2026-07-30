'use client';

import React, { useEffect, useState } from 'react';
import { GraduationCap, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { studentApi } from '@/services/api/student';
import { Student } from '@/types/student';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Student | null>(null);

  useEffect(() => {
    studentApi.getProfile().then(setProfile);
  }, []);

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <Header title="Student Profile & Digital Pass" />

      <Card className="max-w-2xl space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 font-bold text-2xl flex items-center justify-center border border-blue-500/30">
            {profile.name[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">{profile.name}</h2>
            <p className="text-xs text-slate-400 font-mono">Roll: {profile.rollNumber}</p>
            <Badge variant="success" className="mt-1">Digital Pass Active</Badge>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-slate-200">{profile.email}</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <GraduationCap className="w-4 h-4 text-purple-400" />
            <span className="text-slate-200">{profile.department}</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-200">Preferred Stop: {profile.preferredStopName}</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="text-slate-200">Pass Validity: {profile.passExpiryDate}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
