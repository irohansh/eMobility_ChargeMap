const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @route   POST api/reviews
// @desc    Create a new review for a completed session
// @access  Private
exports.createReview = async (req, res) => {
    const { bookingId, rating, comment } = req.body;

    try {
        const booking = await Booking.findById(bookingId);

        // Validations
        if (!booking) return res.status(404).json({ msg: 'Booking not found' });
        if (booking.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
        if (booking.status !== 'completed') return res.status(400).json({ msg: 'Cannot review a booking that is not completed.' });

        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) return res.status(400).json({ msg: 'Review already submitted for this booking.' });

        const newReview = new Review({
            user: req.user.id,
            station: booking.station,
            booking: bookingId,
            rating,
            comment
        });

        await newReview.save();
        res.status(201).json(newReview);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};