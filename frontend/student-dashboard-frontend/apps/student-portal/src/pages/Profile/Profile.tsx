import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Navigation } from '../../components/Navigation';
import { studentApi } from '../../services/api/studentApi';
import { StudentProfile } from '../../types';

export const ProfilePage: React.FC = () => {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profileData = await studentApi.getStudentProfile();
      setStudent(profileData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
        <Navigation />
        <div className="w-full p-4 md:p-8">
          <div className="max-w-6xl mx-auto animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <Navigation />

      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }} className="sticky top-20 z-30 w-full">
        <div className="w-full px-4 md:px-8 py-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">👤 My Profile</h1>
            <p className="text-sm text-gray-600 mt-1">Your account details and information</p>
          </div>
        </div>
      </header>

      <main className="w-full p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
        {student ? (
          <>
            <Card title="👋 Basic Information" subtitle="Personal details">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 font-medium">FULL NAME</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      {student.name || 'Not provided'}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 font-medium">EMAIL ADDRESS</p>
                    <p className="text-sm font-bold text-green-600 mt-1 break-all">{student.email}</p>
                  </div>
                  {student.studentNo && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 font-medium">STUDENT NUMBER</p>
                      <p className="text-lg font-bold text-purple-600 mt-1">{student.studentNo}</p>
                    </div>
                  )}
                  {student.program && (
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 font-medium">PROGRAM</p>
                      <p className="text-sm font-bold text-orange-600 mt-1">{student.program}</p>
                    </div>
                  )}
                  {student.semester && (
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 font-medium">SEMESTER</p>
                      <p className="text-lg font-bold text-indigo-600 mt-1">{student.semester}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <div className="mt-6">
              <Card title="📍 Addresses" subtitle="Home and school locations">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                    <p className="text-xs text-gray-600 font-medium mb-2">🏠 HOME ADDRESS</p>
                    <p className="text-sm font-semibold text-gray-800">{student.homeAddress}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <p className="text-xs text-gray-600 font-medium mb-2">🏫 SCHOOL ADDRESS</p>
                    <p className="text-sm font-semibold text-gray-800">{student.schoolAddress}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-6">
              <Card title="⚠️ Important Notes" subtitle="Things to remember">
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <p className="text-sm text-blue-800">
                      📍 Always arrive at your pickup point at least 5 minutes early to ensure you don't miss your
                      bus.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <p className="text-sm text-green-800">
                      🔔 Enable notifications to receive real-time updates about your bus and trips.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <p className="text-sm text-purple-800">
                      💬 Contact support if you need assistance with your profile or have any questions.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        ) : (
          <Card title="Error" subtitle="Profile">
            <p className="text-red-600">Failed to load your profile. Please refresh the page.</p>
          </Card>
        )}
        </div>
      </main>
    </div>
  );
};
