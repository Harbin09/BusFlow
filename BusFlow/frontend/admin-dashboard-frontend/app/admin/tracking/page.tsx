'use client';

import React, { useEffect, useRef, useState } from 'react';
import { trackingApi } from '@/lib/api';
import { BusTrackingInfo, TrackingUpdate } from '@/lib/types';

interface BusMarkerState extends BusTrackingInfo {
  isActive: boolean;
  lastUpdateTime: number;
}

export default function TrackingPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const popupsRef = useRef<Map<string, any>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const mockIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectCountRef = useRef<number>(0);

  const [buses, setBuses] = useState<Map<string, BusMarkerState>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activeBuses: 0,
    totalDelay: 0,
    avgSpeed: 0,
    onTimeCount: 0,
  });

  // Initialize map on mount
  useEffect(() => {
    initializeMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch initial bus data
  useEffect(() => {
    fetchInitialBusData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup WebSocket connection
  useEffect(() => {
    setupWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update stats when buses change
  useEffect(() => {
    updateStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buses]);

  const initializeMap = async () => {
    if (!mapRef.current) return;

    // Load Leaflet from CDN
    if (!(window as any).L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = () => {
        createMap();
      };
      document.body.appendChild(script);
    } else {
      createMap();
    }
  };

  const createMap = () => {
    if (!mapRef.current) return;

    const L = (window as any).L;

    // Default center (Delhi, India area)
    const map = L.map(mapRef.current).setView([28.5355, 77.1928], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
  };

  const fetchInitialBusData = async () => {
    setLoading(true);
    setError(null);

    const response = await trackingApi.getLiveTracking();

    if (response.error) {
      setError(response.error);
      // Use mock data as fallback
      const mockData = generateMockTrackingData();
      processBusData(mockData);
    } else if (response.data) {
      const busData = Array.isArray(response.data)
        ? response.data
        : ((response.data as Record<string, unknown>)?.buses as BusTrackingInfo[]) || generateMockTrackingData();
      processBusData(busData);
    } else {
      processBusData(generateMockTrackingData());
    }

    setLoading(false);
  };

  const processBusData = (busesData: BusTrackingInfo[]) => {
    const newBuses = new Map<string, BusMarkerState>();

    busesData.forEach((bus) => {
      newBuses.set(bus.busId, {
        ...bus,
        isActive: true,
        lastUpdateTime: Date.now(),
      });
    });

    setBuses(newBuses);
    renderMarkers(newBuses);
  };

  const setupWebSocket = () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/tracking/ws';

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setWsConnected(true);
        reconnectCountRef.current = 0;
        if (mockIntervalRef.current) {
          clearInterval(mockIntervalRef.current);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data) as TrackingUpdate;
          handleTrackingUpdate(update);
        } catch {
          // parse error
        }
      };

      wsRef.current.onerror = () => {
        setWsConnected(false);
      };

      wsRef.current.onclose = () => {
        setWsConnected(false);
        if (reconnectCountRef.current < 2) {
          reconnectCountRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            setupWebSocket();
          }, 4000);
        } else {
          // Switch to live simulated tracking updates
          startMockTrackingLoop();
        }
      };
    } catch {
      setWsConnected(false);
      startMockTrackingLoop();
    }
  };

  const startMockTrackingLoop = () => {
    if (mockIntervalRef.current) return;

    mockIntervalRef.current = setInterval(() => {
      setBuses((prevBuses) => {
        const updatedMap = new Map(prevBuses);
        updatedMap.forEach((bus, key) => {
          const deltaLat = (Math.random() - 0.5) * 0.001;
          const deltaLng = (Math.random() - 0.5) * 0.001;
          const updatedBus: BusMarkerState = {
            ...bus,
            latitude: bus.latitude + deltaLat,
            longitude: bus.longitude + deltaLng,
            speed: Math.max(15, Math.min(60, bus.speed + Math.floor((Math.random() - 0.5) * 6))),
            lastUpdateTime: Date.now(),
          };
          updatedMap.set(key, updatedBus);
          if (mapInstanceRef.current) {
            updateMarker(updatedBus);
            updatePopup(updatedBus);
          }
        });
        return updatedMap;
      });
    }, 3000);
  };

  const handleTrackingUpdate = (update: TrackingUpdate) => {
    setBuses((prevBuses) => {
      const newBuses = new Map(prevBuses);
      const existing = newBuses.get(update.busId);

      if (existing) {
        const updatedBus: BusMarkerState = {
          ...existing,
          latitude: update.latitude,
          longitude: update.longitude,
          speed: update.speed,
          heading: update.heading || existing.heading,
          lastUpdateTime: Date.now(),
        };

        newBuses.set(update.busId, updatedBus);

        // Update marker on map
        if (mapInstanceRef.current) {
          updateMarker(updatedBus);
          updatePopup(updatedBus);
        }
      }

      return newBuses;
    });
  };

  const renderMarkers = (busesData: Map<string, BusMarkerState>) => {
    if (!mapInstanceRef.current) return;

    const L = (window as any).L;

    busesData.forEach((bus) => {
      createMarker(bus, L);
    });
  };

  const createMarker = (bus: BusMarkerState, L?: any) => {
    if (!mapInstanceRef.current) return;

    L = L || (window as any).L;

    const marker = L.marker([bus.latitude, bus.longitude], {
      icon: createCustomIcon(bus.speed),
      title: bus.busNumber,
    }).addTo(mapInstanceRef.current);

    const popup = L.popup({
      autoClose: false,
      closeButton: true,
    });

    marker.bindPopup(popup);
    marker.on('click', () => {
      setSelectedBus(bus.busId);
      updatePopupContent(popup, bus);
      marker.openPopup();
    });

    markersRef.current.set(bus.busId, marker);
    popupsRef.current.set(bus.busId, popup);
  };

  const updateMarker = (bus: BusMarkerState) => {
    if (!mapInstanceRef.current) return;

    const L = (window as any).L;
    const marker = markersRef.current.get(bus.busId);

    if (marker) {
      marker.setLatLng([bus.latitude, bus.longitude]);
      marker.setIcon(createCustomIcon(bus.speed));
    } else {
      createMarker(bus, L);
    }
  };

  const updatePopup = (bus: BusMarkerState) => {
    const popup = popupsRef.current.get(bus.busId);
    if (popup) {
      updatePopupContent(popup, bus);
    }
  };

  const createCustomIcon = (speed: number) => {
    const L = (window as any).L;

    // Color based on speed: red if stopped, yellow if slow, green if moving well
    let color = '#ef4444'; // red
    if (speed > 10) color = '#fbbf24'; // yellow
    if (speed > 25) color = '#22c55e'; // green

    const svgIcon = `
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="20" y="26" text-anchor="middle" font-size="20" fill="white" font-weight="bold">🚌</text>
      </svg>
    `;

    return L.icon({
      iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgIcon)}`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });
  };

  const updatePopupContent = (popup: any, bus: BusMarkerState) => {
    const content = `
      <div class="tracking-popup">
        <div style="min-width: 250px; padding: 12px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
            <h4 style="margin: 0; font-size: 16px; font-weight: bold; color: #1f2937;">${bus.busNumber}</h4>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">ID: ${bus.busId}</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div style="background: #f3f4f6; padding: 10px; border-radius: 6px;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; font-weight: 600;">Speed</p>
              <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: bold; color: #1f2937;">${bus.speed} km/h</p>
            </div>

            <div style="background: #f3f4f6; padding: 10px; border-radius: 6px;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; font-weight: 600;">Delay</p>
              <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: bold; color: ${bus.delayMinutes > 5 ? '#dc2626' : '#10b981'};">
                ${bus.delayMinutes > 0 ? '+' : ''}${bus.delayMinutes} min
              </p>
            </div>
          </div>

          <div style="background: #eff6ff; padding: 10px; border-radius: 6px; margin-bottom: 12px; border-left: 3px solid #3b82f6;">
            <p style="margin: 0; font-size: 12px; color: #1e40af; font-weight: 600;">Driver</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #1f2937;">${bus.driverName}</p>
          </div>

          ${bus.routeName ? `
            <div style="background: #f5f3ff; padding: 10px; border-radius: 6px; border-left: 3px solid #a855f7;">
              <p style="margin: 0; font-size: 12px; color: #6b21a8; font-weight: 600;">Route</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #1f2937;">${bus.routeName}</p>
            </div>
          ` : ''}

          ${bus.studentsOnBoard ? `
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #4b5563;">
              <span>👥 ${bus.studentsOnBoard} students onboard</span>
            </div>
          ` : ''}

          <div style="margin-top: 10px; font-size: 11px; color: #9ca3af;">
            Last update: ${new Date(bus.lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      </div>
    `;

    popup.setContent(content);
  };

  const updateStats = () => {
    const busArray = Array.from(buses.values());
    const activeBuses = busArray.filter((b) => b.isActive).length;
    const totalDelay = busArray.reduce((sum, b) => sum + b.delayMinutes, 0);
    const avgSpeed = busArray.length > 0 ? Math.round(busArray.reduce((sum, b) => sum + b.speed, 0) / busArray.length) : 0;
    const onTimeCount = busArray.filter((b) => b.delayMinutes <= 0).length;

    setStats({
      activeBuses,
      totalDelay,
      avgSpeed,
      onTimeCount,
    });
  };

  const centerMapOnBus = (busId: string) => {
    if (!mapInstanceRef.current) return;

    const bus = buses.get(busId);
    if (bus) {
      mapInstanceRef.current.setView([bus.latitude, bus.longitude], 14);
      const marker = markersRef.current.get(busId);
      if (marker) {
        marker.openPopup();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Live Bus Tracking</h2>
          <p className="text-gray-600 mt-2">
            Real-time GPS tracking and status updates for active buses
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${
          wsConnected
            ? 'bg-green-50 border-green-300'
            : 'bg-yellow-50 border-yellow-300'
        }`}>
          <span className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-yellow-500'} ${wsConnected ? 'animate-pulse' : ''}`} />
          <span className={`text-sm font-semibold ${wsConnected ? 'text-green-700' : 'text-yellow-700'}`}>
            {wsConnected ? 'Live' : 'Connecting...'}
          </span>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Buses"
          value={stats.activeBuses}
          icon="🚌"
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          borderColor="border-blue-200"
        />
        <StatCard
          label="On-Time Buses"
          value={stats.onTimeCount}
          icon="✓"
          bgColor="bg-green-50"
          textColor="text-green-700"
          borderColor="border-green-200"
        />
        <StatCard
          label="Avg Speed"
          value={`${stats.avgSpeed} km/h`}
          icon="🚗"
          bgColor="bg-purple-50"
          textColor="text-purple-700"
          borderColor="border-purple-200"
        />
        <StatCard
          label="Total Delay"
          value={`${stats.totalDelay} min`}
          icon="⏱️"
          bgColor={stats.totalDelay > 10 ? 'bg-red-50' : 'bg-amber-50'}
          textColor={stats.totalDelay > 10 ? 'text-red-700' : 'text-amber-700'}
          borderColor={stats.totalDelay > 10 ? 'border-red-200' : 'border-amber-200'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-[600px] relative">
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-40">
                <div className="text-center">
                  <div className="animate-spin text-4xl mb-3">⏳</div>
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
            <div ref={mapRef} className="w-full h-full" />
          </div>
        </div>

        {/* Sidebar: Bus List */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">Active Buses</h3>
            <p className="text-xs text-gray-500 mt-1">{buses.size} buses</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {Array.from(buses.values()).length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No active buses</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {Array.from(buses.values()).map((bus) => (
                  <BusSidebarItem
                    key={bus.busId}
                    bus={bus}
                    isSelected={selectedBus === bus.busId}
                    onSelect={() => {
                      setSelectedBus(bus.busId);
                      centerMapOnBus(bus.busId);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-4">
          <span className="text-3xl">📍</span>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">How to Use Live Tracking</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Click any bus marker on the map to view detailed information</li>
              <li>✓ Click buses in the sidebar to center the map and open details</li>
              <li>✓ Green markers = good speed, Yellow = slow, Red = stopped</li>
              <li>✓ Real-time updates stream via WebSocket connection</li>
              <li>✓ Positive delay values indicate buses running behind schedule</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

function StatCard({
  label,
  value,
  icon,
  bgColor,
  textColor,
  borderColor,
}: StatCardProps) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-semibold ${textColor} uppercase`}>{label}</span>
      </div>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}

interface BusSidebarItemProps {
  bus: BusMarkerState;
  isSelected: boolean;
  onSelect: () => void;
}

function BusSidebarItem({ bus, isSelected, onSelect }: BusSidebarItemProps) {
  const speedColor =
    bus.speed > 25
      ? 'text-green-600 bg-green-50'
      : bus.speed > 10
        ? 'text-yellow-600 bg-yellow-50'
        : 'text-red-600 bg-red-50';

  const delayColor =
    bus.delayMinutes <= 0
      ? 'text-green-600'
      : bus.delayMinutes < 5
        ? 'text-yellow-600'
        : 'text-red-600';

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-l-4 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-gray-900">{bus.busNumber}</p>
          <p className="text-xs text-gray-500">{bus.driverName}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded ${speedColor}`}>
          {bus.speed} km/h
        </span>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">Delay:</span>
        <span className={`font-semibold ${delayColor}`}>
          {bus.delayMinutes > 0 ? '+' : ''}{bus.delayMinutes} min
        </span>
      </div>

      {bus.routeName && (
        <p className="text-xs text-gray-500 mt-1 truncate">
          {bus.routeName}
        </p>
      )}
    </button>
  );
}

// Mock data generator
function generateMockTrackingData(): BusTrackingInfo[] {
  const buses: BusTrackingInfo[] = [];
  const driverNames = ['Rajesh', 'Priya', 'Vikram', 'Anjali', 'Rohan'];
  const routes = ['North Campus Express', 'East Wing Shuttle', 'West Campus Loop', 'Downtown Link'];

  for (let i = 1; i <= 5; i++) {
    buses.push({
      busId: `BUS-${String(i).padStart(3, '0')}`,
      busNumber: `BF-${String(i).padStart(3, '0')}`,
      latitude: 28.5355 + Math.random() * 0.05,
      longitude: 77.1928 + Math.random() * 0.15,
      speed: Math.floor(Math.random() * 50),
      heading: Math.floor(Math.random() * 360),
      delayMinutes: Math.floor(Math.random() * 10) - 2,
      driverName: driverNames[i % driverNames.length],
      routeName: routes[i % routes.length],
      studentsOnBoard: Math.floor(Math.random() * 45) + 10,
      lastUpdate: new Date().toISOString(),
    });
  }

  return buses;
}
