import { z } from "zod";

// Time slots available for booking (every 30 min, 9 AM – 6 PM)
export const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

export const bookingFormSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  customerName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be under 100 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Full name can only contain letters, spaces, hyphens, and apostrophes",
    ),
  customerEmail: z
    .string()
    .email("Please enter a valid email address")
    .max(254, "Email address is too long"),
  bookingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date"),
  bookingTime: z.enum(TIME_SLOTS, {
    message: "Please select a valid time slot",
  }),
  notes: z
    .string()
    .max(500, "Notes must be under 500 characters")
    .optional()
    .or(z.literal("")),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(254, "Email address is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long")
    .optional()
    .or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long")
    .optional()
    .or(z.literal("")),
});

export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

// Server-side API schema (same structure, stricter date validation)
export const createBookingSchema = bookingFormSchema.superRefine(
  (data, ctx) => {
    const selected = new Date(`${data.bookingDate}T${data.bookingTime}:00`);
    const now = new Date();
    // Must be at least 1 hour from now
    if (selected.getTime() < now.getTime() + 60 * 60 * 1000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Booking must be at least 1 hour in the future",
        path: ["bookingDate"],
      });
    }
    // No more than 90 days out
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    if (selected > maxDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Booking cannot be more than 90 days in advance",
        path: ["bookingDate"],
      });
    }
  },
);

// Admin-only schema for creating/updating services.
export const adminServiceSchema = z.object({
  name: z
    .string()
    .min(2, "Service name must be at least 2 characters")
    .max(120, "Service name must be under 120 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be under 2000 characters"),
  price: z.coerce
    .number()
    .positive("Price must be greater than 0")
    .max(10000, "Price is too high"),
  duration: z.coerce
    .number()
    .int("Duration must be a whole number")
    .min(15, "Duration must be at least 15 minutes")
    .max(480, "Duration must be less than 8 hours"),
  imageUrl: z
    .string()
    .trim()
    .url("Image URL must be a valid URL")
    .optional()
    .or(z.literal("")),
});

export type AdminServiceValues = z.infer<typeof adminServiceSchema>;
