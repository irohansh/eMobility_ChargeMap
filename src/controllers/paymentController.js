const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const paymentService = require('../services/paymentService');
const { sendBookingConfirmationEmail, sendPaymentConfirmationEmail } = require('../services/emailService');

exports.createPaymentIntent = async (req, res) => {
    try {
        const { bookingId } = req.body;
        
        const booking = await Booking.findById(bookingId)
            .populate('station')
            .populate('user');
        
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        if (booking.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({ msg: 'Payment already completed' });
        }

        const amount = booking.amount || calculateBookingAmount(booking);
        booking.amount = amount;
        await booking.save();

        const result = await paymentService.createPaymentIntent(booking);

        const paymentRecord = await paymentService.createPaymentRecord({
            user: req.user.id,
            booking: bookingId,
            amount: amount,
            currency: 'USD',
            paymentMethod: 'credit_card',
            status: 'pending',
            paymentIntentId: result.paymentIntentId
        });

        res.json({
            clientSecret: result.clientSecret,
            paymentIntentId: result.paymentIntentId,
            amount: amount
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        const paymentIntent = await paymentService.confirmPayment(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ 
                msg: 'Payment not completed', 
                status: paymentIntent.status 
            });
        }

        const payment = await Payment.findOne({ paymentIntentId });
        if (!payment) {
            return res.status(404).json({ msg: 'Payment record not found' });
        }

        const booking = await Booking.findById(payment.booking)
            .populate('station')
            .populate('user');

        booking.paymentStatus = 'paid';
        booking.paymentIntentId = paymentIntentId;
        await booking.save();

        payment.status = 'completed';
        payment.stripeChargeId = paymentIntent.id;
        await payment.save();

        if (booking && booking.user) {
            sendPaymentConfirmationEmail(
                booking.user.email,
                booking.user.name,
                {
                    bookingId: booking._id,
                    amount: payment.amount,
                    stationName: booking.station.name,
                    paymentDate: new Date()
                }
            ).catch(err => console.error('Failed to send payment confirmation email:', err));
        }

        res.json({
            msg: 'Payment confirmed',
            payment: payment,
            booking: booking
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

const calculateBookingAmount = (booking) => {
    const hours = Math.ceil((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60));
    const ratePerHour = 5;
    return hours * ratePerHour;
};

exports.getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user.id })
            .populate('booking')
            .sort({ createdAt: -1 });
        
        res.json(payments);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};
