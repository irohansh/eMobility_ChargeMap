// MOCK Notification Service
// In a real application, this would use Kafka, Twilio, SendGrid, etc.

class NotificationService {
    // Simulates sending an event to a message queue like Kafka
    static trigger(eventType, data) {
        console.log(`\n---  MOCK NOTIFICATION ---`);
        console.log(`Event Triggered: ${eventType}`);
        console.log(`Data:`, data);
        console.log(`-------------------------\n`);

        // Here you would call the actual service based on the event type
        switch (eventType) {
            case 'BOOKING_CONFIRMED':
                // this.sendBookingConfirmationEmail(data);
                // this.sendBookingConfirmationSMS(data);
                break;
            case 'BOOKING_CANCELLED':
                // this.sendBookingCancellationEmail(data);
                break;
            // Add more cases like REMINDER, CHARGING_COMPLETE etc.
        }
    }
}

module.exports = NotificationService;