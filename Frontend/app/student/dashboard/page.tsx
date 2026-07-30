'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bus,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CloudRain,
  PhoneCall,
  UserCheck,
  QrCode,
  Gauge,
  CheckCircle2,
  Circle,
  Radio,
  Share2,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { studentApi } from '@/services/api/student';
import { Student } from '@/types/student';

export default function StudentDashboardPage() {
  const [profile, setProfile] = useState<Student | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isMissBusModalOpen, setIsMissBusModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [missBusSubmitted, setMissBusSubmitted] = useState(false);
  const [emergencyAlertSent, setEmergencyAlertSent] = useState(false);

  useEffect(() => {
    studentApi.getProfile().then(setProfile);
  }, []);

  const handleMissBusSubmit = () => {
    setMissBusSubmitted(true);
    setTimeout(() => {
      setIsMissBusModalOpen(false);
      setMissBusSubmitted(false);
    }, 2000);
  };

  const handleEmergencyAlert = () => {
    setEmergencyAlertSent(true);
    setTimeout(() => {
      setIsEmergencyModalOpen(false);
      setEmergencyAlertSent(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <Header title="Student Transit Portal" />

      {/* Weather & Route Disruption Alert Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
            <CloudRain className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">Weather & Route Alert</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-slate-200 mt-0.5">
              Light rain reported in North Campus zone. Shuttles running on schedule with minor 2-min traffic buffer.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-amber-300/80 shrink-0 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
          <span>Route-A1 Active</span>
        </div>
      </div>

      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Transit Column (Left 2 Spans) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Shuttle & ETA Highlights Card */}
            <Card className="space-y-6 glass-card border-blue-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <Bus className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">ASSIGNED SHUTTLE</Badge>
                      <span className="text-xs font-mono text-slate-400">BUS-01</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-100 mt-1">{profile.assignedRouteName}</h2>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Next Arrival ETA</span>
                    <span className="text-2xl font-black text-emerald-400">~6 mins</span>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                </div>
              </div>

              {/* Vehicle & Telemetry Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Vehicle Driver</span>
                  <span className="text-sm font-bold text-slate-100 mt-0.5 block truncate">Rajesh Sharma</span>
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                    <UserCheck className="w-3 h-3" /> Verified Driver
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Live Telemetry Speed</span>
                  <span className="text-sm font-bold text-slate-100 mt-0.5 block flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-blue-400" /> 34 km/h
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Distance: 1.2 km away</span>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Trip Window</span>
                  <span className="text-sm font-bold text-slate-100 mt-0.5 block flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" /> 08:30 AM - 09:15 AM
                  </span>
                  <span className="text-[11px] text-emerald-400 mt-0.5 block">On Schedule</span>
                </div>
              </div>

              {/* Primary Pickup Stop & Map Navigation Bar */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <MapPin className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Primary Boarding Stop</p>
                    <p className="text-lg font-bold text-slate-100">{profile.preferredStopName}</p>
                    <p className="text-xs text-slate-400">Stop #4 • Stand by the East Library Gate</p>
                  </div>
                </div>

                <Link href="/student/tracking">
                  <Button size="md" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Track Live GPS Map
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Trip Timeline Stepper Widget */}
            <Card className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Live Trip Progress Timeline</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time status updates from driver telemetry</p>
                </div>
                <Badge variant="info" className="font-mono text-[11px]">
                  <Radio className="w-3 h-3 text-blue-400 animate-pulse mr-1 inline" /> Socket Connected
                </Badge>
              </div>

              <div className="relative pt-2 pb-2">
                <div className="grid grid-cols-5 gap-2 text-center relative z-10">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">Assigned</span>
                    <span className="text-[10px] text-slate-500">08:00 AM</span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">En Route</span>
                    <span className="text-[10px] text-slate-500">08:24 AM</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 border-2 border-blue-500 flex items-center justify-center font-bold text-xs animate-pulse">
                      <Radio className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-blue-400">Approaching</span>
                    <span className="text-[10px] font-bold text-emerald-400">ETA ~6m</span>
                  </div>

                  {/* Step 4 */}
                  <div className="flex flex-col items-center space-y-2 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-slate-500 border border-slate-800 flex items-center justify-center font-bold text-xs">
                      <Circle className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">Boarded</span>
                    <span className="text-[10px] text-slate-600">Pending</span>
                  </div>

                  {/* Step 5 */}
                  <div className="flex flex-col items-center space-y-2 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-slate-500 border border-slate-800 flex items-center justify-center font-bold text-xs">
                      <Circle className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">Arrived</span>
                    <span className="text-[10px] text-slate-600">Pending</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Right Column (Pass & Quick Actions) */}
          <div className="space-y-6">
            {/* Digital Bus Pass Badge Card */}
            <Card className="space-y-5 text-center border-emerald-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                <Badge variant="success">PASS ACTIVE</Badge>
              </div>

              <div className="pt-2">
                <div className="p-3.5 w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mt-3">{profile.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{profile.rollNumber}</p>
                <p className="text-xs text-slate-400 mt-1">{profile.department}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Route Pass:</span>
                  <span className="font-semibold text-slate-200">{profile.assignedRouteName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Valid Through:</span>
                  <span className="font-semibold text-emerald-400">{profile.passExpiryDate}</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                leftIcon={<QrCode className="w-4 h-4" />}
                onClick={() => setIsQrModalOpen(true)}
              >
                View Digital QR Pass
              </Button>
            </Card>

            {/* Quick Student Actions Card */}
            <Card className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Quick Actions</h4>
              
              <div className="space-y-2.5">
                <button
                  onClick={() => setIsMissBusModalOpen(true)}
                  className="w-full p-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Request Miss Bus Reallocation</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setIsEmergencyModalOpen(true)}
                  className="w-full p-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                    <span>Campus Transit Security Emergency</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* QR Code Pass Modal */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="Campus Digital Bus Pass">
        <div className="text-center space-y-4 py-2">
          <div className="p-6 bg-white rounded-2xl w-48 h-48 mx-auto flex items-center justify-center border-4 border-emerald-500/30 shadow-2xl">
            <QrCode className="w-36 h-36 text-slate-900" />
          </div>
          <div>
            <h4 className="font-bold text-slate-100">{profile?.name}</h4>
            <p className="text-xs text-slate-400 font-mono">{profile?.rollNumber}</p>
            <p className="text-xs text-emerald-400 font-semibold mt-1">Verified Annual Transit Pass</p>
          </div>
          <p className="text-xs text-slate-400">Scan this QR code when boarding Bus #01</p>
        </div>
      </Modal>

      {/* Miss Bus Modal */}
      <Modal isOpen={isMissBusModalOpen} onClose={() => setIsMissBusModalOpen(false)} title="Miss Bus Reallocation Request">
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Running late? Notify the BusFlow Rule Engine so you can be automatically reassigned to the next scheduled shuttle arriving at your stop.
          </p>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
            <p className="text-slate-400">Assigned Route: <span className="text-slate-200 font-semibold">{profile?.assignedRouteName}</span></p>
            <p className="text-slate-400">Next Available Window: <span className="text-emerald-400 font-semibold">09:15 AM Shuttle</span></p>
          </div>

          {missBusSubmitted ? (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold">
              ✓ Reallocation Request Logged! Check back for updated shuttle details.
            </div>
          ) : (
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsMissBusModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleMissBusSubmit}>
                Confirm Reallocation
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Emergency Modal */}
      <Modal isOpen={isEmergencyModalOpen} onClose={() => setIsEmergencyModalOpen(false)} title="Campus Emergency Security Trigger">
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-300 leading-relaxed">
              This will immediately dispatch your GPS coordinates to Campus Security and notify the Bus Control Dispatcher.
            </p>
          </div>

          {emergencyAlertSent ? (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs text-center font-bold">
              🚨 Emergency Alert Transmitted to Campus Dispatcher!
            </div>
          ) : (
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsEmergencyModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleEmergencyAlert}>
                Dispatch Security Alert
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
