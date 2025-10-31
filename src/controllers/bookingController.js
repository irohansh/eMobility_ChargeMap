const Booking = require('../models/Booking');
const Station = require('../models/Station');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');
const { sendBookingConfirmationEmail } = require('../services/emailService');

exports.createBooking = async (req, res) => {
    const { stationId, chargerId, startTime, endTime, vehicleInfo } = req.body;
    const userId = req.user.id;

    try {
        const start = new Date(startTime);
        const end = endTime ? new Date(endTime) : new Date(start.getTime() + 60 * 60 * 1000);

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

        const durationHours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
        const ratePerHour = 5;
        const amount = durationHours * ratePerHour;

        const booking = new Booking({
            user: userId,
            station: stationId,
            chargerId: chargerId,
            startTime: start,
            endTime: end,
            vehicleInfo: vehicleInfo,
            amount: amount
        });
        await booking.save();

        const station = await Station.findById(stationId);
        const user = await User.findById(userId);
        
        if (station && user) {
            sendBookingConfirmationEmail(user.email, user.name, {
                stationName: station.name,
                address: station.address,
                startTime: booking.startTime,
                endTime: booking.endTime,
                vehicleInfo: booking.vehicleInfo
            }).catch(err => {
                console.error('Failed to send booking confirmation email:', err);
            });
        }

        NotificationService.trigger('BOOKING_CONFIRMED', {
            bookingId: booking.id,
            userEmail: user.email,
            userPhone: user.phone,
            startTime: booking.startTime
        });

        res.status(201).json(booking);
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
            return res.status(409).json({ msg: 'Slot is already booked for this time (index conflict).' });
        }
        res.status(500).send('Server Error');
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        let booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ msg: 'Booking not found' });

        if (booking.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        booking.status = 'cancelled';
        await booking.save();

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