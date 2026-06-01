import mongoose from 'mongoose';

export const SUBSCRIPTION_STATUSES = ['pending', 'active', 'expired', 'cancelled'];

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    licensePlate: { type: String, required: true, trim: true, uppercase: true },
    vehicleType: { type: String, enum: ['motorcycle', 'car'], required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSlot', default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    status: { type: String, enum: SUBSCRIPTION_STATUSES, default: 'pending' },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

subscriptionSchema.index({ licensePlate: 1, status: 1 });
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index(
  { licensePlate: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);
subscriptionSchema.index(
  { slotId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'active'] }, slotId: { $type: 'objectId' } } }
);

export default mongoose.model('Subscription', subscriptionSchema);
