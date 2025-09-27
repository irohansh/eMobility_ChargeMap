const Booking = require('../models/Booking');
const User = require('../models/User');

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

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        
        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { 
                name: name || req.user.name,
                email: email || req.user.email,
                phone: phone || req.user.phone
            },
            { new: true, select: '-password' }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};