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

  async getStationsByBounds(north, south, east, west) {
    try {
      const centerLat = (north + south) / 2;
      const centerLon = (east + west) / 2;
      const radius = Math.max(
        Math.abs(north - south) * 111,
        Math.abs(east - west) * 111 * Math.cos(centerLat * Math.PI / 180)
      );

      return await this.getStationsByLocation(centerLat, centerLon, Math.ceil(radius));
    } catch (error) {
      console.error('Error fetching real stations by bounds:', error);
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
