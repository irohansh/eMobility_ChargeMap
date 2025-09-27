import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Station } from '@/services/api';

interface GoogleMapProps {
  stations: Station[];
  onStationSelect: (station: Station) => void;
  selectedStation?: Station | null;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  stations, 
  onStationSelect, 
  selectedStation 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || apiKey === 'your-google-maps-api-key-here') {
      setError('Google Maps API key not configured');
      setIsLoading(false);
      return;
    }

    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const { Map } = await loader.importLibrary('maps');
        const { Marker } = await loader.importLibrary('marker');

        if (mapRef.current) {
          const mapInstance = new Map(mapRef.current, {
            center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
            zoom: 12,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
          });

          setMap(mapInstance);

          // Add markers for stations
          const stationMarkers: google.maps.Marker[] = [];
          
          stations.forEach((station) => {
            const position = {
              lat: station.location.coordinates[1],
              lng: station.location.coordinates[0]
            };

            const marker = new Marker({
              position,
              map: mapInstance,
              title: station.name,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
                    <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">E</text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 16)
              }
            });

            // Add click listener
            marker.addListener('click', () => {
              onStationSelect(station);
              
              // Center map on selected station
              mapInstance.setCenter(position);
              mapInstance.setZoom(15);
            });

            stationMarkers.push(marker);
          });

          setMarkers(stationMarkers);

          // Center map on stations if available
          if (stations.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            stations.forEach(station => {
              bounds.extend({
                lat: station.location.coordinates[1],
                lng: station.location.coordinates[0]
              });
            });
            mapInstance.fitBounds(bounds);
          }
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps');
      } finally {
        setIsLoading(false);
      }
    };

    initMap();
  }, [apiKey]);

  // Update markers when stations change
  useEffect(() => {
    if (!map || !stations.length) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const { Marker } = google.maps;
    const newMarkers: google.maps.Marker[] = [];

    stations.forEach((station) => {
      const position = {
        lat: station.location.coordinates[1],
        lng: station.location.coordinates[0]
      };

      const marker = new Marker({
        position,
        map,
        title: station.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">E</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        }
      });

      marker.addListener('click', () => {
        onStationSelect(station);
        map.setCenter(position);
        map.setZoom(15);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Fit bounds to show all stations
    const bounds = new google.maps.LatLngBounds();
    stations.forEach(station => {
      bounds.extend({
        lat: station.location.coordinates[1],
        lng: station.location.coordinates[0]
      });
    });
    map.fitBounds(bounds);
  }, [stations, map]);

  // Highlight selected station
  useEffect(() => {
    if (!map || !selectedStation) return;

    const position = {
      lat: selectedStation.location.coordinates[1],
      lng: selectedStation.location.coordinates[0]
    };

    map.setCenter(position);
    map.setZoom(15);
  }, [selectedStation, map]);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Map Unavailable</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Please configure your Google Maps API key in the environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default GoogleMap;

