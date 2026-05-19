import mongoose from 'mongoose';

export const SESSION_STATUSES = ['active', 'completed', 'cancelled'];

const parkingSessionSchema = new mongoose.Schema(
  {
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSlot', required: true },
    licensePlate: { type: String, required: true, trim: true, uppercase: true },
    vehicleType: { type: String, enum: ['motorcycle', 'car'], required: true },
    entryTime: { type: Date, required: true, default: Date.now },
    exitTime: { type: Date },
    fee: { type: Number, default: 0 },
    // staffId: staff who processed check-in/check-out
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // userId: linked resident account (null for walk-in guests)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: SESSION_STATUSES, default: 'active' },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

// Quick lookup by license plate for active sessions
parkingSessionSchema.index({ licensePlate: 1, status: 1 });
parkingSessionSchema.index({ slotId: 1, status: 1 });

export default mongoose.model('ParkingSession', parkingSessionSchema);
