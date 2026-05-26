import mongoose from 'mongoose';

const VEHICLE_TYPES = ['motorcycle', 'car'];

const floorSchema = new mongoose.Schema(
  {
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
    floorNumber: { type: Number, required: true },
    vehicleType: { type: String, enum: VEHICLE_TYPES, required: true },
    totalSlots: { type: Number, required: true, min: 1 },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Each floor number must be unique within a building
floorSchema.index({ buildingId: 1, floorNumber: 1 }, { unique: true });

export default mongoose.model('Floor', floorSchema);
