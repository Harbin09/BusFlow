'use client';

import React, { useEffect, useState } from 'react';
import { weatherApi, notificationsApi, routesApi, fleetApi, driversApi } from '@/lib/api';
import { Weather, Notification, Route, Bus, Driver } from '@/lib/types';

interface BroadcastForm {
  targetType: 'all_students' | 'specific_route' | 'specific_bus' | 'specific_driver';
  selectedIds: string[];
  title: string;
  message: string;
  notificationType: 'broadcast' | 'alert' | 'delay' | 'event';
}

export default function AlertsPage() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  const [broadcastForm, setBroadcastForm] = useState<BroadcastForm>({
    targetType: 'all_students',
    selectedIds: [],
    title: '',
    message: '',
    notificationType: 'broadcast',
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const [weatherRes, notificationsRes, routesRes, busesRes, driversRes] = await Promise.all([
      weatherApi.getWeather(),
      notificationsApi.getNotifications(),
      routesApi.listRoutes(),
      fleetApi.listBuses(),
      driversApi.listDrivers(),
    ]);

    setWeather(weatherRes.data as Weather || MOCK_WEATHER);
    setNotifications(Array.isArray(notificationsRes.data) ? notificationsRes.data : MOCK_NOTIFICATIONS);
    setRoutes(Array.isArray(routesRes.data) ? routesRes.data : MOCK_ROUTES);
    setBuses(Array.isArray(busesRes.data) ? busesRes.data : MOCK_BUSES);
    setDrivers(Array.isArray(driversRes.data) ? driversRes.data : MOCK_DRIVERS);

    if (weatherRes.error) {
      setWeatherError(weatherRes.error);
    } else {
      setWeatherError(null);
    }

    if (notificationsRes.error) {
      setError(notificationsRes.error);
    } else {
      setError(null);
    }

    setLoading(false);
  };

  const handleTriggerRainAlert = async () => {
    setWeatherLoading(true);
    setWeatherError(null);

    const response = await weatherApi.checkWeather();

    if (response.error) {
      setWeatherError(`Failed to trigger rain alert: ${response.error}`);
    } else {
      setSendSuccess('Rain alert triggered successfully!');
      setTimeout(() => setSendSuccess(null), 3000);
      // Refresh weather data
      const weatherRes = await weatherApi.getWeather();
      if (!weatherRes.error && weatherRes.data) {
        setWeather(weatherRes.data as Weather);
      }
    }

    setWeatherLoading(false);
  };

  const handleSendNotification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSendError(null);
    setSendSuccess(null);

    // Validation
    if (!broadcastForm.title.trim()) {
      setSendError('Notification title is required');
      return;
    }
    if (!broadcastForm.message.trim()) {
      setSendError('Notification message is required');
      return;
    }
    if (broadcastForm.targetType !== 'all_students' && broadcastForm.selectedIds.length === 0) {
      setSendError(`Please select at least one ${broadcastForm.targetType.replace('specific_', '')}`);
      return;
    }

    setSendLoading(true);

    const payload = {
      type: broadcastForm.notificationType,
      title: broadcastForm.title,
      message: broadcastForm.message,
      recipients: broadcastForm.targetType,
      recipientIds:
        broadcastForm.targetType === 'all_students' ? undefined : broadcastForm.selectedIds,
    };

    const response = await notificationsApi.sendNotification(payload);

    if (response.error) {
      setSendError(`Failed to send notification: ${response.error}`);
    } else {
      setSendSuccess('Notification sent successfully!');
      // Reset form
      setBroadcastForm({
        targetType: 'all_students',
        selectedIds: [],
        title: '',
        message: '',
        notificationType: 'broadcast',
      });
      // Refresh notifications list
      setTimeout(() => {
        fetchData();
        setSendSuccess(null);
      }, 1500);
    }

    setSendLoading(false);
  };

  const toggleSelection = (id: string) => {
    setBroadcastForm((prev) => ({
      ...prev,
      selectedIds: prev.selectedIds.includes(id)
        ? prev.selectedIds.filter((sid) => sid !== id)
        : [...prev.selectedIds, id],
    }));
  };

  const selectAllOptions = () => {
    const ids =
      broadcastForm.targetType === 'specific_route'
        ? routes.map((r) => r.id)
        : broadcastForm.targetType === 'specific_bus'
          ? buses.map((b) => b.id)
          : drivers.map((d) => d.id);
    setBroadcastForm((prev) => ({
      ...prev,
      selectedIds: ids,
    }));
  };

  const clearSelection = () => {
    setBroadcastForm((prev) => ({
      ...prev,
      selectedIds: [],
    }));
  };

  const getTargetOptions = () => {
    switch (broadcastForm.targetType) {
      case 'specific_route':
        return routes;
      case 'specific_bus':
        return buses;
      case 'specific_driver':
        return drivers;
      default:
        return [];
    }
  };

  const getTargetLabel = () => {
    switch (broadcastForm.targetType) {
      case 'all_students':
        return 'All Registered Students';
      case 'specific_route':
        return 'Route Commuters';
      case 'specific_bus':
        return 'Bus';
      case 'specific_driver':
        return 'Driver';
      default:
        return '';
    }
  };

  const getTargetItemLabel = (item: any) => {
    if ('name' in item) return item.name;
    if ('routeName' in item) return item.routeName;
    if ('busNumber' in item) return item.busNumber;
    return item.id;
  };

  const filteredOptions = getTargetOptions().filter((item) =>
    getTargetItemLabel(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600 text-lg">Loading alerts and weather...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Alerts & Weather</h2>
          <p className="text-gray-600 mt-2">
            Monitor weather conditions and broadcast notifications to students
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200">
          <span className="text-lg">🌧️</span>
          <span className="text-sm font-semibold text-orange-700">{weather?.condition || 'Clear'}</span>
        </div>
      </div>

      {/* Success Alert */}
      {sendSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-green-800 font-medium">Success</p>
            <p className="text-green-700 text-sm">{sendSuccess}</p>
          </div>
        </div>
      )}

      {/* Weather Widget & Broadcast Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <WeatherWidget
          weather={weather}
          loading={weatherLoading}
          error={weatherError}
          onTriggerAlert={handleTriggerRainAlert}
        />

        {/* Broadcast Console */}
        <div className="lg:col-span-2">
          <BroadcastConsole
            form={broadcastForm}
            setForm={setBroadcastForm}
            onSubmit={handleSendNotification}
            loading={sendLoading}
            error={sendError}
            targetLabel={getTargetLabel()}
            targetOptions={filteredOptions}
            selectedCount={broadcastForm.selectedIds.length}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onToggleSelection={toggleSelection}
            onSelectAll={selectAllOptions}
            onClearSelection={clearSelection}
            getTargetItemLabel={getTargetItemLabel}
            showTargetSelector={broadcastForm.targetType !== 'all_students'}
          />
        </div>
      </div>

      {/* Notification History */}
      <NotificationHistory
        notifications={notifications.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )}
      />
    </div>
  );
}

