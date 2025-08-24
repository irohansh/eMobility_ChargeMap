const Booking = require('../models/Booking');

// @route   GET api/users/me/bookings
// @desc    Get current user's upcoming bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
                user: req.user.id,
                status: 'confirmed',
                startTime: { $gte: new Date() }
            })
            .populate('station', ['name', 'address'])
            .sort({ startTime: 1 });

        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};