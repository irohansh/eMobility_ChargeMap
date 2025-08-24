const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, bookingController.createBooking);
router.delete('/:id', auth, bookingController.cancelBooking);
router.post('/:id/complete', auth, bookingController.completeBooking);

module.exports = router;