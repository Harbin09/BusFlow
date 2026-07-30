'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { BusLocation } from '@/lib/hooks/useTracking';

interface TrackingMapProps {
  busLocation: BusLocation | null;
  pickupLocation?: { lat: number; lng: number };
  destinationLocation?: { lat: number; lng: number };
  isConnected: boolean;
  tripStatus?: string;
  driverName?: string;
  busNumber?: string;
  eta?: string;
}

// Custom icons
const createIcon = (color: string, emoji: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${emoji}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

const busIcon = createIcon('#3b82f6', '🚌');
const pickupIcon = createIcon('#10b981', '📍');
const destinationIcon = createIcon('#ef4444', '🏫');

// Map controller component
const MapController = ({
  busLocation,
  pickupLocation,
  destinationLocation,
}: {
  busLocation: BusLocation | null;
  pickupLocation?: { lat: number; lng: number };
  destinationLocation?: { lat: number; lng: number };
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const bounds = L.latLngBounds([]);

    if (busLocation) {
      bounds.extend(L.latLng(busLocation.latitude, busLocation.longitude));
    }
    if (pickupLocation) {
      bounds.extend(L.latLng(pickupLocation.lat, pickupLocation.lng));
    }
    if (destinationLocation) {
      bounds.extend(L.latLng(destinationLocation.lat, destinationLocation.lng));
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (busLocation) {
      map.setView([busLocation.latitude, busLocation.longitude], 15);
    }
  }, [map, busLocation, pickupLocation, destinationLocation]);

  return null;
};

// Animated bus marker
const AnimatedBusMarker = ({
  busLocation,
  driverName,
  busNumber,
  tripStatus,
  eta,
}: {
  busLocation: BusLocation;
  driverName?: string;
  busNumber?: string;
  tripStatus?: string;
  eta?: string;
}) => {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (markerRef.current && busLocation) {
      const currentLatLng = markerRef.current.getLatLng();
      const newLatLng = L.latLng(busLocation.latitude, busLocation.longitude);

      // Smooth animation
      const duration = 1000; // 1 second animation
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const lat = currentLatLng.lat + (newLatLng.lat - currentLatLng.lat) * progress;
        const lng = currentLatLng.lng + (newLatLng.lng - currentLatLng.lng) * progress;

        markerRef.current?.setLatLng(L.latLng(lat, lng));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();

      // Update marker rotation based on heading
      if (busLocation.heading !== undefined && markerRef.current) {
        const element = markerRef.current.getElement();
        if (element) {
          const rotation = busLocation.heading || 0;
          element.style.transform = `rotate(${rotation}deg)`;
        }
      }
    }
  }, [busLocation]);

  return (
    <Marker
      ref={markerRef}
      position={[busLocation.latitude, busLocation.longitude]}
      icon={busIcon}
    >
      <Popup>
        <div className="min-w-[200px]">
          <div className="font-bold text-lg mb-2">🚌 {busNumber || 'Bus'}</div>
          {driverName && (
            <div className="text-sm mb-1">
              <span className="font-semibold">Driver:</span> {driverName}
            </div>
          )}
          <div className="text-sm mb-1">
            <span className="font-semibold">Speed:</span> {busLocation.speed} km/h
          </div>
          {tripStatus && (
            <div className="text-sm mb-1">
              <span className="font-semibold">Status:</span> {tripStatus}
            </div>
          )}
          {eta && (
            <div className="text-sm mb-1">
              <span className="font-semibold">ETA:</span> {eta}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">
            {busLocation.latitude.toFixed(4)}, {busLocation.longitude.toFixed(4)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default function TrackingMap({
  busLocation,
  pickupLocation,
  destinationLocation,
  isConnected,
  tripStatus,
  driverName,
  busNumber,
  eta,
}: TrackingMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.5, 77.0]); // Delhi default

  useEffect(() => {
    if (busLocation) {
      setMapCenter([busLocation.latitude, busLocation.longitude]);
    }
  }, [busLocation]);

  if (!busLocation && !pickupLocation && !destinationLocation) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-gray-600">Waiting for trip information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-gray-200">
      {/* Connection Status Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow-lg">
        <span className={`inline-block w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-600' : 'bg-yellow-600'
        }`}></span>
        <span className="text-sm font-medium text-gray-700">
          {isConnected ? 'Live' : 'Connecting...'}
        </span>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={15}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Pickup location marker */}
        {pickupLocation && (
          <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
            <Popup>
              <div className="font-bold">📍 Pickup Location</div>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destinationLocation && (
          <Marker position={[destinationLocation.lat, destinationLocation.lng]} icon={destinationIcon}>
            <Popup>
              <div className="font-bold">🏫 Destination</div>
            </Popup>
          </Marker>
        )}

        {/* Route polyline */}
        {pickupLocation && destinationLocation && (
          <Polyline
            positions={[
              [pickupLocation.lat, pickupLocation.lng],
              [destinationLocation.lat, destinationLocation.lng],
            ]}
            color="#6366f1"
            weight={3}
            opacity={0.7}
            dashArray="5, 5"
          />
        )}

        {/* Bus location marker with animation */}
        {busLocation && (
          <AnimatedBusMarker
            busLocation={busLocation}
            driverName={driverName}
            busNumber={busNumber}
            tripStatus={tripStatus}
            eta={eta}
          />
        )}

        {/* Map controller for auto-centering and bounds fitting */}
        <MapController
          busLocation={busLocation}
          pickupLocation={pickupLocation}
          destinationLocation={destinationLocation}
        />
      </MapContainer>
    </div>
  );
}
