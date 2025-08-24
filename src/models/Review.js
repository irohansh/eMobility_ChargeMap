const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    images: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);