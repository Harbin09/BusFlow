'use client';

import React from 'react';
import { BusLocationUpdate } from '@/types/tracking';
import { Bus, Navigation, MapPin, Gauge } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface InteractiveMapProps {
  locations?: BusLocationUpdate[];
  selectedBusId?: string | null;
  onSelectBus?: (busId: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  locations = [],
  selectedBusId,
  onSelectBus,
}) => {
  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden glass-card border border-slate-800 bg-slate-950 flex flex-col justify-between p-6">
      {/* Dynamic Simulated Map Canvas Background */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Map Header Overlay */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-slate-100">Live Campus Fleet Visualizer</h4>
            <p className="text-xs text-slate-400">Real-time GPS Telemetry Streaming (WebSockets Active)</p>
          </div>
        </div>
        <Badge variant="success" className="px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5 pulse-emerald" />
          Live Stream
        </Badge>
      </div>

      {/* Simulated Visual Pins Grid */}
      <div className="relative z-10 flex-1 my-6 flex items-center justify-center">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-2xl">
          {locations.map((loc) => {
            const isSelected = loc.busId === selectedBusId;
            return (
              <div
                key={loc.busId}
                onClick={() => onSelectBus?.(loc.busId)}
                className={`cursor-pointer p-4 rounded-xl transition-all duration-300 backdrop-blur-xl border ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 shadow-xl shadow-blue-500/10 scale-105'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <Bus className="w-4 h-4 text-blue-400" />
                    {loc.busNumber}
                  </span>
                  <Badge variant="info">{loc.etaNextStopMinutes ? `${loc.etaNextStopMinutes}m ETA` : 'On Route'}</Badge>
                </div>
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-slate-500" />
                    <span>Speed: {Math.round(loc.speedKmh)} km/h</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lat: {loc.coordinates.latitude.toFixed(4)}, Lng: {loc.coordinates.longitude.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Controls & Status Footer */}
      <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800/80">
        <span>Campus Grid Boundary: 28.6139° N, 77.2090° E</span>
        <span>Active Telemetry Signals: {locations.length} Units</span>
      </div>
    </div>
  );
};
