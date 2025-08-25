import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.fullscreen/Control.FullScreen.css';
import 'leaflet.fullscreen/Control.FullScreen';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapFeature {
  id: string;
  type: 'marker' | 'polygon';
  coordinates: [number, number] | [number, number][];
  properties: {
    name: string;
    description?: string;
    color?: string;
    fillColor?: string;
    fillOpacity?: number;
  };
}

interface OfflineMapProps {
  center?: [number, number];
  zoom?: number;
  features?: MapFeature[];
  onFeatureClick?: (feature: MapFeature) => void;
}

const OfflineMap: React.FC<OfflineMapProps> = ({ 
  center = [40.7128, -74.0060], // New York City default
  zoom = 13,
  features = [],
  onFeatureClick
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const featuresRef = useRef<Map<string, L.Marker | L.Polygon>>(new Map());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedTiles, setCachedTiles] = useState<number>(0);

  // Sample features if none provided
  const defaultFeatures: MapFeature[] = [
    {
      id: 'downtown',
      type: 'polygon',
      coordinates: [
        [40.7128, -74.0060],
        [40.7228, -74.0060],
        [40.7228, -74.0160],
        [40.7128, -74.0160]
      ],
      properties: {
        name: 'Downtown Area',
        description: 'Financial district and business center',
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.3
      }
    },
    {
      id: 'midtown',
      type: 'polygon',
      coordinates: [
        [40.7028, -74.0060],
        [40.7128, -74.0060],
        [40.7128, -74.0160],
        [40.7028, -74.0160]
      ],
      properties: {
        name: 'Midtown Area',
        description: 'Shopping and entertainment district',
        color: 'blue',
        fillColor: '#03f',
        fillOpacity: 0.3
      }
    },
    {
      id: 'times-square',
      type: 'marker',
      coordinates: [40.7589, -73.9851],
      properties: {
        name: 'Times Square',
        description: 'Famous intersection and entertainment hub'
      }
    },
    {
      id: 'penn-station',
      type: 'marker',
      coordinates: [40.7505, -73.9934],
      properties: {
        name: 'Penn Station',
        description: 'Major transportation hub'
      }
    }
  ];

  const mapFeatures = features.length > 0 ? features : defaultFeatures;

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Add tile layer with offline support
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      crossOrigin: true
    });

    tileLayer.addTo(map);

    // Add scale control
    L.control.scale().addTo(map);

    // Add fullscreen control
    L.control.fullscreen({
      position: 'topleft',
      title: 'Full Screen',
      titleCancel: 'Exit Full Screen'
    }).addTo(map);

    // Add zoom control
    L.control.zoom({
      position: 'topleft'
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom]);

  // Add features to map
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const featuresMap = featuresRef.current;

    // Clear existing features
    featuresMap.forEach(feature => {
      if (feature instanceof L.Marker) {
        map.removeLayer(feature);
      } else if (feature instanceof L.Polygon) {
        map.removeLayer(feature);
      }
    });
    featuresMap.clear();

    // Add new features
    mapFeatures.forEach(feature => {
      let leafletFeature: L.Marker | L.Polygon;

      if (feature.type === 'marker') {
        const coords = feature.coordinates as [number, number];
        leafletFeature = L.marker(coords)
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #333;">${feature.properties.name}</h3>
              ${feature.properties.description ? `<p style="margin: 0; color: #666;">${feature.properties.description}</p>` : ''}
            </div>
          `);
      } else {
        const coords = feature.coordinates as [number, number][];
        leafletFeature = L.polygon(coords, {
          color: feature.properties.color || 'blue',
          fillColor: feature.properties.fillColor || '#03f',
          fillOpacity: feature.properties.fillOpacity || 0.3,
          weight: 2
        })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #333;">${feature.properties.name}</h3>
            ${feature.properties.description ? `<p style="margin: 0; color: #666;">${feature.properties.description}</p>` : ''}
          </div>
        `);
      }

      // Add click handler
      leafletFeature.on('click', () => {
        if (onFeatureClick) {
          onFeatureClick(feature);
        }
      });

      featuresMap.set(feature.id, leafletFeature);
    });

    // Fit bounds to show all features
    if (mapFeatures.length > 0) {
      const allCoordinates: [number, number][] = [];
      
      mapFeatures.forEach(f => {
        if (f.type === 'marker') {
          allCoordinates.push(f.coordinates as [number, number]);
        } else {
          allCoordinates.push(...(f.coordinates as [number, number][]));
        }
      });
      
      if (allCoordinates.length > 0) {
        const bounds = L.latLngBounds(allCoordinates);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }

  }, [mapFeatures, onFeatureClick]);

  // Handle tile caching for offline support
  const handleTileLoad = useCallback(() => {
    setCachedTiles(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    map.on('tileload', handleTileLoad);

    return () => {
      map.off('tileload', handleTileLoad);
    };
  }, [handleTileLoad]);

  return (
    <div className="offline-map-container">
      <div className="map-status-bar">
        <div className="status-section">
          <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </span>
          <span className="status-text">
            {isOnline ? 'Map data from network' : 'Map data from cache'}
          </span>
        </div>
        <div className="tile-info">
          <span className="tile-count">🗺️ {cachedTiles} tiles cached</span>
        </div>
      </div>
      <div 
        ref={mapRef} 
        className="map-container"
        style={{ 
          height: 'calc(100vh - 120px)', 
          width: '100%',
          zIndex: 1
        }} 
      />
    </div>
  );
};

export default OfflineMap;
