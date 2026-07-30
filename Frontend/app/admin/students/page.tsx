'use client';

import React, { useEffect, useState } from 'react';
import { GraduationCap, Search, UserPlus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/common/StatusBadge';
import { adminApi } from '@/services/api/admin';
import { Student } from '@/types/student';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi.getStudents().then(setStudents);
  }, []);

  const filtered = students.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Header title="Student Transit Pass Database" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by student name or roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button leftIcon={<UserPlus className="w-4 h-4" />}>Issue New Bus Pass</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <th className="p-4">Student Name</th>
              <th className="p-4">Roll Number</th>
              <th className="p-4">Department</th>
              <th className="p-4">Assigned Route</th>
              <th className="p-4">Primary Stop</th>
              <th className="p-4">Pass Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((std) => (
              <tr key={std.id} className="hover:bg-slate-900/40 transition">
                <td className="p-4 font-bold text-slate-100 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                  {std.name}
                </td>
                <td className="p-4 text-slate-300 font-mono">{std.rollNumber}</td>
                <td className="p-4 text-slate-300">{std.department}</td>
                <td className="p-4 text-slate-300">{std.assignedRouteName || 'Unassigned'}</td>
                <td className="p-4 text-slate-300">{std.preferredStopName || 'Default'}</td>
                <td className="p-4"><StatusBadge status={std.passStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
