const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');

router.post('/seed', stationController.seedStations);
router.get('/', stationController.getAllStations);
router.get('/:id', stationController.getStationById);
router.get('/:id/route', stationController.getStationRoute);
router.post('/recommendations', stationController.getRecommendations);
router.get('/:stationId/slots', stationController.getAvailableSlots);

module.exports = router;