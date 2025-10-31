# Real EV Charging Station Feed Integration

## Overview
Integrate real EV charging station data from multiple sources to provide comprehensive, up-to-date station information on your maps.

## Available Data Sources

### 1. **Open Charge Map API** (Free)
- **URL:** `https://api.openchargemap.io/v3/poi/`
- **Coverage:** Global, 400,000+ stations
- **Rate Limit:** 1,000 requests/day (free)
- **Data:** Real-time availability, pricing, connector types

### 2. **PlugShare API** (Paid)
- **URL:** `https://api.plugshare.com/v3/`
- **Coverage:** Global, user-generated data
- **Rate Limit:** Based on subscription
- **Data:** User reviews, photos, real-time status

### 3. **ChargePoint API** (Paid)
- **URL:** `https://webservices.chargepoint.com/cp_api/`
- **Coverage:** ChargePoint network stations
- **Rate Limit:** Based on partnership
- **Data:** Real-time availability, pricing

### 4. **Tesla Supercharger API** (Free)
- **URL:** `https://www.tesla.com/findus/list/superchargers`
- **Coverage:** Tesla Supercharger network
- **Rate Limit:** No official limit
- **Data:** Location, connector types, amenities

## Implementation Plan

### Phase 1: Open Charge Map Integration (Recommended Start)

#### Backend Service
```javascript
// src/services/realStationService.js
const axios = require('axios');

class RealStationService {
  constructor() {
    this.openChargeMapAPI = 'https://api.openchargemap.io/v3/poi/';
    this.apiKey = process.env.OPEN_CHARGE_MAP_API_KEY;
  }

  async getStationsByLocation(lat, lon, radius = 50) {
    try {
      const response = await axios.get(this.openChargeMapAPI, {
        params: {
          key: this.apiKey,
          latitude: lat,
          longitude: lon,
          distance: radius,
          distanceunit: 'km',
          maxresults: 100,
          includecomments: true,
          compact: true,
          verbose: false
        }
      });
      
      return this.transformOpenChargeMapData(response.data);
    } catch (error) {
      console.error('Error fetching real stations:', error);
      throw error;
    }
  }

  transformOpenChargeMapData(stations) {
    return stations.map(station => ({
      _id: `ocm_${station.ID}`,
      name: station.AddressInfo?.Title || 'Unknown Station',
      address: station.AddressInfo?.AddressLine1 || 'Address not available',
      location: {
        type: 'Point',
        coordinates: [station.AddressInfo.Longitude, station.AddressInfo.Latitude]
      },
      chargers: this.extractConnectors(station.Connections),
      realTimeData: {
        source: 'OpenChargeMap',
        lastUpdated: station.DateLastStatusUpdate,
        status: station.StatusType?.IsOperational ? 'available' : 'out-of-order',
        pricing: station.UsageCost,
        amenities: station.GeneralComments
      }
    }));
  }

  extractConnectors(connections) {
    if (!connections) return [];
    
    return connections.map(conn => ({
      _id: `conn_${conn.ID}`,
      connectorType: this.mapConnectorType(conn.ConnectionType?.Title),
      powerKW: conn.PowerKW || 0,
      status: conn.StatusType?.IsOperational ? 'available' : 'out-of-order',
      amperage: conn.Amps,
      voltage: conn.Voltage
    }));
  }

  mapConnectorType(ocmType) {
    const typeMap = {
      'Type 2 (Socket Only)': 'Type 2',
      'Type 2 (Tethered)': 'Type 2',
      'CHAdeMO': 'CHAdeMO',
      'CCS (Type 2)': 'CCS',
      'Tesla Supercharger': 'Tesla',
      'Tesla Destination': 'Tesla'
    };
    return typeMap[ocmType] || 'Type 2';
  }
}

module.exports = new RealStationService();
```

#### Backend Controller
```javascript
// src/controllers/realStationController.js
const realStationService = require('../services/realStationService');

exports.getRealStations = async (req, res) => {
  try {
    const { lat, lon, radius = 50 } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        msg: 'Latitude and longitude are required' 
      });
    }

    const stations = await realStationService.getStationsByLocation(
      parseFloat(lat), 
      parseFloat(lon), 
      parseInt(radius)
    );

    res.json(stations);
  } catch (error) {
    console.error('Error fetching real stations:', error);
    res.status(500).json({ msg: 'Failed to fetch real stations' });
  }
};

exports.getRealStationsByBounds = async (req, res) => {
  try {
    const { north, south, east, west } = req.query;
    
    if (!north || !south || !east || !west) {
      return res.status(400).json({ 
        msg: 'Bounding box coordinates are required' 
      });
    }

    // Calculate center point
    const centerLat = (parseFloat(north) + parseFloat(south)) / 2;
    const centerLon = (parseFloat(east) + parseFloat(west)) / 2;
    
    // Calculate radius based on bounding box
    const radius = Math.max(
      Math.abs(parseFloat(north) - parseFloat(south)) * 111, // km per degree
      Math.abs(parseFloat(east) - parseFloat(west)) * 111 * Math.cos(centerLat * Math.PI / 180)
    );

    const stations = await realStationService.getStationsByLocation(
      centerLat, 
      centerLon, 
      Math.ceil(radius)
    );

    res.json(stations);
  } catch (error) {
    console.error('Error fetching real stations by bounds:', error);
    res.status(500).json({ msg: 'Failed to fetch real stations' });
  }
};
```

