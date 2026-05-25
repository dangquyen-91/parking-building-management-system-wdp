import mongoose from 'mongoose';

export const SESSION_STATUSES = ['active', 'completed', 'cancelled'];

const parkingSessionSchema = new mongoose.Schema(
  {
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSlot', default: null }, // car sessions only
    rowId:  { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingRow',  default: null }, // motorcycle sessions only
    licensePlate: { type: String, required: true, trim: true, uppercase: true },
    vehicleType: { type: String, enum: ['motorcycle', 'car'], required: true },
    entryTime: { type: Date, required: true, default: Date.now },
    exitTime: { type: Date },
    fee: { type: Number, default: 0 },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
