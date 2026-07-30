'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { InteractiveMap } from '@/components/maps/InteractiveMap';
import { studentApi } from '@/services/api/student';
import { BusLocationUpdate } from '@/types/tracking';

export default function StudentTrackingPage() {
  const [busLocation, setBusLocation] = useState<BusLocationUpdate | null>(null);

  useEffect(() => {
    studentApi.getTrackedBusLocation('bus-1').then(setBusLocation);
  }, []);

  return (
    <div className="space-y-6">
      <Header title="Live Bus GPS Tracker" />

      {busLocation && (
        <InteractiveMap
          locations={[busLocation]}
          selectedBusId={busLocation.busId}
        />
      )}
    </div>
  );
}
