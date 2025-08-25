import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
}

const Map: React.FC<MapProps> = ({ 
  center = [40.7128, -74.0060], // New York City default
  zoom = 13 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Add offline tile layer (OpenStreetMap tiles)
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    });

    tileLayer.addTo(map);

    // Add some sample polygons
    const polygon1 = L.polygon([
      [40.7128, -74.0060],
      [40.7228, -74.0060],
      [40.7228, -74.0160],
      [40.7128, -74.0160]
    ], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.3
    }).addTo(map);

    const polygon2 = L.polygon([
      [40.7028, -74.0060],
      [40.7128, -74.0060],
      [40.7128, -74.0160],
      [40.7028, -74.0160]
    ], {
      color: 'blue',
      fillColor: '#03f',
      fillOpacity: 0.3
    }).addTo(map);

    // Add markers
    const marker1 = L.marker([40.7128, -74.0060])
      .addTo(map)
      .bindPopup('New York City Center');

    const marker2 = L.marker([40.7589, -73.9851])
      .addTo(map)
      .bindPopup('Times Square');

    const marker3 = L.marker([40.7505, -73.9934])
      .addTo(map)
      .bindPopup('Penn Station');

    // Add popup info for polygons
    polygon1.bindPopup('Downtown Area');
    polygon2.bindPopup('Midtown Area');

    // Add scale control
    L.control.scale().addTo(map);

    // Add layer control
    const baseMaps = {
      "OpenStreetMap": tileLayer
    };

    const overlayMaps = {
      "Polygons": L.layerGroup([polygon1, polygon2]),
      "Markers": L.layerGroup([marker1, marker2, marker3])
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom]);

  return (
    <div className="map-container">
      <div className="status-bar">
        <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </span>
        <span className="status-text">
          {isOnline ? 'Map data will be fetched from network' : 'Map data served from cache'}
        </span>
      </div>
      <div 
        ref={mapRef} 
        style={{ 
          height: 'calc(100vh - 60px)', 
          width: '100%',
          zIndex: 1
        }} 
      />
    </div>
  );
};

export default Map;
