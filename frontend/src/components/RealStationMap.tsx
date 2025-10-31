import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, MapPin, Clock, DollarSign, Coffee, Loader2 } from 'lucide-react';
import { apiClient, RealStation } from '@/services/api';
import L from 'leaflet';

interface RealStationMapProps {
  userLocation: { lat: number; lon: number } | null;
  onStationSelect: (station: RealStation) => void;
}

const RealStationMap: React.FC<RealStationMapProps> = ({ userLocation, onStationSelect }) => {
  const [realStations, setRealStations] = useState<RealStation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapBounds, setMapBounds] = useState<any>(null);

  const loadRealStations = async (bounds?: any) => {
    if (!userLocation && !bounds) return;

    setIsLoading(true);
    try {
      let stations: RealStation[];
      
      if (bounds) {
        stations = await apiClient.getRealStationsByBounds(
          bounds.getNorth(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getWest()
        );
      } else if (userLocation) {
        stations = await apiClient.getRealStations(
          userLocation.lat,
          userLocation.lon,
          50
        );
      } else {
        stations = [];
      }
      
      setRealStations(stations);
    } catch (error) {
      console.error('Error loading real stations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      loadRealStations();
    }
  }, [userLocation]);

  const handleMapMove = (bounds: any) => {
    setMapBounds(bounds);
    setTimeout(() => {
      loadRealStations(bounds);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-yellow-500';
      case 'out-of-order': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConnectorIcon = (type: string) => {
    switch (type) {
      case 'Tesla': return '⚡';
      case 'CCS': return '🔌';
      case 'CHAdeMO': return '🔋';
      default: return '⚡';
    }
  };

  const createStationIcon = (station: RealStation) => {
    const statusColor = getStatusColor(station.realTimeData?.status || 'available');
    const connectorIcon = getConnectorIcon(station.chargers[0]?.connectorType || 'Type 2');
    
    return L.divIcon({
      html: `
        <div class="station-marker">
          <div class="marker-icon ${statusColor}">
            ${connectorIcon}
          </div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={userLocation ? [userLocation.lat, userLocation.lon] : [12.8355, 80.2244]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(map) => {
          map.on('moveend', () => {
            const bounds = map.getBounds();
            handleMapMove(bounds);
          });
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {realStations.map((station) => (
          <Marker
            key={station._id}
            position={[station.location.coordinates[1], station.location.coordinates[0]]}
            icon={createStationIcon(station)}
          >
            <Popup>
              <div className="min-w-[250px]">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">{station.name}</h3>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getStatusColor(station.realTimeData?.status || 'available')}`}
                  >
                    {station.realTimeData?.status || 'available'}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">{station.address}</p>
                
                <div className="space-y-1 mb-3">
                  {station.chargers.map((charger, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span>{charger.connectorType} - {charger.powerKW}kW</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(charger.status)}`}
                      >
                        {charger.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                {station.realTimeData?.pricing && (
                  <div className="flex items-center gap-1 mb-2">
                    <DollarSign className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">{station.realTimeData.pricing}</span>
                  </div>
                )}

                {station.realTimeData?.amenities && (
                  <div className="flex items-center gap-1 mb-2">
                    <Coffee className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-600">Amenities available</span>
                  </div>
                )}

                <div className="flex items-center gap-1 mb-3">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Updated: {new Date(station.realTimeData?.lastUpdated || '').toLocaleDateString()}
                  </span>
                </div>

                <Button
                  size="sm"
                  className="w-full shadow-electric"
                  onClick={() => onStationSelect(station)}
                >
                  Book Now
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {isLoading && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-xs">Loading stations...</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .station-marker {
          position: relative;
        }
        
        .marker-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .custom-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default RealStationMap;
