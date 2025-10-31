const realStationService = require('../services/realStationService');

exports.getRealStations = async (req, res) => {
  try {
    const { lat, lon, radius = 50 } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        msg: 'Latitude and longitude are required as query parameters' 
      });
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const radiusNum = parseInt(radius) || 50;

    if (isNaN(latNum) || isNaN(lonNum)) {
      return res.status(400).json({ 
        msg: 'Invalid latitude or longitude values' 
      });
    }

    const stations = await realStationService.getStationsByLocation(
      latNum, 
      lonNum, 
      radiusNum
    );

    if (!Array.isArray(stations)) {
      return res.json([]);
    }

    res.json(stations);
  } catch (error) {
    console.error('Error fetching real stations:', error.message);
    
    if (error.message && error.message.includes('API key')) {
      return res.status(500).json([]);
    }
    
    res.json([]);
  }
};

exports.getRealStationsByBounds = async (req, res) => {
  try {
    const { north, south, east, west } = req.query;
    
    if (!north || !south || !east || !west) {
      return res.status(400).json([]);
    }

    const stations = await realStationService.getStationsByBounds(
      parseFloat(north),
      parseFloat(south),
      parseFloat(east),
      parseFloat(west)
    );

    if (!Array.isArray(stations)) {
      return res.json([]);
    }

    res.json(stations);
  } catch (error) {
    console.error('Error fetching real stations by bounds:', error.message);
    res.json([]);
  }
};
