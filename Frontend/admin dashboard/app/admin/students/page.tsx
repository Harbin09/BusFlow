'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface StudentItem {
  id: string;
  studentNo: string;
  name: string;
  email: string;
  program: string;
  semester: string;
  assignedRoute: string;
  pickupStop: string;
  passStatus: 'ACTIVE' | 'EXPIRED';
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      try {
        const res = await apiClient.get<any>('/api/v1/students');
        const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        if (items.length > 0) {
          setStudents(items);
        }
      } catch (err) {
        console.warn('Failed to load students from REST API');
      }
      setLoading(false);
    }
    loadStudents();
  }, []);

  const filtered = students.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.studentNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Student Registry & Transit Passes</h2>
          <p className="text-gray-600 mt-1">Live student records loaded directly from CSV PostgreSQL master database</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
          + Issue Pass
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <input
            type="text"
            placeholder="Search student by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-500">{loading ? 'Loading CSV dataset...' : `Showing ${filtered.length} of ${students.length} enrolled students`}</span>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
            <tr>
              <th className="p-4">Student ID</th>
              <th className="p-4">Name & Email</th>
              <th className="p-4">Program & Term</th>
              <th className="p-4">Assigned Route</th>
              <th className="p-4">Pickup Stop</th>
              <th className="p-4">Pass Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((std) => (
              <tr key={std.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-mono text-xs font-bold text-gray-900">{std.studentNo}</td>
                <td className="p-4">
                  <p className="font-bold text-gray-900">{std.name}</p>
                  <p className="text-xs text-gray-500">{std.email}</p>
                </td>
                <td className="p-4 text-gray-700">{std.program} ({std.semester})</td>
                <td className="p-4 text-gray-700">{std.assignedRoute}</td>
                <td className="p-4 text-gray-700">{std.pickupStop}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    {std.passStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
