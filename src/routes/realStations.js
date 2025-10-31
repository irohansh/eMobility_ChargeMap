const express = require('express');
const router = express.Router();
const realStationController = require('../controllers/realStationController');

router.get('/by-location', realStationController.getRealStations);
router.get('/by-bounds', realStationController.getRealStationsByBounds);

module.exports = router;
