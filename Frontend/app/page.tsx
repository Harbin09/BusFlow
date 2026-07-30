'use client';

import React from 'react';
import Link from 'next/link';
import { Bus, Shield, Navigation, Users, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Badge variant="info" className="mb-6 px-4 py-1.5 text-xs tracking-wide">
            <Zap className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            Next-Gen Campus Telemetry v2.4
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-100 tracking-tight max-w-4xl mx-auto leading-tight">
            Real-Time Campus Transit, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Engineered For Speed & Accuracy.
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto font-normal">
            Eliminate bus stop wait times. Track campus shuttles in real-time, view live ETAs, manage driver dispatch, and oversee student transit operations seamlessy.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" leftIcon={<Bus className="w-5 h-5" />}>
                Launch Transit Portal
              </Button>
            </Link>
            <Link href="/student/tracking">
              <Button variant="outline" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Track Live Bus
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:border-blue-500/40 transition">
            <div className="p-3 w-12 h-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-4">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Live GPS Telemetry</h3>
            <p className="text-sm text-slate-400">
              Sub-second latency location updates via WebSocket clusters. Micro-accurate ETA predictions for every campus stop.
            </p>
          </Card>

          <Card className="hover:border-indigo-500/40 transition">
            <div className="p-3 w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Admin Command Center</h3>
            <p className="text-sm text-slate-400">
              Complete operational control. Manage fleet buses, driver assignments, route polyline coordinates, and speed alarms.
            </p>
          </Card>

          <Card className="hover:border-purple-500/40 transition">
            <div className="p-3 w-12 h-12 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Driver & Student Portals</h3>
            <p className="text-sm text-slate-400">
              Tailored mobile-optimized interfaces for shuttle drivers to log trips and students to view arrival schedules.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-8 bg-slate-950 text-center text-xs text-slate-500">
        <p>© 2026 BusFlow Transit Architecture. Built for Smart Campuses.</p>
      </footer>
    </div>
  );
}
