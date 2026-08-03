import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';

// --- DATA TYPES ---
type ActiveTab = "Today's Trip" | 'Navigation' | 'Passengers' | 'Alerts' | 'Profile';
type AlertFilter = 'ALL' | 'EMERGENCY' | 'TRAFFIC' | 'SYSTEM' | 'GENERAL';
type TripStatus = 'READY' | 'IN_TRANSIT' | 'COMPLETED';
type ShiftType = 'MORNING' | 'EVENING';

interface StudentPassenger {
  id: string;
  name: string;
  initials: string;
  studentId: string;
  pickupStop: string;
  yearMajor: string;
  status: 'Boarded' | 'Waiting' | 'No Show';
  avatarUrl?: string;
  avatarColor: string;
}

interface RouteStop {
  id: number;
  name: string;
  scheduledTime: string;
  status: 'COMPLETED' | 'CURRENT' | 'UPCOMING';
  turnInstruction?: string;
  distance?: string;
}

interface AlertCardItem {
  id: string;
  category: 'EMERGENCY' | 'TRAFFIC' | 'SYSTEM' | 'GENERAL';
  title: string;
  timestamp: string;
  priorityLabel: string;
  message: string;
  image?: string;
  acknowledged?: boolean;
}

// --- RAJPURA LEAFLET DYNAMIC MAP COMPONENT ---
const RAJPURA_ROUTE_COORDS: { name: string; coords: [number, number]; time: string }[] = [
  { name: 'Rajpura Bus Stand', coords: [30.4842, 76.5931], time: '8:05 AM' },
  { name: 'Patiala Bypass (Rajpura)', coords: [30.4780, 76.5820], time: '8:15 AM' },
  { name: 'Banur Highway Toll', coords: [30.5280, 76.7150], time: '8:30 AM' },
  { name: 'University Main Terminal', coords: [30.5165, 76.6598], time: '8:45 AM' },
];

const BUS_LIVE_COORDS: [number, number] = [30.4810, 76.5880];

interface RajpuraLeafletMapProps {
  currentStopIndex?: number;
  height?: string;
  className?: string;
  speed?: number;
  etaMinutes?: number;
}

