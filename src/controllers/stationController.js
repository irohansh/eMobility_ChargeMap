const Station = require('../models/Station');
const MapService = require('../services/mapService');
const Booking = require('../models/Booking');

exports.seedStations = async (req, res) => {
    try {
        await Station.deleteMany({});
        const stations = [
            {
                name: "Mambakkam Central Charge",
                address: "123, Vandalur-Kelambakkam Road, Mambakkam, Chennai",
                location: { type: "Point", coordinates: [80.2244, 12.8355] },
                chargers: [
                    { connectorType: "Type 2", powerKW: 22, status: "available" },
                    { connectorType: "CCS", powerKW: 50, status: "available" }
                ]
            },
            {
                name: "Kelambakkam SuperCharger",
                address: "456, IT Highway, Kelambakkam, Chennai",
                location: { type: "Point", coordinates: [80.2280, 12.8194] },
                chargers: [
                    { connectorType: "Type 2", powerKW: 22, status: "available" },
                    { connectorType: "CHAdeMO", powerKW: 45, status: "out-of-order" },
                    { connectorType: "CCS", powerKW: 100, status: "available" }
                ]
            }
        ];
        await Station.insertMany(stations);
        res.json({ msg: "Stations seeded successfully!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAllStations = async (req, res) => {
    try {
        const stations = await Station.find();
        res.json(stations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getStationById = async (req, res) => {
    try {
        const station = await Station.findById(req.params.id);
        if (!station) return res.status(404).json({ msg: 'Station not found' });
        res.json(station);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getStationRoute = async (req, res) => {
    const { origin } = req.query;
    if (!origin) return res.status(400).json({ msg: "Origin query parameter is required." });

    try {
        const station = await Station.findById(req.params.id);
        if (!station) return res.status(404).json({ msg: 'Station not found' });

        const destination = `${station.location.coordinates[1]},${station.location.coordinates[0]}`;
        const routeData = await MapService.getRoute(origin, destination);
        res.json(routeData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getRecommendations = async (req, res) => {
    const { currentLocation, carRange } = req.body;
    const { lat, lon } = currentLocation;
    const maxDistance = carRange ? carRange * 1000 : 50000;

    try {
        const stations = await Station.find({
            location: {
                $nearSphere: {
                    $geometry: { type: "Point", coordinates: [lon, lat] },
                    $maxDistance: maxDistance
                }
            },
            'chargers.status': 'available'
        }).limit(10);

        const stationsWithDetails = stations.map(station => {
            const availableCount = station.chargers.filter(c => c.status === 'available').length;
            const distance = calculateDistance(lat, lon, station.location.coordinates[1], station.location.coordinates[0]);
            
            return {
                ...station.toObject(),
                distance: distance,
                availableChargers: availableCount
            };
        });

        res.json(stationsWithDetails);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
};

exports.getAvailableSlots = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ msg: 'Date query parameter is required' });

        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const station = await Station.findById(req.params.stationId);
        if (!station) return res.status(404).json({ msg: 'Station not found' });

        const bookings = await Booking.find({
            station: req.params.stationId,
            status: 'confirmed',
            startTime: { $gte: startOfDay, $lt: endOfDay }
        });

        const slots = {};
        for (const charger of station.chargers) {
            const chargerIdStr = charger._id.toString();
            slots[chargerIdStr] = {
                powerKW: charger.powerKW,
                connectorType: charger.connectorType,
                availableTimes: []
            };

            const bookedSlots = bookings
                .filter(b => b.chargerId.toString() === chargerIdStr)
                .map(b => ({ start: b.startTime.getTime(), end: b.endTime.getTime() }));

            for (let hour = 0; hour < 24; hour++) {
                const slotStart = new Date(date);
                slotStart.setHours(hour, 0, 0, 0);
                const slotEnd = new Date(slotStart);
                slotEnd.setHours(hour + 1);

                const isBooked = bookedSlots.some(booked =>
                    (slotStart.getTime() < booked.end && slotEnd.getTime() > booked.start)
                );

                if (!isBooked) {
                    slots[chargerIdStr].availableTimes.push(slotStart.toISOString());
                }
            }
        }
        res.json(slots);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};