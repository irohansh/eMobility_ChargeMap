const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/authMiddleware');

router.post('/create-intent', auth, paymentController.createPaymentIntent);
router.post('/confirm', auth, paymentController.confirmPayment);
router.get('/history', auth, paymentController.getPaymentHistory);

module.exports = router;
