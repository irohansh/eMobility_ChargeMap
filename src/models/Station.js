const mongoose = require('mongoose');

// GeoJSON Schema for location data
const PointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], required: true },
  coordinates: { type: [Number], required: true } // Format: [longitude, latitude]
});

const StationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    location: { type: PointSchema, required: true, index: '2dsphere' },
    chargers: [{
        connectorType: { type: String, enum: ['Type 2', 'CCS', 'CHAdeMO'], required: true },
        powerKW: { type: Number, required: true },
        // This status is a general indicator, real-time availability is checked via bookings
        status: { type: String, enum: ['available', 'occupied', 'out-of-order'], default: 'available' }
    }]
});

module.exports = mongoose.model('Station', StationSchema);