const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    chargerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    vehicleInfo: { type: String, default: 'N/A' },
    status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
}, { timestamps: true });

BookingSchema.index({ chargerId: 1, startTime: 1, status: 1 }, {
  unique: true,
  partialFilterExpression: { status: 'confirmed' }
});

module.exports = mongoose.model('Booking', BookingSchema);