import React, { useEffect, useRef } from 'react';

interface DriverMapProps {
  location: { latitude: number; longitude: number };
  bus: any;
}

declare global {
  interface Window {
    L: any;
  }
}

export const DriverMap: React.FC<DriverMapProps> = ({ location, bus }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }

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

  useEffect(() => {
    if (mapInstance.current && markerRef.current) {
      markerRef.current.setLatLng([location.latitude, location.longitude]);
      mapInstance.current.panTo([location.latitude, location.longitude]);
    }
  }, [location]);

  const initializeMap = () => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = window.L.map(mapRef.current).setView(
      [location.latitude, location.longitude],
      15
    );

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    const busIcon = window.L.divIcon({
      html: `
        <div style="
          background-color: #3b82f6;
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: bold;
          text-align: center;
          min-width: 80px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          🚌<br/>${bus?.plateNumber || 'BUS'}
        </div>
      `,
      iconSize: [100, 70],
      className: 'bus-marker',
    });

    markerRef.current = window.L.marker([location.latitude, location.longitude], {
      icon: busIcon,
    })
      .bindPopup(
        `<div style="text-align: center;">
          <strong>${bus?.plateNumber || 'Your Bus'}</strong><br/>
          <small>Current Location</small>
        </div>`,
        { maxWidth: 200 }
      )
      .addTo(mapInstance.current);
  };

  return (
    <div
      ref={mapRef}
      style={{
        height: '400px',
        width: '100%',
      }}
    />
  );
};
