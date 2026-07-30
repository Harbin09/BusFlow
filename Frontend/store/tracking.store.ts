import { create } from 'zustand';
import { BusLocationUpdate, GeofenceAlert } from '@/types/tracking';

interface TrackingStore {
  activeLocations: Record<string, BusLocationUpdate>;
  selectedBusId: string | null;
  alerts: GeofenceAlert[];
  updateBusLocation: (location: BusLocationUpdate) => void;
  selectBus: (busId: string | null) => void;
  addAlert: (alert: GeofenceAlert) => void;
  setLocations: (locations: BusLocationUpdate[]) => void;
}

export const useTrackingStore = create<TrackingStore>((set) => ({
  activeLocations: {},
  selectedBusId: null,
  alerts: [],

  updateBusLocation: (location) =>
    set((state) => ({
      activeLocations: {
        ...state.activeLocations,
        [location.busId]: location,
      },
    })),

  selectBus: (busId) => set({ selectedBusId: busId }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 50),
    })),

  setLocations: (locations) => {
    const locMap: Record<string, BusLocationUpdate> = {};
    locations.forEach((loc) => {
      locMap[loc.busId] = loc;
    });
    set({ activeLocations: locMap });
  },
}));
