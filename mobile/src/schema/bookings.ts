import { z } from "zod";

export const bookingStatusSchema = z.enum([
  "pending",
  "paid",
  "used",
  "expired",
  "cancelled",
]);

export const bookingPaymentSchema = z.object({
  orderCode: z.number(),
  amount: z.number(),
  checkoutUrl: z.url(),
  paymentLinkId: z.string().min(1),
  qrCode: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
  bin: z.string().optional(),
});

export const bookingSchema = z.object({
  _id: z.string().min(1),
  email: z.email(),
  phone: z.string().nullable().optional(),
  licensePlate: z.string().min(1),
  vehicleType: z.literal("car"),
  expectedArrivalTime: z.string().min(1),
  expectedExitTime: z.string().min(1),
  durationHours: z.number(),
  amount: z.number(),
  status: bookingStatusSchema,
  paymentId: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  sessionId: z.string().nullable().optional(),
  usedAt: z.string().nullable().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const createBookingPayloadSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email là bắt buộc.")
    .email("Vui lòng nhập địa chỉ email hợp lệ."),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)."),
  licensePlate: z.string().trim().min(1, "Biển số xe là bắt buộc."),
  expectedArrivalTime: z.string().min(1),
  expectedExitTime: z.string().min(1),
});

export const createBookingResultSchema = z.object({
  booking: bookingSchema,
  payment: bookingPaymentSchema,
});

export const myBookingsResultSchema = z.object({
  bookings: z.array(bookingSchema),
});

export const bookingLookupResultSchema = z.object({
  bookings: z.array(bookingSchema),
});

export const storedGuestBookingSchema = bookingSchema.extend({
  payment: bookingPaymentSchema.optional(),
  savedAt: z.string().min(1),
});