#### Backend Routes
```javascript
// src/routes/realStations.js
const express = require('express');
const router = express.Router();
const realStationController = require('../controllers/realStationController');

router.get('/by-location', realStationController.getRealStations);
router.get('/by-bounds', realStationController.getRealStationsByBounds);

module.exports = router;
```

### Phase 2: Frontend Integration

#### API Client Extension
```typescript
// frontend/src/services/api.ts
export interface RealStation extends Station {
  realTimeData?: {
    source: string;
    lastUpdated: string;
    status: string;
    pricing?: string;
    amenities?: string;
  };
}

export class ApiClient {
  // ... existing methods ...

  async getRealStations(lat: number, lon: number, radius: number = 50): Promise<RealStation[]> {
    return this.request<RealStation[]>(`/real-stations/by-location?lat=${lat}&lon=${lon}&radius=${radius}`);
  }

  async getRealStationsByBounds(north: number, south: number, east: number, west: number): Promise<RealStation[]> {
    return this.request<RealStation[]>(`/real-stations/by-bounds?north=${north}&south=${south}&east=${east}&west=${west}`);
  }
}
```

#### Enhanced Map Component
```typescript
// frontend/src/components/RealStationMap.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, MapPin, Clock, DollarSign, Wifi, Coffee } from 'lucide-react';
import { apiClient, RealStation } from '@/services/api';

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
        // Load stations within map bounds
        stations = await apiClient.getRealStationsByBounds(
          bounds.getNorth(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getWest()
        );
      } else if (userLocation) {
        // Load stations around user location
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
    // Debounce the API call
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

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border border-border relative">
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
            icon={L.divIcon({
              html: `
                <div class="station-marker">
                  <div class="marker-icon ${getStatusColor(station.realTimeData?.status || 'available')}">
                    ${getConnectorIcon(station.chargers[0]?.connectorType || 'Type 2')}
                  </div>
                </div>
              `,
              className: 'custom-marker',
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })}
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
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Loading stations...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealStationMap;
```

### Phase 3: Environment Configuration

#### Environment Variables
```env
# .env
# Open Charge Map API
OPEN_CHARGE_MAP_API_KEY=your_open_charge_map_api_key_here

# PlugShare API (if using)
PLUGSHARE_API_KEY=your_plugshare_api_key_here

# ChargePoint API (if using)
CHARGEPOINT_API_KEY=your_chargepoint_api_key_here
```

#### API Key Setup
1. **Open Charge Map:** Register at https://openchargemap.org/site/register
2. **Get API Key:** Go to https://openchargemap.org/site/develop/api
3. **Rate Limits:** Free tier allows 1,000 requests/day

### Phase 4: Advanced Features

#### Real-time Updates
```javascript
// src/services/realTimeService.js
const WebSocket = require('ws');

class RealTimeService {
  constructor() {
    this.clients = new Set();
    this.updateInterval = 300000; // 5 minutes
  }

  startRealTimeUpdates() {
    setInterval(async () => {
      // Update station statuses
      const updatedStations = await this.fetchUpdatedStations();
      
      // Broadcast to connected clients
      this.broadcastUpdate(updatedStations);
    }, this.updateInterval);
  }

  broadcastUpdate(stations) {
    const message = JSON.stringify({
      type: 'station_update',
      data: stations
    });
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
```

#### Caching Layer
```javascript
// src/services/cacheService.js
const NodeCache = require('node-cache');

class CacheService {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 minutes
  }

  async getCachedStations(key) {
    const cached = this.cache.get(key);
    if (cached) return cached;
    
    const stations = await this.fetchStations(key);
    this.cache.set(key, stations);
    return stations;
  }
}
```

## Benefits of Real Station Feeds

### ✅ **Comprehensive Coverage**
- 400,000+ stations globally
- Multiple networks and operators
- Real-time availability data

### ✅ **Accurate Information**
- Live status updates
- Current pricing information
- Connector type details

### ✅ **Enhanced User Experience**
- More station options
- Real-time availability
- Better decision making

### ✅ **Scalable Architecture**
- Caching for performance
- Rate limit management
- Fallback to local data

## Implementation Steps

1. **Get API Key:** Register for Open Charge Map API
2. **Backend Setup:** Add real station service and routes
3. **Frontend Integration:** Update map components
4. **Testing:** Verify data accuracy and performance
5. **Caching:** Implement caching for better performance
6. **Real-time Updates:** Add WebSocket for live updates

## Cost Considerations

- **Open Charge Map:** Free (1,000 requests/day)
- **PlugShare:** Paid (varies by plan)
- **ChargePoint:** Partnership required
- **Tesla:** Free (unofficial API)

## Next Steps

1. Start with Open Charge Map (free, comprehensive)
2. Add caching layer for performance
3. Implement real-time updates
4. Consider paid APIs for enhanced data
5. Add user reviews and ratings

This implementation will give you access to real, up-to-date EV charging station data from multiple sources, significantly enhancing your application's value and user experience!
