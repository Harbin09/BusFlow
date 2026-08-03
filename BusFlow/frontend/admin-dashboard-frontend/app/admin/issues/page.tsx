'use client';

import { useEffect, useState } from 'react';
import { issuesApi } from '@/lib/api';

interface StudentIssue {
  id: string;
  studentId: string;
  studentName: string;
  studentNo: string;
  title: string;
  description: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
  adminResponse?: string;
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<StudentIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [selectedIssue, setSelectedIssue] = useState<StudentIssue | null>(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const data = await issuesApi.getStudentIssues();
      setIssues(data || []);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-50 border-red-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-50 border-yellow-200';
      case 'RESOLVED':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '🔴';
      case 'IN_PROGRESS':
        return '🟡';
      case 'RESOLVED':
        return '✅';
      default:
        return '⚪';
    }
  };

  const handleResolve = async (issueId: string) => {
    try {
      await issuesApi.resolveIssue(issueId, { adminResponse: response });
      setResponse('');
      setSelectedIssue(null);
      fetchIssues();
    } catch (error) {
      console.error('Failed to resolve issue:', error);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'ALL') return true;
    return issue.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading issues...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🆘 Student Issues</h1>
        <p className="text-gray-600 mt-2">
          Manage and resolve student reports ({filteredIssues.length} issues)
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Issues Grid */}
      <div className="grid gap-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No issues found</p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className={`p-6 rounded-lg border-2 cursor-pointer hover:shadow-lg transition ${getStatusColor(issue.status)}`}
              onClick={() => setSelectedIssue(issue)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getStatusIcon(issue.status)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                      <p className="text-sm text-gray-600">
                        {issue.studentName} ({issue.studentNo})
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{issue.description}</p>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(issue.severity)}`}>
                      {issue.severity}
                    </span>
                    <span className="text-xs text-gray-600">
                      {issue.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedIssue.title}</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedIssue.studentName} ({selectedIssue.studentNo})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="text-2xl text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Description</label>
                <p className="text-gray-900 mt-1">{selectedIssue.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Type</label>
                  <p className="text-gray-900 mt-1">{selectedIssue.type.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Severity</label>
                  <p className={`mt-1 font-semibold ${getSeverityColor(selectedIssue.severity)}`}>
                    {selectedIssue.severity}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Status</label>
                  <p className="text-gray-900 mt-1">{selectedIssue.status}</p>
                </div>
              </div>

              {selectedIssue.status !== 'RESOLVED' && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Admin Response</label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Write your response here..."
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                </div>
              )}

              {selectedIssue.adminResponse && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <label className="text-sm font-semibold text-gray-600">Admin Response</label>
                  <p className="text-gray-900 mt-1">{selectedIssue.adminResponse}</p>
                </div>
              )}
            </div>

            {selectedIssue.status !== 'RESOLVED' && (
              <div className="p-6 border-t flex gap-3 sticky bottom-0 bg-white">
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleResolve(selectedIssue.id)}
                  disabled={!response.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  ✅ Mark as Resolved
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
