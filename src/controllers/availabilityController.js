const Booking = require('../models/Booking');
const Station = require('../models/Station');

exports.getAvailableSlots = async (req, res) => {
    try {
        const { stationId, date } = req.query;
        
        if (!stationId || !date) {
            return res.status(400).json({ msg: 'Station ID and date are required' });
        }

        const station = await Station.findById(stationId);
        if (!station) {
            return res.status(404).json({ msg: 'Station not found' });
        }

        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const bookings = await Booking.find({
            station: stationId,
            status: 'confirmed',
            $or: [
                { startTime: { $gte: startOfDay, $lte: endOfDay } },
                { endTime: { $gte: startOfDay, $lte: endOfDay } },
                { startTime: { $lt: startOfDay }, endTime: { $gt: endOfDay } }
            ]
        }).populate('chargerId');

        const bookedSlots = bookings.map(booking => ({
            chargerId: booking.chargerId.toString(),
            startTime: booking.startTime,
            endTime: booking.endTime
        }));

        const allSlots = [];
        for (let hour = 8; hour < 20; hour++) {
            const slotStart = new Date(selectedDate);
            slotStart.setHours(hour, 0, 0, 0);
            
            const slotEnd = new Date(slotStart);
            slotEnd.setHours(hour + 1, 0, 0, 0);

            station.chargers.forEach(charger => {
                const chargerIdStr = charger._id.toString();
                const isBooked = bookedSlots.some(booked => 
                    booked.chargerId.toString() === chargerIdStr &&
                    (
                        (slotStart >= booked.startTime && slotStart < booked.endTime) ||
                        (slotEnd > booked.startTime && slotEnd <= booked.endTime) ||
                        (slotStart <= booked.startTime && slotEnd >= booked.endTime)
                    )
                );

                if (!isBooked && charger.status === 'available') {
                    allSlots.push({
                        chargerId: charger._id.toString(),
                        chargerType: charger.connectorType,
                        powerKW: charger.powerKW,
                        time: slotStart.toISOString(),
                        hour: hour,
                        displayTime: slotStart.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                        })
                    });
                }
            });
        }

        res.json({
            date: date,
            stationId: stationId,
            availableSlots: allSlots,
            totalSlots: allSlots.length
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getBookedSlots = async (req, res) => {
    try {
        const { stationId, date } = req.query;
        
        if (!stationId || !date) {
            return res.status(400).json({ msg: 'Station ID and date are required' });
        }

        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const bookings = await Booking.find({
            station: stationId,
            status: 'confirmed',
            $or: [
                { startTime: { $gte: startOfDay, $lte: endOfDay } },
                { endTime: { $gte: startOfDay, $lte: endOfDay } },
                { startTime: { $lt: startOfDay }, endTime: { $gt: endOfDay } }
            ]
        }).sort({ startTime: 1 });

        const bookedSlots = bookings.map(booking => ({
            chargerId: booking.chargerId,
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status
        }));

        res.json({
            date: date,
            stationId: stationId,
            bookedSlots: bookedSlots,
            totalBooked: bookedSlots.length
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};
