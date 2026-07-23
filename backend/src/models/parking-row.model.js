import mongoose from 'mongoose';

export const ROW_STATUSES = ['available', 'full', 'maintenance'];

const parkingRowSchema = new mongoose.Schema(
  {
    floorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true },
    rowCode: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    occupiedCount: { type: Number, default: 0 },
    status: { type: String, enum: ROW_STATUSES, default: 'available' },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

parkingRowSchema.index({ floorId: 1, rowCode: 1 }, { unique: true });
parkingRowSchema.index({ floorId: 1, status: 1 });

export default mongoose.model('ParkingRow', parkingRowSchema);
