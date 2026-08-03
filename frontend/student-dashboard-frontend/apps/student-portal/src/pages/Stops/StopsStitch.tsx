import React, { useState } from 'react';
import { TopNavBar, SideNavBar, BottomNavBar, GlassCard, Button, Badge } from '../../components/Stitch';

interface BusStop {
  id: string;
  name: string;
  distance: string;
  walkTime: number;
  nextArrivals: Array<{ route: string; time: string; letter: string; color: string }>;
  image?: string;
  isHome?: boolean;
}

const mockStops: BusStop[] = [
  {
    id: 'main-gate',
    name: 'Main Gate',
    distance: '280m',
    walkTime: 4,
    isHome: true,
    nextArrivals: [
      { route: 'Blue Line', time: '2 mins', letter: 'A', color: 'bg-primary' },
      { route: 'Circular', time: '12 mins', letter: 'C', color: 'bg-secondary' },
      { route: 'Blue Line', time: '24 mins', letter: 'A', color: 'bg-primary' },
    ],
  },
  {
    id: 'library',
    name: 'Central Library',
    distance: '650m',
    walkTime: 8,
    nextArrivals: [
      { route: 'Express', time: 'Due Now', letter: 'E', color: 'bg-tertiary-container' },
      { route: 'Blue Line', time: '9 mins', letter: 'A', color: 'bg-primary' },
      { route: 'Circular', time: '15 mins', letter: 'C', color: 'bg-secondary' },
    ],
  },
  {
    id: 'sector-17',
    name: 'Sector 17',
    distance: '1.1km',
    walkTime: 12,
    nextArrivals: [
      { route: 'Circular', time: '5 mins', letter: 'C', color: 'bg-secondary' },
      { route: 'Red Line', time: '18 mins', letter: 'B', color: 'bg-primary' },
      { route: 'Circular', time: '32 mins', letter: 'C', color: 'bg-secondary' },
    ],
  },
  {
    id: 'medical-center',
    name: 'Medical Center',
    distance: '2.4km',
    walkTime: 22,
    nextArrivals: [
      { route: 'Red Line', time: '7 mins', letter: 'B', color: 'bg-primary' },
      { route: 'Express', time: '14 mins', letter: 'E', color: 'bg-tertiary-container' },
      { route: 'Red Line', time: '28 mins', letter: 'B', color: 'bg-primary' },
    ],
  },
];

export const StopsStitch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStops = mockStops.filter((stop) =>
    stop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-background min-h-screen text-on-surface">
      <TopNavBar />
      <SideNavBar />
      <BottomNavBar />

      <main className="pt-24 pb-20 pl-0 lg:pl-20 px-margin-desktop max-w-container-max mx-auto">
        {/* Header & Search */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface mb-2">Transit Hub</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-lg">
              Locate shuttle stops, check real-time arrivals, and manage your frequent campus destinations with precision.
            </p>
          </div>
          <div className="relative w-full md:w-96 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-body-md text-body-md shadow-sm"
              placeholder="Search for a stop or building..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Stop Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filteredStops.map((stop) => (
            <div key={stop.id} className="glass-card rounded-[20px] overflow-hidden flex flex-col">
              {/* Map Image */}
              <div className="relative h-48 w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary/30">map</span>
                {stop.isHome && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="primary">
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        home
                      </span>
                      Home Stop
                    </Badge>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">{stop.name}</h3>
                    <div className="flex items-center gap-1 text-on-surface-variant mt-1">
                      <span className="material-symbols-outlined text-[18px]">directions_walk</span>
                      <span className="font-body-sm text-body-sm">
                        {stop.walkTime} min ({stop.distance}) away
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-surface-container rounded-full transition-colors text-outline hover:text-primary">
                    <span className="material-symbols-outlined">star</span>
                  </button>
                </div>

                {/* Next Arrivals */}
                <div className="space-y-3 mb-6">
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Next Arrivals
                  </p>
                  {stop.nextArrivals.map((arrival, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        idx === 0
                          ? 'bg-primary/5 border-primary/10'
                          : 'bg-surface-container-lowest border-outline-variant/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`${arrival.color} text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm`}
                        >
                          {arrival.letter}
                        </div>
                        <span className="font-body-md text-body-md">{arrival.route}</span>
                      </div>
                      <span className={`font-bold ${idx === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {arrival.time}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                  <Button
                    variant="outline"
                    className="flex-grow"
                  >
                    Set as Home Stop
                  </Button>
                  <Button variant="secondary" className="px-4">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Bento Stats Card */}
          <GlassCard className="lg:col-span-2 rounded-[20px] p-8 flex flex-col md:flex-row gap-8 items-center bg-gradient-to-br from-primary/10 to-transparent">
            <div className="flex-1">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Optimized Campus Travel</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Our algorithm tracks 42 active shuttles to provide 99.8% ETA accuracy. Set your Home Stop to receive automatic proximity alerts on your mobile device.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/60 rounded-2xl">
                  <p className="font-headline-md text-headline-md text-primary">12k+</p>
                  <p className="font-label-md text-label-md text-on-surface-variant">Daily Commuters</p>
                </div>
                <div className="p-4 bg-white/60 rounded-2xl">
                  <p className="font-headline-md text-headline-md text-primary">4.2m</p>
                  <p className="font-label-md text-label-md text-on-surface-variant">Walking Min Saved</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-64 h-64 relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-primary/30">trending_up</span>
            </div>
          </GlassCard>
        </div>
      </main>

      {/* FAB */}
      <button className="fixed bottom-28 right-8 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
        <span className="material-symbols-outlined text-[32px]">map</span>
      </button>
    </div>
  );
};
