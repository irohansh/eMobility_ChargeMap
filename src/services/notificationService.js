class NotificationService {
    static trigger(eventType, data) {
        console.log(`\n---  MOCK NOTIFICATION ---`);
        console.log(`Event Triggered: ${eventType}`);
        console.log(`Data:`, data);
        console.log(`-------------------------\n`);

        switch (eventType) {
            case 'BOOKING_CONFIRMED':
                break;
            case 'BOOKING_CANCELLED':
                break;
        }
    }
}

module.exports = NotificationService;