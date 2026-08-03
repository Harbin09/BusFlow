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
    // Load Leaflet CSS dynamically
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS dynamically
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = () => {
        initializeMap();
      };
      document.head.appendChild(script);
    } else {
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
    if (!mapRef.current) return;
    if (mapInstance.current) return;

    const isValidCoord = (lat: any, lng: any) =>
      typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng) &&
      lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

    const defaultCenter: [number, number] = [28.6139, 77.2090];
    const firstValidBus = buses.find((b) => isValidCoord(b.latitude, b.longitude));
    const center: [number, number] = firstValidBus
      ? [firstValidBus.latitude, firstValidBus.longitude]
      : defaultCenter;

    try {
      // Reset any stale Leaflet container state to prevent "already initialized" error
      if ((mapRef.current as any)._leaflet_id) {
        (mapRef.current as any)._leaflet_id = null;
      }

      mapInstance.current = window.L.map(mapRef.current, { zoomControl: true }).setView(center, 13);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current);

      addBusMarkers();
    } catch (err) {
      console.error('[BusMap] Error initializing map:', err);
    }
  };


  const addBusMarkers = () => {
    try {
      markersRef.current.forEach((marker) => {
        if (mapInstance.current) {
          mapInstance.current.removeLayer(marker);
        }
      });
      markersRef.current = [];

      if (!mapInstance.current || buses.length === 0) return;

      const isValidCoord = (lat: any, lng: any) =>
        typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);

      buses.forEach((bus) => {
        if (!isValidCoord(bus.latitude, bus.longitude)) {
          return;
        }

        const statusColor = bus.status === 'IN_TRANSIT' ? '#ef4444' : '#a3a3a3';
        const statusIcon = bus.status === 'IN_TRANSIT' ? '🚌' : '🚌';

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

      if (markersRef.current.length > 0) {
        const group = window.L.featureGroup(markersRef.current);
        const bounds = group.getBounds();
        if (bounds && typeof bounds.isValid === 'function' && bounds.isValid()) {
          mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
        }
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