const RajpuraLeafletMap: React.FC<RajpuraLeafletMapProps> = ({ currentStopIndex = 1, height = "100%", className = "", speed = 42, etaMinutes = 4 }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Initialize Leaflet Map centered on Rajpura, Punjab
    const map = L.map(mapContainerRef.current, {
      center: [30.4950, 76.6200],
      zoom: 12,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap tile layer (silver/clean navigation tile theme)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    // Zoom controls
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Polyline Bus Route through Rajpura
    const routePoints = RAJPURA_ROUTE_COORDS.map(s => s.coords);
    L.polyline(routePoints, {
      color: '#004ac6',
      weight: 7,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Inner dashed route line
    L.polyline(routePoints, {
      color: '#ffffff',
      weight: 2,
      dashArray: '8, 8',
      opacity: 0.95,
    }).addTo(map);

    // Add Stop Pins along Rajpura Corridor
    RAJPURA_ROUTE_COORDS.forEach((stop, idx) => {
      const isCurrent = idx === currentStopIndex;
      const markerHtml = `
        <div style="
          background: ${isCurrent ? '#004ac6' : '#ffffff'};
          color: ${isCurrent ? '#ffffff' : '#1e293b'};
          border: 3px solid ${isCurrent ? '#ffffff' : '#004ac6'};
          border-radius: 20px;
          padding: 5px 12px;
          font-weight: 800;
          font-size: 11px;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          cursor: pointer;
        ">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: ${isCurrent ? '#10b981' : '#64748b'};"></span>
          <span>${stop.name}</span>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: 'custom-stop-pill-marker',
        iconSize: [140, 32],
        iconAnchor: [70, 16],
      });

      L.marker(stop.coords, { icon })
        .addTo(map)
        .bindPopup(`<div style="font-family: Inter, sans-serif; padding: 4px;"><b>📍 ${stop.name}</b><br/><span style="font-size: 11px; color: #64748b;">Scheduled Arrival: ${stop.time}</span></div>`);
    });

    // Add Active Live Bus Marker in Rajpura
    const busMarkerHtml = `
      <div style="position: relative; width: 52px; height: 52px; display: flex; items-center; justify-content: center;">
        <div style="position: absolute; inset: 0; background: rgba(37,99,235,0.35); border-radius: 50%; animation: pulse-ring 2s infinite ease-in-out;"></div>
        <div style="width: 44px; height: 44px; background: #004ac6; border: 3px solid #ffffff; border-radius: 50%; display: flex; items-center; justify-content: center; color: white; box-shadow: 0 8px 24px rgba(0,74,198,0.4); z-index: 2;">
          <span className="material-symbols-outlined" style="font-size: 24px; font-variation-settings: 'FILL' 1;">directions_bus</span>
        </div>
      </div>
    `;

    const busIcon = L.divIcon({
      html: busMarkerHtml,
      className: 'custom-live-bus-marker',
      iconSize: [52, 52],
      iconAnchor: [26, 26],
    });

    L.marker(BUS_LIVE_COORDS, { icon: busIcon })
      .addTo(map)
      .bindPopup(`<div style="font-family: Inter, sans-serif; padding: 4px;"><b>🚌 Bus #PB10AB1234 (Rajpura Express)</b><br/><span style="font-size: 11px; color: #004ac6; font-weight: bold;">Speed: ${speed} km/h • ETA: ${etaMinutes} mins</span></div>`);

    // Auto fit bounds around Rajpura route
    map.fitBounds(L.polyline(routePoints).getBounds(), { padding: [60, 60] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentStopIndex]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ width: '100%', height }} 
      className={`z-0 ${className}`} 
    />
  );
};

const INITIAL_PASSENGERS: StudentPassenger[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    initials: 'SJ',
    studentId: '#STU-99021',
    pickupStop: 'Rajpura Bus Stand',
    yearMajor: 'Year 2 • Biology',
    status: 'Boarded',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    avatarColor: 'bg-emerald-100 text-emerald-700'
  },
  {
    id: '2',
    name: 'David Chen',
    initials: 'DC',
    studentId: '#STU-88210',
    pickupStop: 'Patiala Bypass (Rajpura)',
    yearMajor: 'Year 4 • Engineering',
    status: 'Waiting',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    avatarColor: 'bg-blue-100 text-blue-700'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    initials: 'ER',
    studentId: '#STU-77342',
    pickupStop: 'Banur Highway Toll',
    yearMajor: 'Year 1 • Psychology',
    status: 'No Show',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    avatarColor: 'bg-rose-100 text-rose-700'
  },
  {
    id: '4',
    name: 'Manpreet Sharma',
    initials: 'MS',
    studentId: '#STU-66512',
    pickupStop: 'Rajpura Bus Stand',
    yearMajor: 'Year 3 • Design',
    status: 'Boarded',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    avatarColor: 'bg-emerald-100 text-emerald-700'
  },
  {
    id: '5',
    name: 'Aarav Kapoor',
    initials: 'AK',
    studentId: '#STU-10245',
    pickupStop: 'Rajpura Bus Stand',
    yearMajor: 'Year 2 • Computer Science',
    status: 'Boarded',
    avatarColor: 'bg-indigo-100 text-indigo-700'
  },
  {
    id: '6',
    name: 'Sanya Nair',
    initials: 'SN',
    studentId: '#STU-10552',
    pickupStop: 'Patiala Bypass (Rajpura)',
    yearMajor: 'Year 3 • Economics',
    status: 'Waiting',
    avatarColor: 'bg-amber-100 text-amber-700'
  },
  {
    id: '7',
    name: 'Rohan Mehta',
    initials: 'RM',
    studentId: '#STU-11029',
    pickupStop: 'Patiala Bypass (Rajpura)',
    yearMajor: 'Year 4 • Physics',
    status: 'No Show',
    avatarColor: 'bg-orange-100 text-orange-700'
  },
  {
    id: '8',
    name: 'Priya Sharma',
    initials: 'PS',
    studentId: '#STU-11401',
    pickupStop: 'Rajpura Bus Stand',
    yearMajor: 'Year 1 • Medicine',
    status: 'Boarded',
    avatarColor: 'bg-purple-100 text-purple-700'
  },
  {
    id: '9',
    name: 'Vikram Singh',
    initials: 'VS',
    studentId: '#STU-11884',
    pickupStop: 'Banur Highway Toll',
    yearMajor: 'Year 3 • Civil Eng',
    status: 'Waiting',
    avatarColor: 'bg-[#dbeafe] text-[#1e40af]'
  },
  {
    id: '10',
    name: 'Ananya Gupta',
    initials: 'AG',
    studentId: '#STU-12059',
    pickupStop: 'University Main Terminal',
    yearMajor: 'Year 2 • Business',
    status: 'Waiting',
    avatarColor: 'bg-teal-100 text-teal-700'
  }
];

const INITIAL_ALERTS: AlertCardItem[] = [
  {
    id: 'ALT-1',
    category: 'EMERGENCY',
    title: 'Emergency: Medical Assistance',
    timestamp: 'Stop 4 • 2 mins ago',
    priorityLabel: 'High Priority',
    message: 'A passenger at Stop 4 (East Gate) has requested immediate medical assistance. Fleet command has been notified. Please maintain your current position if safe, or proceed to the designated pickup point.'
  },
  {
    id: 'ALT-2',
    category: 'TRAFFIC',
    title: 'Traffic: 15 min delay',
    timestamp: 'Rajpura-Banur Highway • 15 mins ago',
    priorityLabel: 'Warning',
    message: 'Unscheduled road maintenance near Banur Highway Toll on Rajpura Route. Rerouting is recommended via the GT Road bypass.',
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'ALT-3',
    category: 'SYSTEM',
    title: 'Admin: Route Update',
    timestamp: 'Dispatch HQ • 1 hour ago',
    priorityLabel: 'Information',
    message: 'Afternoon shift routes have been recalibrated for energy efficiency. Please review the updated stop sequence before 14:00.'
  },
  {
    id: 'ALT-4',
    category: 'GENERAL',
    title: 'General: Lost Item Found',
    timestamp: 'Support Desk • 3 hours ago',
    priorityLabel: 'Notice',
    message: '"A blue backpack was reported lost on Bus 204. Please check the overhead compartments at the end of your shift."'
  }
];

const MORNING_ROUTE_STOPS: RouteStop[] = [
  { id: 1, name: 'Rajpura Bus Stand', scheduledTime: '8:05 AM', status: 'COMPLETED', turnInstruction: 'Turn Right onto GT Road', distance: '0.0 km' },
  { id: 2, name: 'Patiala Bypass (Rajpura)', scheduledTime: '8:15 AM', status: 'CURRENT', turnInstruction: 'Keep Straight past Eagle Motel Junction', distance: '1.2 km' },
  { id: 3, name: 'Banur Highway Toll', scheduledTime: '8:30 AM', status: 'UPCOMING', turnInstruction: 'Merge Left onto Campus Expressway', distance: '5.8 km' },
  { id: 4, name: 'University Main Terminal', scheduledTime: '8:45 AM', status: 'UPCOMING', turnInstruction: 'Arrive at University Gate 1', distance: '12.5 km' },
];

const EVENING_ROUTE_STOPS: RouteStop[] = [
  { id: 1, name: 'University Main Terminal', scheduledTime: '5:15 PM', status: 'CURRENT', turnInstruction: 'Head South on GT Highway Bypass', distance: '0.5 km' },
  { id: 2, name: 'Banur Highway Toll', scheduledTime: '5:35 PM', status: 'UPCOMING', turnInstruction: 'Merge Right towards Rajpura Flyover', distance: '6.2 km' },
  { id: 3, name: 'Patiala Bypass (Rajpura)', scheduledTime: '5:45 PM', status: 'UPCOMING', turnInstruction: 'Turn Left onto Town Center Road', distance: '11.0 km' },
  { id: 4, name: 'Rajpura Bus Stand', scheduledTime: '6:00 PM', status: 'UPCOMING', turnInstruction: 'Arrive at Rajpura Terminal Stop', distance: '12.8 km' },
];

export default function DriverDashboard() {
  const autoShift = new Date().getHours() >= 14 ? 'EVENING' : 'MORNING';

  // --- STATE ---
  const [activeTab, setActiveTab] = useState<ActiveTab>("Passengers");
  const [alertFilter, setAlertFilter] = useState<AlertFilter>('ALL');
  const [tripStatus, setTripStatus] = useState<TripStatus>('IN_TRANSIT');
  const [shiftType, setShiftType] = useState<ShiftType>(autoShift);
  const [speed, setSpeed] = useState<number>(42);
  const [etaMinutes, setEtaMinutes] = useState<number>(4);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [passengerFilter, setPassengerFilter] = useState<'ALL' | 'Boarded' | 'Waiting' | 'No Show'>('ALL');
  const [passengers, setPassengers] = useState<StudentPassenger[]>(INITIAL_PASSENGERS);
  const [alerts, setAlerts] = useState<AlertCardItem[]>(INITIAL_ALERTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [stops, setStops] = useState<RouteStop[]>(autoShift === 'MORNING' ? MORNING_ROUTE_STOPS : EVENING_ROUTE_STOPS);

  // Navigation & Traffic state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [trafficModalOpen, setTrafficModalOpen] = useState<boolean>(false);
  const [reportCategory, setReportCategory] = useState<string>('Heavy Traffic');
  const [reportNote, setReportNote] = useState<string>('');
  const [activeStopIndex, setActiveStopIndex] = useState<number>(1);
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(false);
  const [loginRole, setLoginRole] = useState<'Student' | 'Driver' | 'Admin'>('Driver');
  const [loginEmail, setLoginEmail] = useState('rajesh.kumar@busflow.edu');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);

  // QR Scanner Modal State
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [manualScanInput, setManualScanInput] = useState<string>('');
  const [activeMenuStudentId, setActiveMenuStudentId] = useState<string | null>(null);

  // Speed simulation effect
  useEffect(() => {
    if (tripStatus !== 'IN_TRANSIT') return;
    const interval = setInterval(() => {
      setSpeed(prev => Math.min(62, Math.max(28, prev + Math.floor(Math.random() * 5) - 2)));
    }, 1500);
    return () => clearInterval(interval);
  }, [tripStatus]);

  // Toast auto-clear
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearInterval(timer);
  }, [toastMessage]);

  // Toggle Start / End Trip
  const handleToggleTrip = () => {
    if (tripStatus === 'READY') {
      setTripStatus('IN_TRANSIT');
      setToastMessage('🚀 Trip Started! Leaflet Live GPS Navigation active.');
    } else if (tripStatus === 'IN_TRANSIT') {
      setTripStatus('COMPLETED');
      setToastMessage('🏁 Trip Completed! All Passengers Dropped.');
    } else {
      setTripStatus('READY');
      setToastMessage('🔄 Reset to Ready Status.');
    }
  };

  // Toggle Passenger Boarding Status
  const togglePassengerStatus = (id: string, explicitStatus?: StudentPassenger['status']) => {
    setPassengers(prev =>
      prev.map(p => {
        if (p.id === id) {
          const nextStatus = explicitStatus
            ? explicitStatus
            : p.status === 'Waiting'
            ? 'Boarded'
            : p.status === 'Boarded'
            ? 'No Show'
            : 'Waiting';
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
    setActiveMenuStudentId(null);
  };

  // Check In Passenger Quick Action
  const handleCheckInPassenger = (id: string, name: string) => {
    togglePassengerStatus(id, 'Boarded');
    setToastMessage(`✓ ${name} checked in & marked as Boarded!`);
  };

  // Bulk Boarding Action
  const handleBulkBoarding = () => {
    const waitingCountAtCurrent = passengers.filter(p => p.status === 'Waiting').length;
    setPassengers(prev =>
      prev.map(p => (p.status === 'Waiting' ? { ...p, status: 'Boarded' } : p))
    );
    setToastMessage(`✅ Bulk Boarding Complete! Marked ${waitingCountAtCurrent} waiting students as Boarded.`);
  };

  // QR Code / ID Scan Submit Action
  const handleQRScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualScanInput.trim()) return;

    const matched = passengers.find(
      p => p.studentId.toLowerCase() === manualScanInput.trim().toLowerCase() || p.id === manualScanInput.trim()
    );

    if (matched) {
      togglePassengerStatus(matched.id, 'Boarded');
      setToastMessage(`🎟️ QR Pass Verified! ${matched.name} checked in.`);
      setManualScanInput('');
      setQrModalOpen(false);
    } else {
      setToastMessage(`⚠️ No matching student found for ID "${manualScanInput}".`);
    }
  };

  // Acknowledge Alert Card
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    setToastMessage('✓ Alert Acknowledged & Logged to Fleet Server.');
  };

  // Report Traffic Submission
  const handleReportTrafficSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: AlertCardItem = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      category: 'TRAFFIC',
      title: `Driver Report: ${reportCategory}`,
      timestamp: 'Just now • Bus PB10AB1234',
      priorityLabel: 'Driver Incident',
      message: reportNote || `Driver reported ${reportCategory.toLowerCase()} along Rajpura route. Dispatch team notified.`,
      acknowledged: false
    };

    setAlerts(prev => [newAlert, ...prev]);
    setTrafficModalOpen(false);
    setReportNote('');
    setToastMessage(`⚠️ Traffic alert "${reportCategory}" broadcasted to Fleet Command!`);
  };

  // Recenter map handler
  const handleRecenterNav = () => {
    setToastMessage('🧭 Live Leaflet map re-centered on Rajpura GPS coordinates.');
  };

  // Mute toggle handler
  const handleToggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      setToastMessage(next ? '🔇 Voice navigation muted' : '🔊 Voice navigation enabled');
      return next;
    });
  };

  // Filter alerts by category
  const filteredAlerts = alerts.filter(a => {
    if (alertFilter === 'ALL') return true;
    return a.category === alertFilter;
  });

  // Filter passengers by search query & status filter
  const filteredPassengers = passengers.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pickupStop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.yearMajor && p.yearMajor.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = passengerFilter === 'ALL' || p.status === passengerFilter;
    return matchesSearch && matchesFilter;
  });

  // Passenger summary statistics
  const boardedCount = passengers.filter(p => p.status === 'Boarded').length;
  const waitingCount = passengers.filter(p => p.status === 'Waiting').length;
  const totalAssigned = 47;
  const boardingPercentage = Math.round((boardedCount / totalAssigned) * 100);

  const currentStopIndex = activeStopIndex < stops.length ? activeStopIndex : 1;
  const currentNavStop = stops[currentStopIndex] || stops[0];

  if (isLoggedOut) {
    return (
      <div className="bg-[#ffffff] text-[#191c1e] min-h-screen overflow-x-hidden font-sans">
        {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#0f172a] text-white font-semibold text-sm px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
            <span className="material-symbols-outlined text-amber-400">info</span>
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row min-h-screen">
          <main className="w-full lg:w-[45%] flex flex-col justify-center items-center p-8 md:p-12 xl:p-20 z-10 bg-white">
            <div className="w-full max-w-[420px]">
              <div className="flex flex-col items-start mb-8">
                <div className="w-14 h-14 bg-[#2563eb] rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-[#2563eb]/20 active:scale-95 transition-transform cursor-pointer">
                  <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    directions_bus
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold text-[#191c1e] tracking-tight">Sign in to BusFlow</h1>
                <p className="text-sm text-[#505f76] mt-2 font-normal">Manage your campus transit experience.</p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsLoggedOut(false);
                  setToastMessage("🚀 Welcome back, Rajesh Kumar! Driver shift session active.");
                }} 
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold text-[#434655] uppercase tracking-wider mb-2">Select your role</label>
                  <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#f2f4f6] rounded-2xl border border-slate-200/60">
                    {[
                      { key: 'Student', icon: 'school' },
                      { key: 'Driver', icon: 'directions_bus' },
                      { key: 'Admin', icon: 'admin_panel_settings' },
                    ].map(item => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setLoginRole(item.key as any)}
                        className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                          loginRole === item.key
                            ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20'
                            : 'text-[#505f76] hover:bg-white/60'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg mb-0.5">{item.icon}</span>
                        <span>{item.key}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#434655] uppercase tracking-wider mb-2">University Email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-lg">mail</span>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[#f2f4f6] border border-slate-200 rounded-2xl text-sm font-medium text-[#191c1e] focus:bg-white focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#434655] uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-lg">lock</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 bg-[#f2f4f6] border border-slate-200 rounded-2xl text-sm font-medium text-[#191c1e] focus:bg-white focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10 focus:outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#2563eb]"
                    >
                      <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-[#2563eb]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </form>

              <div className="relative my-7">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-xs"><span className="px-4 bg-white text-[#737686] font-bold">OR</span></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsLoggedOut(false);
                  setToastMessage("🔒 Authenticated via University SSO!");
                }}
                className="w-full bg-white border border-slate-300 text-[#191c1e] py-3 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">account_balance</span>
                <span>Sign in with University SSO</span>
              </button>

              <div className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold text-[#505f76]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>System Status: All routes operational</span>
              </div>
            </div>
          </main>

          <aside className="hidden lg:block w-[55%] relative overflow-hidden bg-slate-900">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-105"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida/AP1WRLv-kh3xQQLf42vpAL3r-GC9Ij__Y4d6MNiZT6kPMXqwgNBQ2EzYzUze5xnGB7KyFvCtHGkfYVJEk_iuEkVK6LOM-JwR3jwTWWlDhJ39bcxtCpFsWIhFIVf34MVkW9yE1so3GHDGcL-OXHo1McIWcObVXuFqQ-nbfFTA3YblGHAZznHsa4DIAaFvOLZtutXrVRa9ncmR819ZFRs07Wfhq_A91FirWHlfgiCTOS3PnGTlUEdidqMcte2Uog')`
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2563eb]/90 via-[#2563eb]/50 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-16 xl:p-20 text-white z-20">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px w-12 bg-white/60"></div>
                  <span className="font-bold text-xs uppercase tracking-widest text-white/80">BusFlow Mission</span>
                </div>
                <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight mb-4">Simplifying campus transit for every student.</h2>
                <p className="text-base text-white/90 leading-relaxed font-normal">Our smart logistics engine ensures that university transportation remains efficient, reliable, and accessible for the entire campus community.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans antialiased selection:bg-[#004ac6] selection:text-white flex flex-col">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-[#0f172a]/95 text-white font-semibold text-sm px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 border border-slate-700/80 animate-bounce">
          <span className="material-symbols-outlined text-amber-400 text-xl">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Traffic Report Modal */}
      {trafficModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 rounded-3xl p-6 md:p-8 max-w-md w-full border border-white/80 shadow-2xl animate-fade-in relative">
            <button 
              onClick={() => setTrafficModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-xl font-bold"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Report Road Incident</h3>
                <p className="text-xs text-slate-500 font-medium">Broadcast to Fleet Command and nearby drivers</p>
              </div>
            </div>

            <form onSubmit={handleReportTrafficSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Incident Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Heavy Traffic', 'Accident', 'Road Work', 'Weather Hazard'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setReportCategory(type)}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                        reportCategory === type 
                          ? 'bg-[#004ac6] text-white border-[#004ac6] shadow-md shadow-[#004ac6]/20' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{type}</span>
                      {reportCategory === type && <span className="material-symbols-outlined text-sm">check_circle</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Additional Notes (Optional)</label>
                <textarea
                  value={reportNote}
                  onChange={e => setReportNote(e.target.value)}
                  placeholder="e.g., Construction near Banur Toll..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-[#004ac6] h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTrafficModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-600/20 transition flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>Send Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Scanner Check-in Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-200 shadow-2xl animate-fade-in relative text-center">
            <button 
              onClick={() => setQrModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-xl font-bold"
            >
              ✕
            </button>
            
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#004ac6] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
            </div>
            
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">Student Pass Scanner</h3>
            <p className="text-xs text-slate-500 mb-4">Position barcode in viewfinder or enter Student ID manually</p>

            {/* Viewfinder simulation */}
            <div className="relative w-full h-44 bg-slate-900 rounded-2xl overflow-hidden mb-5 border-2 border-[#004ac6] flex items-center justify-center">
              <div className="absolute inset-x-8 top-1/2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse"></div>
              <div className="text-white/60 text-xs font-mono flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-sm">filter_center_focus</span>
                <span>Ready to scan bus pass...</span>
              </div>
            </div>

            <form onSubmit={handleQRScanSubmit} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualScanInput}
                  onChange={e => setManualScanInput(e.target.value)}
                  placeholder="e.g. #STU-88210"
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004ac6]/30"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#004ac6] hover:bg-[#003ea8] text-white font-bold rounded-xl text-sm shadow-md transition"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TopNavBar (Integrated Navigation based on SCREEN_4 & HTML Prompt) */}
      <header className="sticky top-0 z-50 flex items-center px-6 lg:px-margin-desktop w-full h-20 bg-[#f7f9fb]/80 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div className="flex items-center gap-2 mr-12 cursor-pointer" onClick={() => setActiveTab("Today's Trip")}>
          <span className="material-symbols-outlined text-[#004ac6] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            directions_bus
          </span>
          <h1 className="font-extrabold text-2xl text-[#004ac6] tracking-tight">BusFlow</h1>
        </div>

        <nav className="hidden lg:flex flex-1 items-center gap-8">
          {(["Today's Trip", "Navigation", "Passengers", "Alerts", "Profile"] as ActiveTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-semibold text-sm transition-colors py-1 ${
                activeTab === tab
                  ? 'text-[#004ac6] font-bold border-b-2 border-[#004ac6]'
                  : 'text-[#434655] hover:text-[#004ac6]'
              }`}
            >
              {tab}
              {tab === 'Alerts' && (
                <span className="ml-1.5 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {alerts.filter(a => !a.acknowledged).length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686] text-sm">
              search
            </span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#f2f4f6] border-none rounded-full text-sm w-48 focus:ring-2 focus:ring-[#004ac6]/20 focus:bg-white transition-all text-[#191c1e]"
              placeholder="Search..."
              type="text"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-sm text-[#191c1e]">Rajesh Kumar</p>
              <div className="flex items-center justify-end gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] uppercase tracking-wider text-[#737686] font-bold">Online</p>
              </div>
            </div>
            <div 
              onClick={() => setActiveTab("Profile")}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#004ac6] cursor-pointer shadow-sm"
            >
              <img
                className="w-full h-full object-cover"
                alt="Rajesh Kumar Driver Profile"
                src="https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=150&q=80"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* TAB 3: PASSENGER MANAGEMENT VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'Passengers' && (
        <main className="flex-1 flex flex-col pt-4">
          <div className="p-6 lg:p-margin-desktop max-w-[1600px] mx-auto w-full space-y-6 pb-32 lg:pb-margin-desktop">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
              <div>
                <h2 className="font-extrabold text-3xl lg:text-4xl text-[#191c1e] tracking-tight">Passenger Management</h2>
                <p className="text-base text-[#434655] mt-1 font-normal">Manage students for Rajpura Route • Trip #842</p>
              </div>
              <div className="px-6 py-2 bg-[#004ac6]/10 rounded-full border border-[#004ac6]/20 shadow-sm">
                <span className="text-[#004ac6] font-bold text-sm">Driver ID: PB-4920</span>
              </div>
            </div>

            {/* Summary Stats Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Assigned */}
              <div className="glass-card p-6 flex items-center justify-between group hover:scale-[1.02] transition-transform duration-300">
                <div>
                  <p className="text-[#737686] font-semibold text-xs uppercase tracking-widest mb-1">Total Assigned</p>
                  <h3 className="font-extrabold text-4xl text-[#191c1e]">{totalAssigned}</h3>
                  <p className="text-sm text-[#004ac6] mt-1 font-medium">Full Capacity</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#004ac6]/10 flex items-center justify-center text-[#004ac6]">
                  <span className="material-symbols-outlined text-3xl">assignment_ind</span>
                </div>
              </div>

              {/* Boarded */}
              <div className="glass-card p-6 flex items-center justify-between group hover:scale-[1.02] transition-transform duration-300">
                <div>
                  <p className="text-[#737686] font-semibold text-xs uppercase tracking-widest mb-1">Boarded</p>
                  <h3 className="font-extrabold text-4xl text-[#191c1e]">{boardedCount}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#004ac6] h-full transition-all duration-500" 
                        style={{ width: `${boardingPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-[#004ac6] font-bold">{boardingPercentage}%</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-700">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
              </div>

              {/* Waiting */}
              <div className="glass-card p-6 flex items-center justify-between group hover:scale-[1.02] transition-transform duration-300">
                <div>
                  <p className="text-[#737686] font-semibold text-xs uppercase tracking-widest mb-1">Waiting</p>
                  <h3 className="font-extrabold text-4xl text-[#191c1e]">{waitingCount}</h3>
                  <p className="text-sm text-amber-700 mt-1 font-medium">Upcoming Stop: Patiala Bypass (Rajpura)</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <span className="material-symbols-outlined text-3xl">pending_actions</span>
                </div>
              </div>
            </section>

            {/* Main Passenger Table Section */}
            <section className="glass-card overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="font-bold text-xl text-[#191c1e]">Student Manifest</h4>
                  <p className="text-xs text-[#737686]">Live update • Last scanned 2m ago</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={handleBulkBoarding}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-slate-300 text-[#191c1e] font-semibold text-sm hover:bg-slate-100 transition-colors shadow-sm active:scale-95"
                  >
                    <span className="material-symbols-outlined text-lg">checklist</span>
                    <span>Bulk Boarding</span>
                  </button>

                  <button 
                    onClick={() => setQrModalOpen(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#004ac6] text-white font-semibold text-sm hover:bg-[#003ea8] shadow-md transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
                    <span>Check-in</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="px-6 py-4 font-bold text-xs text-[#737686] uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 font-bold text-xs text-[#737686] uppercase tracking-wider">Student ID</th>
                      <th className="px-6 py-4 font-bold text-xs text-[#737686] uppercase tracking-wider">Pickup Stop</th>
                      <th className="px-6 py-4 font-bold text-xs text-[#737686] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 font-bold text-xs text-[#737686] uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredPassengers.map(student => (
                      <tr key={student.id} className="hover:bg-[#004ac6]/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {student.avatarUrl ? (
                              <img
                                className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200"
                                alt={student.name}
                                src={student.avatarUrl}
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-full ${student.avatarColor} flex items-center justify-center font-bold text-xs shadow-sm`}>
                                {student.initials}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-base text-[#191c1e]">{student.name}</p>
                              <p className="text-xs text-[#737686]">{student.yearMajor || 'Year 2 • Student'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono text-sm text-[#434655] font-semibold">{student.studentId}</td>
                        <td className="px-6 py-4 text-sm font-medium text-[#191c1e]">{student.pickupStop}</td>

                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider ${
                            student.status === 'Boarded'
                              ? 'status-boarded'
                              : student.status === 'Waiting'
                              ? 'status-waiting'
                              : 'status-noshow'
                          }`}>
                            {student.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right relative">
                          {student.status === 'Waiting' ? (
                            <button
                              onClick={() => handleCheckInPassenger(student.id, student.name)}
                              className="px-4 py-1.5 rounded-lg bg-[#004ac6] text-white text-[12px] font-bold hover:brightness-110 transition-all active:scale-95 shadow-sm"
                            >
                              Check In
                            </button>
                          ) : (
                            <div className="inline-block relative">
                              <button
                                onClick={() => setActiveMenuStudentId(activeMenuStudentId === student.id ? null : student.id)}
                                className="text-[#737686] hover:text-[#004ac6] transition-colors p-1 rounded-lg"
                              >
                                <span className="material-symbols-outlined">more_vert</span>
                              </button>

                              {/* Dropdown Menu */}
                              {activeMenuStudentId === student.id && (
                                <div className="absolute right-0 top-8 z-30 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 w-44 text-left animate-fade-in space-y-1">
                                  <button
                                    onClick={() => togglePassengerStatus(student.id, 'Boarded')}
                                    className="w-full px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl flex items-center gap-2"
                                  >
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    <span>Mark Boarded</span>
                                  </button>
                                  <button
                                    onClick={() => togglePassengerStatus(student.id, 'Waiting')}
                                    className="w-full px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-xl flex items-center gap-2"
                                  >
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    <span>Mark Waiting</span>
                                  </button>
                                  <button
                                    onClick={() => togglePassengerStatus(student.id, 'No Show')}
                                    className="w-full px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl flex items-center gap-2"
                                  >
                                    <span className="material-symbols-outlined text-sm">cancel</span>
                                    <span>Mark No-Show</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex justify-between items-center">
                <p className="text-xs text-[#737686]">
                  Showing <span className="font-bold text-[#191c1e]">1 - {filteredPassengers.length}</span> of {totalAssigned} passengers
                </p>
                <div className="flex gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-100 transition" disabled>
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-300 bg-white shadow-sm hover:bg-slate-100 transition">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </section>

          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FULL-SCREEN DRIVER NAVIGATION (DYNAMIC LEAFLET LIVE RAJPURA MAP) */}
      {/* ========================================================================= */}
      {activeTab === 'Navigation' && (
        <main className="relative h-[calc(100vh-5rem)] w-full overflow-hidden">
          {/* Dynamic Leaflet OpenStreetMap Container */}
          <div className="absolute inset-0 z-0">
            <RajpuraLeafletMap currentStopIndex={currentStopIndex} speed={speed} etaMinutes={etaMinutes} />
            <div className="absolute inset-0 map-gradient-overlay pointer-events-none z-[1]"></div>
          </div>

          {/* Floating UI Overlay */}
          <div className="absolute inset-0 pointer-events-none p-4 md:p-8 flex flex-col justify-between pt-6 pb-24 md:pb-8 z-20">
            <div className="flex justify-between items-start pointer-events-auto">
              <div className="glass-card w-full max-w-md rounded-3xl p-6 flex items-center gap-6 shadow-xl border border-white/60">
                <div className="w-16 h-16 rounded-2xl bg-[#004ac6] flex items-center justify-center text-white shadow-lg flex-shrink-0">
                  <span className="material-symbols-outlined text-[40px]">
                    {currentNavStop.turnInstruction?.includes('Right') ? 'turn_right' : currentNavStop.turnInstruction?.includes('Left') ? 'turn_left' : 'straight'}
                  </span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[#737686] font-bold text-xs uppercase tracking-wider mb-0.5">Next Stop (Rajpura)</span>
                  <h3 className="font-extrabold text-2xl text-[#191c1e] leading-tight truncate">{currentNavStop.name}</h3>
                  <div className="flex items-center gap-2 text-[#004ac6] font-bold mt-1 text-sm">
                    <span className="material-symbols-outlined text-sm">near_me</span>
                    <span>{currentNavStop.distance || '1.2 km'}</span>
                    <span className="text-slate-400 font-normal text-xs">• {currentNavStop.turnInstruction}</span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-2 glass-card px-4 py-2 rounded-2xl font-bold text-xs text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>OpenStreetMap GPS • Rajpura Transit Line</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch md:items-end justify-between pointer-events-auto">
              <div className="glass-card rounded-3xl p-5 md:p-6 flex items-center justify-around md:justify-start gap-6 md:gap-8 shadow-xl border border-white/60">
                <div className="flex flex-col items-center">
                  <span className="text-[#737686] text-[10px] font-bold uppercase tracking-wider">Speed</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-extrabold text-[#191c1e]">{speed}</span>
                    <span className="text-xs font-bold text-[#737686]">km/h</span>
                  </div>
                </div>
                <div className="w-px h-10 bg-slate-300/60"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[#737686] text-[10px] font-bold uppercase tracking-wider">ETA</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-extrabold text-[#191c1e]">{etaMinutes}</span>
                    <span className="text-xs font-bold text-[#737686]">min</span>
                  </div>
                </div>
                <div className="w-px h-10 bg-slate-300/60"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[#737686] text-[10px] font-bold uppercase tracking-wider">Status</span>
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-extrabold text-emerald-700">On Time</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end">
                <button
                  onClick={handleToggleMute}
                  className={`glass-card w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg border border-white/80 ${
                    isMuted ? 'text-rose-600 bg-rose-50/80' : 'text-[#737686] hover:text-[#004ac6]'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">{isMuted ? 'volume_off' : 'volume_up'}</span>
                </button>
                <button
                  onClick={() => setTrafficModalOpen(true)}
                  className="glass-card px-6 h-14 rounded-full flex items-center gap-3 text-slate-700 hover:text-rose-600 transition-all active:scale-95 shadow-lg border border-white/80 font-bold text-sm"
                >
                  <span className="material-symbols-outlined text-rose-600 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  <span>Report Traffic</span>
                </button>
                <button
                  onClick={handleRecenterNav}
                  className="bg-[#004ac6] hover:bg-[#003ea8] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-2xl">navigation</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: TODAY'S TRIP DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {activeTab === "Today's Trip" && (
        <main className="pt-6 pb-24 max-w-7xl mx-auto px-6 space-y-6">
          <section className="bg-white/80 backdrop-blur-xl border border-[#d8dadc] rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#191c1e]">Good Morning, Rajesh 👋</h1>
              <div className="flex flex-wrap gap-4 items-center pt-1">
                <div className="flex flex-col">
                  <span className="text-xs text-[#434655] uppercase tracking-wider font-semibold">Vehicle</span>
                  <span className="text-lg font-extrabold text-[#004ac6]">PB10AB1234</span>
                </div>
                <div className="w-px h-8 bg-[#d8dadc] self-end hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#434655] uppercase tracking-wider font-semibold">Active Route</span>
                  <span className="text-lg font-bold text-[#191c1e]">{shiftType === 'MORNING' ? 'Rajpura Route (Inbound)' : 'Rajpura Route (Outbound)'}</span>
                </div>
                <div className="w-px h-8 bg-[#d8dadc] self-end hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#434655] uppercase tracking-wider font-semibold">Students</span>
                  <span className="text-lg font-bold text-[#191c1e]">{boardedCount}/47</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleTrip}
              className={`px-8 py-3.5 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-white ${
                tripStatus === 'IN_TRANSIT' ? 'bg-emerald-600' : 'bg-[#004ac6]'
              }`}
            >
              <span className="material-symbols-outlined">{tripStatus === 'IN_TRANSIT' ? 'check_circle' : 'play_arrow'}</span>
              <span>{tripStatus === 'IN_TRANSIT' ? 'IN TRANSIT' : 'START TRIP'}</span>
            </button>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            <div 
              onClick={() => setActiveTab('Navigation')}
              className="lg:col-span-7 h-[400px] bg-white/80 backdrop-blur-xl border border-[#d8dadc] rounded-3xl overflow-hidden relative group cursor-pointer shadow-sm"
            >
              <RajpuraLeafletMap currentStopIndex={currentStopIndex} height="100%" />

              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-lg z-[10]">
                <div>
                  <p className="text-[10px] text-[#737686] uppercase tracking-wider font-bold">Next Stop (Rajpura)</p>
                  <p className="font-extrabold text-lg text-[#191c1e]">{currentNavStop.name}</p>
                </div>
                <button className="bg-[#004ac6] text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md">
                  <span>Launch Live Navigation</span>
                  <span className="material-symbols-outlined text-sm">open_in_full</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white/80 backdrop-blur-xl border border-[#d8dadc] rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-[#191c1e]">Passenger Quick Stats</h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <p className="text-2xl font-extrabold text-emerald-700">{boardedCount}</p>
                  <p className="text-[10px] text-emerald-800 uppercase font-bold">Boarded</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <p className="text-2xl font-extrabold text-amber-700">{waitingCount}</p>
                  <p className="text-[10px] text-amber-800 uppercase font-bold">Waiting</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('Passengers')}
                className="w-full py-2.5 bg-slate-100 hover:bg-[#004ac6] hover:text-white text-[#191c1e] text-xs font-bold rounded-xl transition"
              >
                Go to Full Passenger Roster
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ALERT CENTER VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'Alerts' && (
        <main className="pt-6 pb-24 max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="lg:w-1/4">
              <div className="bg-white/85 backdrop-blur-xl border border-white/50 rounded-3xl p-5 sticky top-24 shadow-sm">
                <h2 className="text-xl font-extrabold mb-4 text-[#191c1e]">Alert Center</h2>
                <ul className="space-y-1">
                  {[
                    { key: 'ALL', label: 'All Messages', icon: 'all_inbox', badge: alerts.length },
                    { key: 'EMERGENCY', label: 'Emergency', icon: 'emergency', badge: alerts.filter(a => a.category === 'EMERGENCY').length },
                    { key: 'TRAFFIC', label: 'Traffic', icon: 'traffic', badge: alerts.filter(a => a.category === 'TRAFFIC').length },
                    { key: 'SYSTEM', label: 'System', icon: 'settings_suggest', badge: alerts.filter(a => a.category === 'SYSTEM').length }
                  ].map(cat => (
                    <li key={cat.key}>
                      <button
                        onClick={() => setAlertFilter(cat.key as AlertFilter)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl font-semibold text-sm ${
                          alertFilter === cat.key ? 'bg-[#004ac6]/10 text-[#004ac6] font-bold' : 'text-[#434655] hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#004ac6] text-white">
                          {cat.badge}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <section className="lg:w-3/4 flex flex-col gap-4">
              {filteredAlerts.map(alert => (
                <div key={alert.id} className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 shadow-sm border-l-4 border-[#004ac6]">
                  <h3 className="text-lg font-bold text-[#191c1e]">{alert.title}</h3>
                  <p className="text-xs text-[#737686] mb-3">{alert.timestamp}</p>
                  <p className="text-sm text-[#434655] mb-4">{alert.message}</p>
                  <button
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    disabled={alert.acknowledged}
                    className="px-5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-[#191c1e]"
                  >
                    {alert.acknowledged ? 'Acknowledged' : 'Acknowledge Alert'}
                  </button>
                </div>
              ))}
            </section>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DRIVER PROFILE VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'Profile' && (
        <main className="pt-6 pb-24 max-w-5xl mx-auto px-6 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-[#d8dadc] rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="w-28 h-28 rounded-full border-4 border-[#004ac6] overflow-hidden shadow-xl flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=300&q=80"
                alt="Rajesh Kumar Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-extrabold text-[#191c1e]">Rajesh Kumar</h1>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">Senior Fleet Specialist</span>
              </div>
              <p className="text-sm text-slate-500 font-medium">Commercial License #: PB-11-2018-9420 • 14 Years Driving Experience</p>
              <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
                <div className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-700">⭐ 4.96 Star Rating</div>
                <div className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-700">🚌 Rajpura Express #PB10AB1234</div>
                <div className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-700">🕒 Active Shift</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-xl border border-[#d8dadc] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-lg text-slate-900">Vehicle Diagnostic Check</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs font-bold text-slate-600">Fuel Level</span>
                  <span className="text-sm font-extrabold text-emerald-600">84% Full</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs font-bold text-slate-600">Tire Pressure</span>
                  <span className="text-sm font-extrabold text-slate-900">32 PSI (Optimal)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs font-bold text-slate-600">Next Maintenance</span>
                  <span className="text-sm font-extrabold text-slate-900">In 1,200 km</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-[#d8dadc] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-lg text-slate-900">Account Management</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setToastMessage("📋 Pre-shift inspection checklist submitted!")}
                  className="w-full py-3 bg-[#004ac6] text-white font-bold rounded-xl text-sm shadow-[#004ac6]/20 shadow-md hover:bg-[#003ea8] transition"
                >
                  Complete Pre-Shift Inspection
                </button>
                <button 
                  onClick={() => {
                    setIsLoggedOut(true);
                    setToastMessage("🚪 Logged out. Redirected to Sign In screen.");
                  }}
                  className="w-full py-3 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-xl text-sm hover:bg-rose-100 transition flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>End Shift & Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Mobile Bottom Navigation Shell (User Prompt HTML UX Match) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe h-20 bg-[#f7f9fb]/85 backdrop-blur-xl border-t border-white/50 shadow-lg">
        {[
          { tab: "Today's Trip" as ActiveTab, label: 'Trip', icon: 'today' },
          { tab: 'Navigation' as ActiveTab, label: 'Nav', icon: 'explore' },
          { tab: 'Passengers' as ActiveTab, label: 'Peeps', icon: 'group' },
          { tab: 'Alerts' as ActiveTab, label: 'Alerts', icon: 'notifications_active' },
          { tab: 'Profile' as ActiveTab, label: 'Me', icon: 'person' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center justify-center transition-all ${
              activeTab === item.tab
                ? 'text-[#004ac6] font-bold'
                : 'text-[#434655] hover:text-[#004ac6]'
            }`}
          >
            <span className="material-symbols-outlined" style={activeTab === item.tab ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
            <span className="font-bold text-[10px] uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}
