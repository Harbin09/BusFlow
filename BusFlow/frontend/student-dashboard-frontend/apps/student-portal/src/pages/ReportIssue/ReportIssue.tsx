import React, { useState } from 'react';
import { Card } from '../../components/Card';
import { Navigation } from '../../components/Navigation';

export const ReportIssuePage: React.FC = () => {
  const [formData, setFormData] = useState({
    type: 'BUS_ISSUE',
    subject: '',
    description: '',
    priority: 'MEDIUM',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show success message (in a real app, this would send to backend)
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        type: 'BUS_ISSUE',
        subject: '',
        description: '',
        priority: 'MEDIUM',
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <Navigation />

      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }} className="sticky top-20 z-30 w-full">
        <div className="w-full px-4 md:px-8 py-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">🆘 Report Issue</h1>
            <p className="text-sm text-gray-600 mt-1">Submit feedback or report a problem</p>
          </div>
        </div>
      </header>

      <main className="w-full p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
        {submitted ? (
          <Card title="✅ Thank You!" subtitle="Report submitted">
            <div className="text-center py-8">
              <p className="text-lg text-green-600 font-semibold mb-3">
                Your report has been submitted successfully!
              </p>
              <p className="text-gray-600">
                Our support team will review your issue and get back to you within 24 hours.
              </p>
              <div className="mt-6 text-4xl">🎉</div>
            </div>
          </Card>
        ) : (
          <Card title="📝 Issue Report Form" subtitle="Tell us what went wrong">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Issue Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Issue Type <span className="text-red-600">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  style={{ fontSize: '16px' }}
                >
                  <option value="BUS_ISSUE">Bus Issue (late, didn't arrive, etc.)</option>
                  <option value="DRIVER_ISSUE">Driver Issue</option>
                  <option value="ROUTE_ISSUE">Route Issue</option>
                  <option value="APP_ISSUE">App Issue</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief summary of the issue"
                  required
                  maxLength={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.subject.length}/100 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide detailed information about the issue"
                  required
                  maxLength={500}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  style={{ fontSize: '16px' }}
                >
                  <option value="LOW">Low - Minor inconvenience</option>
                  <option value="MEDIUM">Medium - Affects my schedule</option>
                  <option value="HIGH">High - Serious issue</option>
                  <option value="CRITICAL">Critical - Safety concern</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!formData.subject || !formData.description}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                🚀 Submit Report
              </button>
            </form>
          </Card>
        )}

        <div className="mt-6">
          <Card title="📞 Need Immediate Help?" subtitle="Alternative support channels">
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-sm font-semibold text-gray-800">📧 Email Support</p>
                <p className="text-sm text-gray-600 mt-1">support@busflow.com</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-sm font-semibold text-gray-800">📱 Call Center</p>
                <p className="text-sm text-gray-600 mt-1">+1-800-BUS-FLOW (287-3569)</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                <p className="text-sm font-semibold text-gray-800">💬 Live Chat</p>
                <p className="text-sm text-gray-600 mt-1">Available 24/7 in the app</p>
              </div>
            </div>
          </Card>
        </div>
        </div>
      </main>
    </div>
  );
};
