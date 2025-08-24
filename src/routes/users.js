const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/me/bookings', auth, userController.getMyBookings);

module.exports = router;