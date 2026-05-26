import mongoose from 'mongoose';

export const SLOT_STATUSES = ['empty', 'occupied', 'reserved', 'maintenance'];

const parkingSlotSchema = new mongoose.Schema(
  {
    floorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true },
    slotCode: { type: String, required: true, trim: true },
    vehicleType: { type: String, enum: ['motorcycle', 'car'], required: true },
    status: { type: String, enum: SLOT_STATUSES, default: 'empty' },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

// Slot code unique within a floor
parkingSlotSchema.index({ floorId: 1, slotCode: 1 }, { unique: true });

export default mongoose.model('ParkingSlot', parkingSlotSchema);