interface WeatherWidgetProps {
  weather: Weather | null;
  loading: boolean;
  error: string | null;
  onTriggerAlert: () => void;
}

function WeatherWidget({
  weather,
  loading,
  error,
  onTriggerAlert,
}: WeatherWidgetProps) {
  if (!weather) return null;

  const precipColor =
    weather.precipitationProbability > 60
      ? 'text-red-600'
      : weather.precipitationProbability > 30
        ? 'text-yellow-600'
        : 'text-green-600';

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4">
        <h3 className="text-xl font-bold">Weather Status</h3>
        <p className="text-sm text-blue-100 mt-1">Real-time conditions</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        )}

        {/* Main Weather Info */}
        <div className="space-y-4">
          {/* Condition & Icon */}
          <div className="flex items-center gap-4">
            <span className="text-6xl">{weather.icon || '🌤️'}</span>
            <div>
              <p className="text-3xl font-bold text-gray-900">{weather.temperature}°C</p>
              <p className="text-gray-600 text-sm mt-1">{weather.condition}</p>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-semibold">HUMIDITY</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{weather.humidity}%</p>
            </div>
            <div className="bg-white bg-opacity-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-semibold">WIND</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{weather.windSpeed} km/h</p>
            </div>
            <div className="bg-white bg-opacity-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-semibold">VISIBILITY</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{weather.visibility} km</p>
            </div>
            <div className={`bg-white bg-opacity-50 rounded-lg p-3 ${precipColor}`}>
              <p className="text-xs font-semibold">PRECIPITATION</p>
              <p className="text-2xl font-bold mt-1">{weather.precipitationProbability}%</p>
            </div>
          </div>
        </div>

        {/* Forecast */}
        {weather.forecast && weather.forecast.length > 0 && (
          <div className="border-t border-blue-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">3-Day Forecast</h4>
            <div className="space-y-2">
              {weather.forecast.slice(0, 3).map((day, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm bg-white bg-opacity-50 rounded-lg p-2"
                >
                  <span className="font-medium text-gray-900">{day.date}</span>
                  <span className="text-gray-600">{day.condition}</span>
                  <span className="text-gray-700 font-semibold">
                    {day.highTemp}°/{day.lowTemp}°
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rain Alert Button */}
        <button
          onClick={onTriggerAlert}
          disabled={loading}
          className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Triggering...
            </>
          ) : (
            <>
              <span>⚠️</span>
              Trigger Rain Alert
            </>
          )}
        </button>
      </div>
    </div>
  );
}

