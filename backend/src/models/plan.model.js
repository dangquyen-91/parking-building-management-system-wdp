import mongoose from 'mongoose';

export const PLAN_CODES = ['MOTO_MONTHLY', 'MOTO_QUARTERLY', 'CAR_MONTHLY', 'CAR_QUARTERLY'];
export const PLAN_VEHICLE_TYPES = ['motorcycle', 'car'];

const planSchema = new mongoose.Schema(
  {
    code: { type: String, enum: PLAN_CODES, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    vehicleType: { type: String, enum: PLAN_VEHICLE_TYPES, required: true },
    durationDays: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Plan', planSchema);
