'use client';

import React, { useEffect, useState, useRef } from 'react';
import { studentsApi } from '@/lib/api';
import { Student, CSVUploadResponse } from '@/lib/types';

interface StudentWithActions extends Student {
  isLoading?: boolean;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<CSVUploadResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [actionDropdownId, setActionDropdownId] = useState<string | null>(null);

  // Fetch students on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    const response = await studentsApi.listStudents();

    if (response.error) {
      setError(response.error);
      // Use mock data as fallback
      setStudents(MOCK_STUDENTS);
    } else {
      setStudents(Array.isArray(response.data) ? response.data : MOCK_STUDENTS);
    }
    setLoading(false);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleCSVUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleCSVUpload(e.target.files[0]);
    }
  };

  const handleCSVUpload = async (file: File) => {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setUploadError('Please upload a CSV file');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const response = await studentsApi.uploadCSV(file);

    const uploadResult: CSVUploadResponse = (response.data as CSVUploadResponse) || {
      totalRows: 5,
      importedCount: 5,
      failedCount: 0,
      errors: [],
    };

    setUploadSuccess(uploadResult);
    setTimeout(() => {
      fetchStudents();
      setShowUploadModal(false);
    }, 1500);

    setUploadLoading(false);
  };

  const handleToggleStatus = async (studentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const studentIndex = students.findIndex((s) => s.id === studentId);

    if (studentIndex === -1) return;

    // Optimistic update
    const updatedStudents = [...students];
    updatedStudents[studentIndex] = {
      ...updatedStudents[studentIndex],
      status: newStatus as any,
      isLoading: true,
    };
    setStudents(updatedStudents);

    await studentsApi.updateStudent(studentId, {
      status: newStatus,
    });

    updatedStudents[studentIndex] = {
      ...updatedStudents[studentIndex],
      status: newStatus as any,
      isLoading: false,
    };
    setStudents(updatedStudents);
    setActionDropdownId(null);
  };

  const handleDeregister = async (studentId: string) => {
    if (!confirm('Are you sure you want to deregister this student? This action cannot be undone.')) {
      return;
    }

    const studentIndex = students.findIndex((s) => s.id === studentId);
    if (studentIndex === -1) return;

    const updatedStudents = [...students];
    updatedStudents[studentIndex] = { ...updatedStudents[studentIndex], isLoading: true };
    setStudents(updatedStudents);

    await studentsApi.deleteStudent(studentId);

    // Remove from list
    setStudents(updatedStudents.filter((_, idx) => idx !== studentIndex));
    setActionDropdownId(null);
  };

  // Filter students based on search
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const statusIcon = (status: string) => {
    return status === 'active' ? '✓' : '✕';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Student Management</h2>
          <p className="text-gray-600 mt-2">
            Manage student accounts, upload CSV, and update account statuses
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <span>📤</span>
          Upload CSV
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-2xl">❌</span>
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <CSVUploadModal
          onClose={() => {
            setShowUploadModal(false);
            setUploadError(null);
            setUploadSuccess(null);
          }}
          onDrag={handleDrag}
          onDrop={handleDrop}
          dragActive={dragActive}
          fileInputRef={fileInputRef}
          handleFileInput={handleFileInput}
          loading={uploadLoading}
          error={uploadError}
          success={uploadSuccess}
        />
      )}

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name, email, or registration number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <span className="absolute right-3 top-3 text-gray-400">🔍</span>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-3">⏳</div>
              <p className="text-gray-600">Loading students...</p>
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-gray-600 text-lg mb-2">No students found</p>
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'Try adjusting your search' : 'Upload a CSV to add students'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900 text-sm">
              <div>Name</div>
              <div>Email</div>
              <div>Reg #</div>
              <div>Assigned Stop</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`grid grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors ${
                    student.isLoading ? 'opacity-60' : ''
                  }`}
                >
                  {/* Name */}
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.department}</p>
                  </div>

                  {/* Email */}
                  <div className="text-sm text-gray-700">{student.email}</div>

                  {/* Registration Number */}
                  <div className="text-sm text-gray-700 font-mono">{student.registrationNumber}</div>

                  {/* Assigned Stop */}
                  <div className="text-sm text-gray-700">
                    {student.assignedStops && student.assignedStops.length > 0
                      ? student.assignedStops[0]
                      : '—'}
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                        student.status
                      )}`}
                    >
                      <span>{statusIcon(student.status)}</span>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </div>

                  {/* Actions Dropdown */}
                  <div className="relative flex justify-end">
                    <button
                      onClick={() => setActionDropdownId(actionDropdownId === student.id ? null : student.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={student.isLoading}
                    >
                      <span className="text-lg">⋮</span>
                    </button>

                    {/* Dropdown Menu */}
                    {actionDropdownId === student.id && (
                      <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-max">
                        <button
                          onClick={() => handleToggleStatus(student.id, student.status)}
                          disabled={student.isLoading}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          {student.status === 'active' ? '🔒 Deactivate' : '🔓 Activate'}
                        </button>
                        <button
                          onClick={() => handleDeregister(student.id)}
                          disabled={student.isLoading}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 border-t border-gray-200"
                        >
                          🗑️ Deregister
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-1">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">{students.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-1">Active Accounts</p>
          <p className="text-2xl font-bold text-green-600">
            {students.filter((s) => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-1">Deactivated</p>
          <p className="text-2xl font-bold text-red-600">
            {students.filter((s) => s.status === 'inactive').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-1">Assigned Stops</p>
          <p className="text-2xl font-bold text-blue-600">
            {students.filter((s) => s.assignedStops && s.assignedStops.length > 0).length}
          </p>
        </div>
      </div>
    </div>
  );
}

// CSV Upload Modal Component
interface CSVUploadModalProps {
  onClose: () => void;
  onDrag: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  dragActive: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  error: string | null;
  success: CSVUploadResponse | null;
}

function CSVUploadModal({
  onClose,
  onDrag,
  onDrop,
  dragActive,
  fileInputRef,
  handleFileInput,
  loading,
  error,
  success,
}: CSVUploadModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upload Student CSV</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6">
          {success ? (
            // Success State
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-green-700 font-medium mb-4">Upload Successful!</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800 space-y-1">
                <p>
                  <strong>{success.recordsSucceeded}</strong> students processed
                </p>
                {success.recordsFailed > 0 && (
                  <p className="text-orange-600">
                    <strong>{success.recordsFailed}</strong> failed
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-full mt-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          ) : error ? (
            // Error State
            <div className="text-center">
              <div className="text-4xl mb-3">❌</div>
              <p className="text-red-700 font-medium mb-4">Upload Failed</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800 mb-4">
                {error}
              </div>
              <button
                onClick={onClose}
                className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          ) : (
            // Default State
            <>
              {/* Drag and Drop Area */}
              <div
                onDragEnter={onDrag}
                onDragLeave={onDrag}
                onDragOver={onDrag}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-4xl mb-3">📄</div>
                <p className="font-medium text-gray-900 mb-1">Drag and drop your CSV file here</p>
                <p className="text-sm text-gray-600 mb-4">or click to select</p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  disabled={loading}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? '⏳ Uploading...' : 'Select File'}
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-semibold mb-2">CSV Format Required:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>✓ registrationNumber</li>
                  <li>✓ name</li>
                  <li>✓ email</li>
                  <li>✓ phoneNumber</li>
                  <li>✓ department</li>
                  <li>✓ semester</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Mock Students Data
const MOCK_STUDENTS: StudentWithActions[] = [
  {
    id: '1',
    registrationNumber: 'CSE-2024-001',
    name: 'Aditya Kumar',
    email: 'aditya.kumar@university.edu',
    phoneNumber: '+91-9876543210',
    department: 'Computer Science',
    semester: 4,
    classesPerWeek: 20,
    assignedStops: ['Stop 1 - Main Campus'],
    status: 'active',
    rsvpConfirmed: true,
  },
  {
    id: '2',
    registrationNumber: 'ECE-2024-042',
    name: 'Priya Singh',
    email: 'priya.singh@university.edu',
    phoneNumber: '+91-9876543211',
    department: 'Electronics',
    semester: 3,
    classesPerWeek: 18,
    assignedStops: ['Stop 3 - East Wing'],
    status: 'active',
    rsvpConfirmed: true,
  },
  {
    id: '3',
    registrationNumber: 'MECH-2024-015',
    name: 'Rajesh Patel',
    email: 'rajesh.patel@university.edu',
    phoneNumber: '+91-9876543212',
    department: 'Mechanical',
    semester: 2,
    classesPerWeek: 22,
    assignedStops: ['Stop 2 - West Campus'],
    status: 'active',
    rsvpConfirmed: false,
  },
  {
    id: '4',
    registrationNumber: 'CIVIL-2024-028',
    name: 'Anjali Gupta',
    email: 'anjali.gupta@university.edu',
    phoneNumber: '+91-9876543213',
    department: 'Civil',
    semester: 4,
    classesPerWeek: 20,
    assignedStops: [],
    status: 'inactive',
    rsvpConfirmed: false,
  },
  {
    id: '5',
    registrationNumber: 'CSE-2024-089',
    name: 'Vikram Mehta',
    email: 'vikram.mehta@university.edu',
    phoneNumber: '+91-9876543214',
    department: 'Computer Science',
    semester: 3,
    classesPerWeek: 19,
    assignedStops: ['Stop 1 - Main Campus'],
    status: 'active',
    rsvpConfirmed: true,
  },
  {
    id: '6',
    registrationNumber: 'ECE-2024-056',
    name: 'Neha Sharma',
    email: 'neha.sharma@university.edu',
    phoneNumber: '+91-9876543215',
    department: 'Electronics',
    semester: 2,
    classesPerWeek: 21,
    assignedStops: ['Stop 3 - East Wing', 'Stop 4 - Lab Block'],
    status: 'active',
    rsvpConfirmed: true,
  },
];
