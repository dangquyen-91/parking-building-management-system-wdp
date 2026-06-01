import mongoose from 'mongoose';

export const PRICING_VEHICLE_TYPES = ['motorcycle', 'car'];
export const PRICING_BASE_UNITS = ['turn', 'hour'];

const pricingSchema = new mongoose.Schema(
  {
    vehicleType: { type: String, enum: PRICING_VEHICLE_TYPES, required: true },
    baseFee: { type: Number, required: true, min: 0 },
    baseUnit: { type: String, enum: PRICING_BASE_UNITS, required: true },
    overnightFee: { type: Number, default: 0, min: 0 },
    overnightStartHour: { type: Number, default: 22, min: 0, max: 23 },
    overnightEndHour: { type: Number, default: 6, min: 0, max: 23 },
    dailyCap: { type: Number, default: null, min: 0 },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

pricingSchema.index(
  { vehicleType: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export default mongoose.model('Pricing', pricingSchema);
