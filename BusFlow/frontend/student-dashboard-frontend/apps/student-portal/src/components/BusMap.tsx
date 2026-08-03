import React, { useEffect, useRef } from 'react';

interface BusLocation {
  id: string;
  busNumber: string;
  latitude: number;
  longitude: number;
  status: string;
}

interface BusMapProps {
  buses: BusLocation[];
  height?: string;
}

declare global {
  interface Window {
    L: any;
  }
}

export const BusMap: React.FC<BusMapProps> = ({ buses, height = '500px' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    console.log('[BusMap] Component mounted, buses:', buses);

    // Load Leaflet CSS dynamically
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
      console.log('[BusMap] Leaflet CSS loaded');
    }

    // Load Leaflet JS dynamically
    if (!window.L) {
      console.log('[BusMap] Loading Leaflet JS...');
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = () => {
        console.log('[BusMap] Leaflet JS loaded, initializing map');
        initializeMap();
      };
      script.onerror = () => {
        console.error('[BusMap] Failed to load Leaflet JS');
      };
      document.head.appendChild(script);
    } else {
      console.log('[BusMap] Leaflet already loaded, initializing map');
      initializeMap();
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const initializeMap = () => {
    try {
      if (!mapRef.current) {
        console.error('[BusMap] Map ref not available');
        return;
      }
      if (mapInstance.current) {
        console.log('[BusMap] Map already initialized');
        return;
      }

      console.log('[BusMap] Initializing map with buses:', buses);

      // Default center (Delhi area)
      const defaultCenter: [number, number] = [28.6139, 77.2090];
      const center: [number, number] = buses.length > 0
        ? [buses[0].latitude, buses[0].longitude]
        : defaultCenter;

      console.log('[BusMap] Map center:', center);

      mapInstance.current = window.L.map(mapRef.current).setView(center, 12);

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current);

      console.log('[BusMap] Map initialized successfully');

      // Add bus markers
      addBusMarkers();
    } catch (error) {
      console.error('[BusMap] Error initializing map:', error);
    }
  };

  const addBusMarkers = () => {
    try {
      console.log('[BusMap] Adding bus markers, count:', buses.length);

      // Clear existing markers
      markersRef.current.forEach((marker) => {
        if (mapInstance.current) {
          mapInstance.current.removeLayer(marker);
        }
      });
      markersRef.current = [];

      if (!mapInstance.current) {
        console.error('[BusMap] Map instance not available');
        return;
      }
      if (buses.length === 0) {
        console.log('[BusMap] No buses to display');
        return;
      }

    buses.forEach((bus) => {
      const statusColor = bus.status === 'IN_TRANSIT' ? '#ef4444' : '#a3a3a3';
      const statusIcon = bus.status === 'IN_TRANSIT' ? '🚌' : '🚌';

      // Create custom HTML for marker
      const html = `
        <div style="
          background-color: ${statusColor};
          color: white;
          padding: 6px 10px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 12px;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          text-align: center;
          min-width: 60px;
        ">
          ${statusIcon}<br/>
          ${bus.busNumber}
        </div>
      `;

      const customIcon = window.L.divIcon({
        html,
        iconSize: [70, 60],
        className: 'bus-marker',
      });

      const marker = window.L.marker([bus.latitude, bus.longitude], {
        icon: customIcon,
      })
        .bindPopup(
          `<div style="font-weight: bold;">${bus.busNumber}</div>
           <div>Status: ${bus.status}</div>
           <div>Location: ${bus.latitude.toFixed(4)}, ${bus.longitude.toFixed(4)}</div>`,
          { maxWidth: 200 }
        )
        .addTo(mapInstance.current);

      markersRef.current.push(marker);
    });

      // Fit map bounds to all markers
      if (markersRef.current.length > 0 && buses.length > 0) {
        const group = window.L.featureGroup(markersRef.current);
        mapInstance.current.fitBounds(group.getBounds(), { padding: [50, 50] });
        console.log('[BusMap] Markers added:', markersRef.current.length);
      }
    } catch (error) {
      console.error('[BusMap] Error adding markers:', error);
    }
  };

  useEffect(() => {
    if (mapInstance.current && buses.length > 0) {
      addBusMarkers();
    }
  }, [buses]);

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    />
  );
};
