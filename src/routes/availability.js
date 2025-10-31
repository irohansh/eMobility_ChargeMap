const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');

router.get('/slots', availabilityController.getAvailableSlots);
router.get('/booked', availabilityController.getBookedSlots);

module.exports = router;
