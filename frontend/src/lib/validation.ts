import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
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

export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format'),
  password: z.string()
    .min(1, 'Password is required')
});

// Booking validation schemas
export const createBookingSchema = z.object({
  stationId: z.string()
    .min(1, 'Station ID is required'),
  chargerId: z.string()
    .min(1, 'Charger ID is required'),
  startTime: z.string()
    .min(1, 'Start time is required'),
  endTime: z.string()
    .min(1, 'End time is required'),
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
  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  if (durationHours > 8) {
    return false;
  }
  
  return true;
}, {
  message: "Invalid booking time: start time must be in the future, end time must be after start time, and duration must be less than 8 hours"
});

// Review validation schemas
export const createReviewSchema = z.object({
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

// Type exports
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type CreateBookingFormData = z.infer<typeof createBookingSchema>;
export type CreateReviewFormData = z.infer<typeof createReviewSchema>;

