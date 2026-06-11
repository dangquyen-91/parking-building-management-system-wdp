import mongoose from 'mongoose';

const lprLogSchema = new mongoose.Schema(
  {
    licensePlate: {
      type: String,
      default: null,
      uppercase: true,
    },
    confidence: {
      type: Number,
      default: 0,
    },
    bbox: {
      type: [Number],
      default: null,
    },
    processingTimeMs: {
      type: Number,
      default: 0,
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activeSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSession',
      default: null,
    },
    activeSubscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
    paidBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  { timestamps: true }
);

lprLogSchema.index({ detectedAt: -1 });
lprLogSchema.index({ licensePlate: 1 });

export default mongoose.model('LprLog', lprLogSchema);
