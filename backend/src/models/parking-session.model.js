import mongoose from 'mongoose';

export const SESSION_STATUSES = ['active', 'completed', 'cancelled'];
export const CUSTOMER_TYPES = ['resident', 'walk_in'];
export const PAYMENT_METHODS = ['cash', 'transfer'];
export const PAYMENT_STATUSES = ['unpaid', 'pending', 'paid'];

const parkingSessionSchema = new mongoose.Schema(
  {
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSlot', default: null }, // car sessions only
    rowId:  { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingRow',  default: null }, // motorcycle sessions only
    licensePlate: { type: String, required: true, trim: true, uppercase: true },
    vehicleType: { type: String, enum: ['motorcycle', 'car'], required: true },
    customerType: { type: String, enum: CUSTOMER_TYPES, default: 'walk_in' },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
    entryTime: { type: Date, required: true, default: Date.now },
    exitTime: { type: Date },
    fee: { type: Number, default: 0 },
    feeBreakdown: {
      durationMs: { type: Number, default: 0 },
      turns: { type: Number, default: 0 },
      hours: { type: Number, default: 0 },
      nights: { type: Number, default: 0 },
      baseFee: { type: Number, default: 0 },
      overnightFee: { type: Number, default: 0 },
      cappedAt: { type: Number, default: null },
    },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: null },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'unpaid' },
    paidAt: { type: Date, default: null },
    cashCollectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    checkOutStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: SESSION_STATUSES, default: 'active' },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

parkingSessionSchema.index({ licensePlate: 1, status: 1 });
parkingSessionSchema.index({ slotId: 1, status: 1 });
parkingSessionSchema.index({ rowId:  1, status: 1 });

export default mongoose.model('ParkingSession', parkingSessionSchema);
