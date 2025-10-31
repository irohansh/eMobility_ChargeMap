import React, { useEffect, useState, useRef } from 'react';
import { Station } from '@/services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OpenStreetMapProps {
  stations: Station[];
  onStationSelect: (station: Station) => void;
  selectedStation?: Station | null;
  userLocation?: { lat: number; lon: number } | null;
  onNearbyStationsLoad?: (stations: Station[]) => void;
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({ 
  stations, 
  onStationSelect, 
  selectedStation,
  userLocation,
  onNearbyStationsLoad
}) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);

  const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const userIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#3498db" stroke="white" stroke-width="3"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const stationIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#10b981" stroke="white" stroke-width="3"/>
        <text x="16" y="22" text-anchor="middle" fill="white" font-size="14" font-weight="bold">E</text>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const calculateNearbyStations = (userLat: number, userLon: number, allStations: Station[], radius: number = 50) => {
    const nearby: Station[] = [];
    
    allStations.forEach(station => {
      const distance = calculateDistance(
        userLat,
        userLon,
        station.location.coordinates[1],
        station.location.coordinates[0]
      );
      
      if (distance <= radius) {
        nearby.push({ ...station, distance });
      }
    });
    
    return nearby.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  useEffect(() => {
    if (userLocation && stations.length > 0) {
      const nearby = calculateNearbyStations(
        userLocation.lat,
        userLocation.lon,
        stations,
        50
      );
      setNearbyStations(nearby);
      if (onNearbyStationsLoad) {
        onNearbyStationsLoad(nearby);
      }
    }
  }, [userLocation, stations, onNearbyStationsLoad]);

  const getCenter = () => {
    if (userLocation) {
      return [userLocation.lat, userLocation.lon] as [number, number];
    }
    if (stations.length > 0) {
      const station = stations[0];
      return [station.location.coordinates[1], station.location.coordinates[0]] as [number, number];
    }
    return [12.8355, 80.2244] as [number, number];
  };

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border border-border relative">
      <MapContainer
        center={getCenter()}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && (
          <>
            <Marker
              position={[userLocation.lat, userLocation.lon]}
              icon={userIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>Your Location</strong>
                  <p className="text-xs text-muted-foreground mt-1">
                    {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[userLocation.lat, userLocation.lon]}
              radius={50000}
              pathOptions={{
                fillColor: 'blue',
                fillOpacity: 0.1,
                color: 'blue',
                weight: 2,
                opacity: 0.3
              }}
            />
          </>
        )}

        {stations.map((station) => {
          const isNearby = nearbyStations.some(s => s._id === station._id);
          const isSelected = selectedStation?._id === station._id;
          
          return (
            <Marker
              key={station._id}
              position={[station.location.coordinates[1], station.location.coordinates[0]]}
              icon={stationIcon}
              eventHandlers={{
                click: () => {
                  onStationSelect(station);
                }
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">{station.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{station.address}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {station.location.coordinates[1].toFixed(4)}°N, {station.location.coordinates[0].toFixed(4)}°E
                    </span>
                  </div>
                  <div className="mb-2">
                    <p className="text-xs font-medium text-green-600">
                      {station.chargers.filter(c => c.status === 'available').length} available chargers
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full shadow-electric"
                    onClick={() => onStationSelect(station)}
                  >
                    Book Now
                  </Button>
                  {isNearby && userLocation && (
                    <p className="text-xs text-blue-600 mt-1">
                      {(station as any).distance}km away
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {userLocation && nearbyStations.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Nearby Stations ({nearbyStations.length})
          </h4>
          <div className="space-y-2">
            {nearbyStations.slice(0, 5).map(station => (
              <div
                key={station._id}
                className="text-xs cursor-pointer hover:bg-muted p-2 rounded transition-colors"
                onClick={() => onStationSelect(station)}
              >
                <p className="font-medium">{station.name}</p>
                <p className="text-muted-foreground">{(station as any).distance}km away</p>
                <p className="text-green-600">
                  {station.chargers.filter(c => c.status === 'available').length} available
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenStreetMap;
