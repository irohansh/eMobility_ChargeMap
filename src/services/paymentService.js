const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');

const createPaymentIntent = async (booking) => {
    try {
        const amount = Math.round(booking.amount * 100);
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            metadata: {
                bookingId: booking._id.toString(),
                userId: booking.user.toString(),
                stationId: booking.station._id.toString()
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
};

const confirmPayment = async (paymentIntentId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent;
    } catch (error) {
        console.error('Error confirming payment:', error);
        throw error;
    }
};

const createPaymentRecord = async (paymentData) => {
    try {
        const payment = new Payment(paymentData);
        await payment.save();
        return payment;
    } catch (error) {
        console.error('Error creating payment record:', error);
        throw error;
    }
};

const updatePaymentStatus = async (paymentId, status) => {
    try {
        const payment = await Payment.findByIdAndUpdate(
            paymentId,
            { status },
            { new: true }
        );
        return payment;
    } catch (error) {
        console.error('Error updating payment status:', error);
        throw error;
    }
};

module.exports = {
    createPaymentIntent,
    confirmPayment,
    createPaymentRecord,
    updatePaymentStatus
};
