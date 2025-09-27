const { z } = require('zod');

// User validation schemas
const registerSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters')
        .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    email: z.string()
        .email('Invalid email format')
        .max(100, 'Email must be less than 100 characters'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password must be less than 100 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    phone: z.string()
        .min(10, 'Phone number must be at least 10 digits')
        .max(15, 'Phone number must be less than 15 digits')
        .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
});

const loginSchema = z.object({
    email: z.string()
        .email('Invalid email format'),
    password: z.string()
        .min(1, 'Password is required')
});

// Station validation schemas
const stationRecommendationSchema = z.object({
    latitude: z.number()
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90'),
    longitude: z.number()
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180'),
    radius: z.number()
        .min(1, 'Radius must be at least 1 km')
        .max(100, 'Radius must be less than 100 km')
        .optional(),
    connectorTypes: z.array(z.string())
        .optional(),
    minPowerKW: z.number()
        .min(1, 'Minimum power must be at least 1 kW')
        .optional()
});

// Booking validation schemas
const createBookingSchema = z.object({
    stationId: z.string()
        .min(1, 'Station ID is required'),
    chargerId: z.string()
        .min(1, 'Charger ID is required'),
    startTime: z.string()
        .datetime('Invalid start time format'),
    endTime: z.string()
        .datetime('Invalid end time format'),
    vehicleInfo: z.string()
        .max(200, 'Vehicle info must be less than 200 characters')
        .optional()
}).refine((data) => {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    const now = new Date();
    
    // Check if start time is in the future
    if (startTime <= now) {
        return false;
    }
    
    // Check if end time is after start time
    if (endTime <= startTime) {
        return false;
    }
    
    // Check if booking duration is reasonable (max 8 hours)
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);
    if (durationHours > 8) {
        return false;
    }
    
    return true;
}, {
    message: "Invalid booking time: start time must be in the future, end time must be after start time, and duration must be less than 8 hours"
});

// Review validation schemas
const createReviewSchema = z.object({
    stationId: z.string()
        .min(1, 'Station ID is required'),
    bookingId: z.string()
        .min(1, 'Booking ID is required'),
    rating: z.number()
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5')
        .int('Rating must be a whole number'),
    comment: z.string()
        .max(500, 'Comment must be less than 500 characters')
        .optional(),
    images: z.array(z.string().url('Invalid image URL'))
        .max(5, 'Maximum 5 images allowed')
        .optional()
});

// Validation middleware function
const validate = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.body);
            req.body = validatedData;
            next();
        } catch (error) {
            if (error.name === 'ZodError') {
                const errorMessages = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                
                return res.status(400).json({
                    msg: 'Validation failed',
                    errors: errorMessages
                });
            }
            
            return res.status(500).json({
                msg: 'Internal server error during validation'
            });
        }
    };
};

module.exports = {
    registerSchema,
    loginSchema,
    stationRecommendationSchema,
    createBookingSchema,
    createReviewSchema,
    validate
};
