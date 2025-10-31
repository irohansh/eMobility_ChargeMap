const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    booking: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Booking', 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    currency: { 
        type: String, 
        default: 'USD' 
    },
    paymentMethod: { 
        type: String, 
        enum: ['credit_card', 'debit_card', 'wallet'],
        required: true 
    },
    paymentIntentId: { 
        type: String 
    },
    status: { 
        type: String, 
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending' 
    },
    stripeChargeId: { 
        type: String 
    },
    cardLast4: { 
        type: String 
    },
    cardBrand: { 
        type: String 
    },
    paymentDate: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
