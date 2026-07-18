import mongoose from 'mongoose';

export const BOOKING_STATUSES = ['pending', 'paid', 'used', 'expired', 'cancelled'];

const bookingSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    licensePlate: { type: String, required: true, trim: true, uppercase: true },
    vehicleType: { type: String, enum: ['car'], default: 'car', required: true },
    expectedArrivalTime: { type: Date, required: true },
    expectedExitTime: { type: Date, required: true },
    durationHours: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 },
    feeBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: BOOKING_STATUSES, default: 'pending' },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSession', default: null },
    usedAt: { type: Date, default: null },
    // Check-in/out QR minted on payment, emailed to the customer.
    qrToken: { type: String, default: null, select: false },
  },
  { timestamps: true }
);

bookingSchema.index({ licensePlate: 1, status: 1 });
bookingSchema.index({ email: 1, status: 1 });
bookingSchema.index({ status: 1, expectedArrivalTime: 1, expectedExitTime: 1 });
bookingSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Booking', bookingSchema);