interface BroadcastConsoleProps {
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  error: string | null;
  targetLabel: string;
  targetOptions: any[];
  selectedCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  getTargetItemLabel: (item: any) => string;
  showTargetSelector: boolean;
}

function BroadcastConsole({
  form,
  setForm,
  onSubmit,
  loading,
  error,
  targetLabel,
  targetOptions,
  selectedCount,
  searchTerm,
  setSearchTerm,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  getTargetItemLabel,
  showTargetSelector,
}: BroadcastConsoleProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4">
        <h3 className="text-xl font-bold">Broadcast Console</h3>
        <p className="text-sm text-purple-100 mt-1">Dispatch notifications to students</p>
      </div>

      {/* Content */}
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Notification Type & Target Selection */}
        <div className="grid grid-cols-2 gap-4">
          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Type
            </label>
            <select
              value={form.notificationType}
              onChange={(e) => setForm({ ...form, notificationType: e.target.value })}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-50"
            >
              <option value="broadcast">General Broadcast</option>
              <option value="alert">Safety Alert</option>
              <option value="delay">Delay Notice</option>
              <option value="event">Event Notification</option>
            </select>
          </div>

          {/* Target Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Recipients
            </label>
            <select
              value={form.targetType}
              onChange={(e) =>
                setForm({
                  ...form,
                  targetType: e.target.value,
                  selectedIds: [],
                })
              }
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-50"
            >
              <option value="all_students">📢 All Registered Students</option>
              <option value="specific_route">🗺️ Specific Route Commuters</option>
              <option value="specific_bus">🚌 Specific Bus</option>
              <option value="specific_driver">👨‍✈️ Specific Driver</option>
            </select>
          </div>
        </div>

        {/* Target Selector */}
        {showTargetSelector && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">
                Select {targetLabel} ({selectedCount} selected)
              </h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={onClearSelection}
                  className="text-xs px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-3 relative">
              <input
                type="text"
                placeholder={`Search ${targetLabel.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {targetOptions.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.selectedIds.includes(item.id)}
                    onChange={() => onToggleSelection(item.id)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{getTargetItemLabel(item)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Title & Message */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Heavy Rain Alert"
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Enter your notification message here..."
              disabled={loading}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-50 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {form.message.length} characters
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 mb-2">Notification Summary</h5>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <strong>Type:</strong>{' '}
              {form.notificationType.charAt(0).toUpperCase() + form.notificationType.slice(1)}
            </p>
            <p>
              <strong>Recipients:</strong>{' '}
              {form.targetType === 'all_students'
                ? 'All Registered Students'
                : `${selectedCount} selected ${targetLabel.toLowerCase()}`}
            </p>
            <p>
              <strong>Title:</strong> {form.title || '(Not filled)'}
            </p>
            {form.message && (
              <p>
                <strong>Preview:</strong> {form.message.substring(0, 100)}
                {form.message.length > 100 ? '...' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Sending...
            </>
          ) : (
            <>
              <span>📤</span>
              Send Notification
            </>
          )}
        </button>
      </form>
    </div>
  );
}

interface NotificationHistoryProps {
  notifications: Notification[];
}

function NotificationHistory({ notifications }: NotificationHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'broadcast':
        return '📢';
      case 'alert':
        return '⚠️';
      case 'delay':
        return '⏱️';
      case 'event':
        return '🎪';
      default:
        return '📧';
    }
  };

  const getRecipientIcon = (recipients: string) => {
    switch (recipients) {
      case 'all_students':
        return '👥';
      case 'specific_route':
        return '🗺️';
      case 'specific_bus':
        return '🚌';
      case 'specific_driver':
        return '👨‍✈️';
      default:
        return '📧';
    }
  };

  const getRecipientLabel = (recipients: string) => {
    switch (recipients) {
      case 'all_students':
        return 'All Students';
      case 'specific_route':
        return 'Specific Routes';
      case 'specific_bus':
        return 'Specific Buses';
      case 'specific_driver':
        return 'Specific Drivers';
      default:
        return recipients;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-bold text-gray-900">Notification History</h3>
        <p className="text-sm text-gray-600 mt-1">Recent broadcasts and alerts sent to students</p>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-200">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">📭 No notifications sent yet</p>
            <p className="text-sm">Use the broadcast console above to send your first notification</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === notification.id ? null : notification.id)
                }
                className="w-full text-left px-6 py-4 flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {getTypeIcon(notification.type)}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message.substring(0, 100)}
                        {notification.message.length > 100 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 ml-11">
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                      {getRecipientIcon(notification.recipients)}
                      {getRecipientLabel(notification.recipients)}
                    </span>
                    <span className="text-xs text-gray-500">
                      📅 {new Date(notification.sentAt || notification.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      ⏰ {new Date(notification.sentAt || notification.createdAt).toLocaleTimeString()}
                    </span>
                    {notification.readCount !== undefined && (
                      <span className="text-xs text-gray-600 font-medium">
                        👁️ {notification.readCount} / {notification.totalRecipients} read
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`text-2xl transition-transform ${
                    expandedId === notification.id ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </button>

              {expandedId === notification.id && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Full Message</h5>
                      <p className="text-gray-700 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 font-semibold">
                          Type
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {notification.type.charAt(0).toUpperCase() +
                            notification.type.slice(1)}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 font-semibold">
                          Recipients
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {getRecipientLabel(notification.recipients)}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 font-semibold">
                          Sent
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {new Date(
                            notification.sentAt || notification.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      {notification.readCount !== undefined && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-600 font-semibold">
                            Read Rate
                          </p>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {notification.totalRecipients
                              ? Math.round(
                                  (notification.readCount /
                                    notification.totalRecipients) *
                                    100
                                )
                              : 0}
                            %
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Mock Data
const MOCK_WEATHER: Weather = {
  condition: 'Partly Cloudy',
  temperature: 28,
  humidity: 65,
  windSpeed: 12,
  precipitationProbability: 35,
  visibility: 8,
  icon: '⛅',
  forecast: [
    {
      date: '2024-07-30',
      condition: 'Rainy',
      highTemp: 32,
      lowTemp: 24,
      precipitationProbability: 75,
    },
    {
      date: '2024-07-31',
      condition: 'Cloudy',
      highTemp: 30,
      lowTemp: 23,
      precipitationProbability: 45,
    },
    {
      date: '2024-08-01',
      condition: 'Sunny',
      highTemp: 34,
      lowTemp: 25,
      precipitationProbability: 10,
    },
  ],
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'NOTIF-001',
    type: 'alert',
    title: 'Heavy Traffic Alert',
    message:
      'Heavy traffic detected on Route A. Estimated delay of 15-20 minutes. Please plan accordingly.',
    recipients: 'specific_route',
    recipientIds: ['ROUTE-001'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    readCount: 234,
    totalRecipients: 450,
  },
  {
    id: 'NOTIF-002',
    type: 'delay',
    title: 'Slight Delay Notice',
    message: 'Bus BF-002 is running 5 minutes late due to traffic congestion.',
    recipients: 'specific_bus',
    recipientIds: ['BUS-002'],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    readCount: 89,
    totalRecipients: 120,
  },
  {
    id: 'NOTIF-003',
    type: 'broadcast',
    title: 'Campus Fest Announcement',
    message:
      'Campus Fest 2024 will be held on August 15. Extended bus routes will be available. Check the portal for details.',
    recipients: 'all_students',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    readCount: 1245,
    totalRecipients: 1856,
  },
];

const MOCK_ROUTES: Route[] = [
  {
    id: 'ROUTE-001',
    name: 'North Campus Express',
    routeCode: 'NCE-01',
    status: 'active',
    startPoint: {
      id: 'STOP-001',
      name: 'Main Gate',
      latitude: 28.5355,
      longitude: 77.1928,
      sequenceNumber: 1,
    },
    endPoint: {
      id: 'STOP-005',
      name: 'North Block',
      latitude: 28.5405,
      longitude: 77.2028,
      sequenceNumber: 5,
    },
    stops: [],
  },
  {
    id: 'ROUTE-002',
    name: 'East Wing Shuttle',
    routeCode: 'EWS-02',
    status: 'active',
    startPoint: {
      id: 'STOP-002',
      name: 'South Gate',
      latitude: 28.5305,
      longitude: 77.1828,
      sequenceNumber: 1,
    },
    endPoint: {
      id: 'STOP-006',
      name: 'East Block',
      latitude: 28.5455,
      longitude: 77.2128,
      sequenceNumber: 5,
    },
    stops: [],
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
    capacity: 45,
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
];
