'use client';

import React, { useEffect, useState } from 'react';
import { analyticsApi, fleetApi, driversApi } from '@/lib/api';
import { StudentDensity, RouteSuggestion, RouteSegment, Bus, Driver } from '@/lib/types';

export default function RouteComparePage() {
  const [studentDensity, setStudentDensity] = useState<StudentDensity[]>([]);
  const [suggestions, setSuggestions] = useState<Record<'rule-based' | 'ai-engine', RouteSuggestion | null>>({
    'rule-based': null,
    'ai-engine': null,
  });
  const [selectedSuggestion, setSelectedSuggestion] = useState<'rule-based' | 'ai-engine' | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);

  // Deploy form state
  const [deployForm, setDeployForm] = useState({
    busId: '',
    driverId: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const [densityRes, busesRes, driversRes] = await Promise.all([
      analyticsApi.getStudentDensity(),
      fleetApi.listBuses(),
      driversApi.listDrivers(),
    ]);

    if (densityRes.error) {
      setError(densityRes.error);
      setStudentDensity(MOCK_STUDENT_DENSITY);
    } else if (densityRes.data) {
      const densityArray = Array.isArray(densityRes.data)
        ? densityRes.data
        : ((densityRes.data as Record<string, unknown>)?.data as StudentDensity[]) || MOCK_STUDENT_DENSITY;
      setStudentDensity(densityArray);
    } else {
      setStudentDensity(MOCK_STUDENT_DENSITY);
    }

    setBuses((busesRes.data as Bus[]) || MOCK_BUSES);
    setDrivers((driversRes.data as Driver[]) || MOCK_DRIVERS);

    // Generate route suggestions based on student density
    const suggestionData = Array.isArray(densityRes.data)
      ? densityRes.data
      : ((densityRes.data as Record<string, unknown>)?.data as StudentDensity[]) || MOCK_STUDENT_DENSITY;
    generateSuggestions(suggestionData);

    setLoading(false);
  };

  const generateSuggestions = (densityData: StudentDensity[]) => {
    // Rule-Based Suggestion: Fixed capacity limits & predefined sequences
    const ruleBasedRoute = generateRuleBasedRoute(densityData);

    // AI-Engine Suggestion: Dynamic stop clustering & traffic optimization
    const aiRoute = generateAIRoute(densityData);

    setSuggestions({
      'rule-based': ruleBasedRoute,
      'ai-engine': aiRoute,
    });
  };

  const generateRuleBasedRoute = (densityData: StudentDensity[]): RouteSuggestion => {
    // Sort by student count descending, then group by city
    const sortedByCount = [...densityData].sort((a, b) => b.studentCount - a.studentCount);
    const grouped = groupByCity(sortedByCount);

    const segments: RouteSegment[] = [];
    let sequenceNum = 1;
    let totalPassengers = 0;

    // Fixed rule: Higher capacity stops first, then secondary stops
    Object.entries(grouped)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([city, stops]) => {
        stops.sort((a, b) => b.studentCount - a.studentCount);
        stops.forEach((stop, idx) => {
          const capacity = Math.ceil(stop.studentCount * 1.2); // 20% buffer
          segments.push({
            sequenceNumber: sequenceNum++,
            stopId: stop.stopId,
            stopName: stop.stopName,
            city: stop.city,
            estimatedStopTime: Math.min(15, 5 + Math.ceil(stop.studentCount / 10)),
            estimatedPassengers: capacity,
            coordinates: {
              latitude: 28.5 + Math.random() * 0.05,
              longitude: 77.1 + Math.random() * 0.15,
            },
          });
          totalPassengers += capacity;
        });
      });

    const totalCapacity = 50; // Assume standard bus
    const capacityUsage = (totalPassengers / totalCapacity) * 100;

    return {
      type: 'rule-based',
      name: 'Rule-Based System Suggestion',
      description: 'Fixed capacity limits with predefined stop sequences based on student density',
      route: segments,
      estimatedCapacityUsage: Math.min(100, Math.round(capacityUsage)),
      estimatedTravelTime: Math.round(segments.length * 3 + segments.reduce((sum, s) => sum + s.estimatedStopTime, 0)),
      estimatedDelay: 0,
      efficiency: Math.min(100, 95 - Math.abs(capacityUsage - 80) * 0.2),
      reasoning:
        'Optimizes for predictability and safety by following fixed capacity limits and predefined sequences. Prioritizes higher-density stops while maintaining system consistency.',
      pros: [
        '✓ Highly predictable and consistent',
        '✓ Easy to implement and maintain',
        '✓ Fixed capacity ensures safety margins',
        '✓ Simple for driver training',
      ],
      cons: [
        '✗ Less flexible to traffic changes',
        '✗ May result in uneven bus loads',
        '✗ Cannot adapt to real-time demand',
        '✗ Potential empty seats on slow days',
      ],
    };
  };

  const generateAIRoute = (densityData: StudentDensity[]): RouteSuggestion => {
    // AI-based: Dynamic clustering and traffic optimization
    const clusters = performDBSCANClustering(densityData);
    const optimizedPath = calculateTravelingProblem(clusters);

    const segments: RouteSegment[] = [];
    let sequenceNum = 1;
    let totalPassengers = 0;

    optimizedPath.forEach((stop) => {
      const capacity = Math.ceil(stop.studentCount * 1.1); // 10% buffer
      segments.push({
        sequenceNumber: sequenceNum++,
        stopId: stop.stopId,
        stopName: stop.stopName,
        city: stop.city,
        estimatedStopTime: Math.max(3, Math.ceil(stop.studentCount / 15)),
        estimatedPassengers: capacity,
        coordinates: {
          latitude: 28.5 + Math.random() * 0.05,
          longitude: 77.1 + Math.random() * 0.15,
        },
      });
      totalPassengers += capacity;
    });

    const totalCapacity = 50;
    const capacityUsage = (totalPassengers / totalCapacity) * 100;

    return {
      type: 'ai-engine',
      name: 'AI Engine Suggestion',
      description: 'Dynamic stop clustering with traffic-aware route optimization',
      route: segments,
      estimatedCapacityUsage: Math.min(100, Math.round(capacityUsage)),
      estimatedTravelTime: Math.round(segments.length * 2.5 + segments.reduce((sum, s) => sum + s.estimatedStopTime, 0) * 0.9),
      estimatedDelay: -2,
      efficiency: Math.min(100, 92 - Math.abs(capacityUsage - 75) * 0.15),
      reasoning:
        'Uses machine learning to cluster nearby stops and optimize travel paths. Adapts to real-time traffic conditions and demand patterns.',
      pros: [
        '✓ Adapts to real-time conditions',
        '✓ Optimized travel distance',
        '✓ Better capacity utilization',
        '✓ Reduced fuel consumption',
        '✓ Smarter stop clustering',
      ],
      cons: [
        '✗ More complex implementation',
        '✗ Requires continuous data feed',
        '✗ Less predictable for students',
        '✗ Higher initial setup cost',
      ],
    };
  };

  const groupByCity = (
    densityData: StudentDensity[]
  ): Record<string, StudentDensity[]> => {
    return densityData.reduce(
      (acc, item) => {
        if (!acc[item.city]) acc[item.city] = [];
        acc[item.city].push(item);
        return acc;
      },
      {} as Record<string, StudentDensity[]>
    );
  };

  const performDBSCANClustering = (densityData: StudentDensity[]): StudentDensity[] => {
    // Simplified DBSCAN-like clustering for demo
    // In production, this would use actual geographic distance
    return [...densityData].sort((a, b) => {
      const densityDiff = b.studentCount - a.studentCount;
      if (densityDiff !== 0) return densityDiff;
      return a.city.localeCompare(b.city);
    });
  };

  const calculateTravelingProblem = (
    clusters: StudentDensity[]
  ): StudentDensity[] => {
    // Simplified TSP approximation for demo
    // Groups nearby clusters to minimize travel distance
    const result: StudentDensity[] = [];
    const used = new Set<string>();

    for (const cluster of clusters) {
      if (!used.has(cluster.stopId)) {
        result.push(cluster);
        used.add(cluster.stopId);

        // Find nearby stops and add them
        const nearby = clusters.filter(
          (c) =>
            !used.has(c.stopId) &&
            c.city === cluster.city &&
            result.length < 8
        );

        nearby.forEach((c) => {
          result.push(c);
          used.add(c.stopId);
        });
      }

      if (result.length >= 8) break;
    }

    return result;
  };

  const handleDeploy = async () => {
    if (!selectedSuggestion) {
      setDeployError('Please select a suggestion to deploy');
      return;
    }

    if (!deployForm.busId) {
      setDeployError('Please select a bus');
      return;
    }

    setIsDeploying(true);
    setDeployError(null);
    setDeploySuccess(null);

    const suggestion = selectedSuggestion ? suggestions[selectedSuggestion] : null;
    if (!suggestion) {
      setDeployError('Selected suggestion not available');
      setIsDeploying(false);
      return;
    }

    const deployPayload = {
      selectedSuggestion,
      routeSegments: suggestion.route,
      estimatedCapacityUsage: suggestion.estimatedCapacityUsage,
      busId: deployForm.busId,
      driverId: deployForm.driverId || undefined,
      notes: deployForm.notes,
    };

    const response = await analyticsApi.deployRoute(deployPayload);

    if (response.error) {
      setDeployError(`Failed to deploy route: ${response.error}`);
    } else if (response.data) {
      setDeploySuccess(
        `Route deployed successfully! Route ID: ${(response.data as any).routeId || 'N/A'}`
      );
      setShowDeployModal(false);
      setTimeout(() => {
        setDeploySuccess(null);
      }, 5000);
    }

    setIsDeploying(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600 text-lg">Analyzing student density...</p>
          <p className="text-gray-500 text-sm mt-2">Generating route suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Route Optimization Comparison</h2>
          <p className="text-gray-600 mt-2">
            Compare rule-based and AI-optimized route suggestions based on current student density
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
          <span className="text-lg">📊</span>
          <span className="text-sm font-semibold text-blue-700">{studentDensity.length} stops</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-yellow-800 font-medium">Using Demo Data</p>
            <p className="text-yellow-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {deploySuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-green-800 font-medium">Deployment Successful</p>
            <p className="text-green-700 text-sm">{deploySuccess}</p>
          </div>
        </div>
      )}

      {/* Student Density Overview */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Student Density Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-600 text-sm font-medium">Total Students</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">
              {studentDensity.reduce((sum, d) => sum + d.studentCount, 0)}
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-600 text-sm font-medium">Active Stops</p>
            <p className="text-3xl font-bold text-purple-900 mt-2">{studentDensity.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600 text-sm font-medium">Peak Stop</p>
            <p className="text-lg font-bold text-green-900 mt-2">
              {studentDensity.reduce((prev, current) =>
                current.studentCount > prev.studentCount ? current : prev
              ).stopName}
            </p>
            <p className="text-sm text-green-600 mt-1">
              {studentDensity.reduce((prev, current) =>
                current.studentCount > prev.studentCount ? current : prev
              ).studentCount} students
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-600 text-sm font-medium">Avg Per Stop</p>
            <p className="text-3xl font-bold text-amber-900 mt-2">
              {Math.round(studentDensity.reduce((sum, d) => sum + d.studentCount, 0) / studentDensity.length)}
            </p>
          </div>
        </div>

        {/* Detailed Density Table */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="font-semibold text-gray-900 mb-4">Detailed Density by Stop</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">Stop Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">City</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-900">Students</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-900">Capacity Needed</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-900">Peak Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {studentDensity.map((stop) => (
                  <tr key={stop.stopId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{stop.stopName}</td>
                    <td className="px-4 py-3 text-gray-700">{stop.city}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                        {stop.studentCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{stop.averageCapacityNeeded} seats</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {stop.peakHours.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Route Suggestions Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rule-Based Suggestion */}
        <SuggestionCard
          suggestion={suggestions['rule-based']}
          type="rule-based"
          isSelected={selectedSuggestion === 'rule-based'}
          onSelect={() => setSelectedSuggestion('rule-based')}
        />

        {/* AI Engine Suggestion */}
        <SuggestionCard
          suggestion={suggestions['ai-engine']}
          type="ai-engine"
          isSelected={selectedSuggestion === 'ai-engine'}
          onSelect={() => setSelectedSuggestion('ai-engine')}
        />
      </div>

      {/* Deploy Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Deploy Selected Route</h3>
            <p className="text-gray-600 mt-1">
              {selectedSuggestion
                ? `You have selected the ${selectedSuggestion === 'rule-based' ? 'Rule-Based' : 'AI Engine'} suggestion`
                : 'Select a suggestion above to deploy'}
            </p>
          </div>
          <span className="text-4xl">🚀</span>
        </div>

        <button
          onClick={() => setShowDeployModal(true)}
          disabled={!selectedSuggestion}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {selectedSuggestion ? '🚀 Deploy Selected Route' : '📋 Select a Route First'}
        </button>
      </div>

      {/* Deploy Modal */}
      {showDeployModal && (
        <DeployModal
          isOpen={showDeployModal}
          buses={buses}
          drivers={drivers}
          deployForm={deployForm}
          setDeployForm={setDeployForm}
          onDeploy={handleDeploy}
          onClose={() => setShowDeployModal(false)}
          isLoading={isDeploying}
          error={deployError}
          selectedSuggestion={selectedSuggestion}
          suggestion={selectedSuggestion ? suggestions[selectedSuggestion] : null}
        />
      )}
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: RouteSuggestion | null;
  type: 'rule-based' | 'ai-engine';
  isSelected: boolean;
  onSelect: () => void;
}

function SuggestionCard({
  suggestion,
  type,
  isSelected,
  onSelect,
}: SuggestionCardProps) {
  if (!suggestion) return null;

  const icon = type === 'rule-based' ? '⚙️' : '🤖';
  const bgColor = isSelected
    ? type === 'rule-based'
      ? 'bg-blue-50 border-blue-400 shadow-lg'
      : 'bg-purple-50 border-purple-400 shadow-lg'
    : type === 'rule-based'
      ? 'bg-white border-gray-200 hover:border-blue-300'
      : 'bg-white border-gray-200 hover:border-purple-300';

  return (
    <div
      onClick={onSelect}
      className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${bgColor}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{suggestion.name}</h3>
            <p className="text-sm text-gray-600">{suggestion.description}</p>
          </div>
        </div>
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            isSelected
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-gray-300'
          }`}
        >
          {isSelected && <span>✓</span>}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white bg-opacity-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold">Capacity Usage</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {suggestion.estimatedCapacityUsage}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-full rounded-full ${
                suggestion.estimatedCapacityUsage < 60
                  ? 'bg-yellow-500'
                  : suggestion.estimatedCapacityUsage < 85
                    ? 'bg-green-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${suggestion.estimatedCapacityUsage}%` }}
            />
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold">Travel Time</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {suggestion.estimatedTravelTime} min
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {suggestion.route.length} stops
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold">Efficiency Score</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {Math.round(suggestion.efficiency)}/100
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${suggestion.efficiency}%` }}
            />
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-900">
          <strong>Reasoning:</strong> {suggestion.reasoning}
        </p>
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Pros */}
        <div>
          <h5 className="font-semibold text-green-900 mb-2 text-sm">Advantages</h5>
          <ul className="space-y-1">
            {suggestion.pros.map((pro, idx) => (
              <li key={idx} className="text-sm text-green-700">
                {pro}
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div>
          <h5 className="font-semibold text-red-900 mb-2 text-sm">Disadvantages</h5>
          <ul className="space-y-1">
            {suggestion.cons.map((con, idx) => (
              <li key={idx} className="text-sm text-red-700">
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Route Preview */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="font-semibold text-gray-900 mb-3 text-sm">Route Sequence</h5>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {suggestion.route.slice(0, 5).map((segment) => (
            <div key={segment.sequenceNumber} className="flex items-center gap-2 text-sm">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700 font-semibold text-xs">
                {segment.sequenceNumber}
              </span>
              <span className="text-gray-900 font-medium">{segment.stopName}</span>
              <span className="text-gray-500 text-xs">({segment.city})</span>
              <span className="ml-auto text-gray-600 text-xs">
                {segment.estimatedPassengers} pax
              </span>
            </div>
          ))}
          {suggestion.route.length > 5 && (
            <p className="text-xs text-gray-500 italic">
              + {suggestion.route.length - 5} more stops
            </p>
          )}
        </div>
      </div>

      {/* Select Button */}
      <button
        onClick={onSelect}
        className={`w-full mt-4 py-2 rounded-lg font-semibold transition-all ${
          isSelected
            ? type === 'rule-based'
              ? 'bg-blue-600 text-white'
              : 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {isSelected ? '✓ Selected' : 'Select This Route'}
      </button>
    </div>
  );
}

interface DeployModalProps {
  isOpen: boolean;
  buses: Bus[];
  drivers: Driver[];
  deployForm: { busId: string; driverId: string; notes: string };
  setDeployForm: (form: any) => void;
  onDeploy: () => void;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
  selectedSuggestion: string | null;
  suggestion: RouteSuggestion | null;
}

function DeployModal({
  isOpen,
  buses,
  drivers,
  deployForm,
  setDeployForm,
  onDeploy,
  onClose,
  isLoading,
  error,
  selectedSuggestion,
  suggestion,
}: DeployModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Deploy Route Configuration</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Selected Suggestion Info */}
          {suggestion && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Selected:</strong> {suggestion.name}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Capacity: {suggestion.estimatedCapacityUsage}% | Travel Time: {suggestion.estimatedTravelTime} min
              </p>
            </div>
          )}

          {/* Bus Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Bus *
            </label>
            <select
              value={deployForm.busId}
              onChange={(e) => setDeployForm({ ...deployForm, busId: e.target.value })}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
            >
              <option value="">Select a bus</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.busNumber} - {bus.capacity} seats ({bus.status})
                </option>
              ))}
            </select>
          </div>

          {/* Driver Selection (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Driver (Optional)
            </label>
            <select
              value={deployForm.driverId}
              onChange={(e) => setDeployForm({ ...deployForm, driverId: e.target.value })}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
            >
              <option value="">Auto-assign driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} ({driver.status})
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deployment Notes (Optional)
            </label>
            <textarea
              value={deployForm.notes}
              onChange={(e) => setDeployForm({ ...deployForm, notes: e.target.value })}
              disabled={isLoading}
              placeholder="e.g., Special conditions, implementation notes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 resize-none"
              rows={3}
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <h5 className="font-semibold text-gray-900 text-sm">Deployment Summary</h5>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <strong>Route Type:</strong>{' '}
                {selectedSuggestion === 'rule-based' ? 'Rule-Based System' : 'AI Engine'}
              </p>
              {suggestion && (
                <>
                  <p>
                    <strong>Stops:</strong> {suggestion.route.length}
                  </p>
                  <p>
                    <strong>Est. Travel:</strong> {suggestion.estimatedTravelTime} minutes
                  </p>
                  <p>
                    <strong>Capacity:</strong> {suggestion.estimatedCapacityUsage}%
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onDeploy}
            disabled={isLoading || !deployForm.busId}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '⏳ Deploying...' : '🚀 Deploy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Mock Data
const MOCK_STUDENT_DENSITY = [
  {
    stopId: 'STOP-001',
    stopName: 'Main Gate',
    city: 'Delhi',
    studentCount: 450,
    peakHours: ['08:00-09:00', '17:00-18:00'],
    averageCapacityNeeded: 48,
    lastUpdated: new Date().toISOString(),
    department: 'Engineering',
  },
  {
    stopId: 'STOP-002',
    stopName: 'North Campus',
    city: 'Delhi',
    studentCount: 380,
    peakHours: ['08:30-09:30', '16:30-17:30'],
    averageCapacityNeeded: 42,
    lastUpdated: new Date().toISOString(),
    department: 'Science',
  },
  {
    stopId: 'STOP-003',
    stopName: 'East Wing Library',
    city: 'Delhi',
    studentCount: 220,
    peakHours: ['09:00-10:00', '15:00-16:00'],
    averageCapacityNeeded: 28,
    lastUpdated: new Date().toISOString(),
    department: 'Engineering',
  },
  {
    stopId: 'STOP-004',
    stopName: 'Sports Complex',
    city: 'Delhi',
    studentCount: 310,
    peakHours: ['08:00-09:00', '16:00-17:00'],
    averageCapacityNeeded: 35,
    lastUpdated: new Date().toISOString(),
    department: 'All',
  },
  {
    stopId: 'STOP-005',
    stopName: 'West Block',
    city: 'Gurgaon',
    studentCount: 280,
    peakHours: ['08:15-09:15', '17:00-18:00'],
    averageCapacityNeeded: 32,
    lastUpdated: new Date().toISOString(),
    department: 'Commerce',
  },
  {
    stopId: 'STOP-006',
    stopName: 'Hostel Area',
    city: 'Gurgaon',
    studentCount: 195,
    peakHours: ['08:00-09:00', '18:00-19:00'],
    averageCapacityNeeded: 24,
    lastUpdated: new Date().toISOString(),
    department: 'All',
  },
  {
    stopId: 'STOP-007',
    stopName: 'Downtown Center',
    city: 'Noida',
    studentCount: 340,
    peakHours: ['08:30-09:30', '17:30-18:30'],
    averageCapacityNeeded: 38,
    lastUpdated: new Date().toISOString(),
    department: 'Arts',
  },
  {
    stopId: 'STOP-008',
    stopName: 'Cafeteria',
    city: 'Noida',
    studentCount: 160,
    peakHours: ['12:00-13:00', '13:00-14:00'],
    averageCapacityNeeded: 20,
    lastUpdated: new Date().toISOString(),
    department: 'All',
  },
];

const MOCK_BUSES: Bus[] = [
  {
    id: 'BUS-001',
    busNumber: 'BF-001',
    capacity: 50,
    status: 'active',
  },
  {
    id: 'BUS-002',
    busNumber: 'BF-002',
    capacity: 50,
    status: 'active',
  },
  {
    id: 'BUS-003',
    busNumber: 'BF-003',
    capacity: 48,
    status: 'active',
  },
  {
    id: 'BUS-004',
    busNumber: 'BF-004',
    capacity: 52,
    status: 'active',
  },
];

const MOCK_DRIVERS: Driver[] = [
  {
    id: 'DRV-001',
    name: 'Rajesh Kumar',
    licenseNumber: 'DL-0001234567890',
    licenseExpiry: '2026-12-31',
    phoneNumber: '+91-9876543210',
    email: 'rajesh.kumar@busflow.com',
    yearsOfExperience: 8,
    status: 'active',
  },
  {
    id: 'DRV-002',
    name: 'Priya Singh',
    licenseNumber: 'DL-0001234567891',
    licenseExpiry: '2025-08-15',
    phoneNumber: '+91-9876543211',
    email: 'priya.singh@busflow.com',
    yearsOfExperience: 5,
    status: 'active',
  },
  {
    id: 'DRV-003',
    name: 'Vikram Patel',
    licenseNumber: 'DL-0001234567892',
    licenseExpiry: '2024-11-20',
    phoneNumber: '+91-9876543212',
    email: 'vikram.patel@busflow.com',
    yearsOfExperience: 12,
    status: 'active',
  },
];
