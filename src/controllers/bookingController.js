const Booking = require('../models/Booking');
const Station = require('../models/Station');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

// @route   POST api/bookings
// @desc    Book a charging slot
// @access  Private
exports.createBooking = async (req, res) => {
    const { stationId, chargerId, startTime, vehicleInfo } = req.body;
    const userId = req.user.id;

    try {
        // Assume all slots are 1 hour for simplicity
        const start = new Date(startTime);
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        // 1. Check for overlapping bookings (This is the critical part)
        const existingBooking = await Booking.findOne({
            chargerId: chargerId,
            status: 'confirmed',
            $or: [
                { startTime: { $lt: end, $gte: start } },
                { endTime: { $gt: start, $lte: end } }
            ]
        });

        if (existingBooking) {
            return res.status(409).json({ msg: 'Slot is already booked for this time.' });
        }

        // 2. Create and save the new booking
        const booking = new Booking({
            user: userId,
            station: stationId,
            chargerId: chargerId,
            startTime: start,
            endTime: end,
            vehicleInfo: vehicleInfo
        });
        await booking.save();

        // 3. Trigger a mock notification
        const user = await User.findById(userId);
        NotificationService.trigger('BOOKING_CONFIRMED', {
            bookingId: booking.id,
            userEmail: user.email,
            userPhone: user.phone,
            startTime: booking.startTime
        });

        res.status(201).json(booking);
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) { // Duplicate key error from the index
            return res.status(409).json({ msg: 'Slot is already booked for this time (index conflict).' });
        }
        res.status(500).send('Server Error');
    }
};

// @route   DELETE api/bookings/:id
// @desc    Cancel a booking
// @access  Private
exports.cancelBooking = async (req, res) => {
    try {
        let booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ msg: 'Booking not found' });

        // Check if the user owns the booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Trigger mock notification
        const user = await User.findById(req.user.id);
        NotificationService.trigger('BOOKING_CANCELLED', {
            bookingId: booking.id,
            userEmail: user.email,
        });

        res.json({ msg: 'Booking cancelled successfully', booking });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @route   POST api/bookings/:id/complete
// @desc    Mark a booking as complete (for testing reviews)
// @access  Private
exports.completeBooking = async (req, res) => {
    try {
        let booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ msg: 'Booking not found' });

        if (booking.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        booking.status = 'completed';
        await booking.save();
        res.json({ msg: 'Booking marked as complete', booking });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};