import mongoose from 'mongoose';

export const PRICING_VEHICLE_TYPES = ['motorcycle', 'car'];
export const PRICING_MODES = ['time_block', 'fixed_block'];

// One time-of-day window with a flat fee. Overnight windows wrap when
// endHour <= startHour (e.g. 22:00 -> 06:00 next day).
const timeBlockSchema = new mongoose.Schema(
  {
    startHour: { type: Number, required: true, min: 0, max: 23 },
    endHour: { type: Number, required: true, min: 0, max: 24 },
    fee: { type: Number, required: true, min: 0 },
    label: { type: String, trim: true },
  },
  { _id: false }
);

const pricingSchema = new mongoose.Schema(
  {
    vehicleType: { type: String, enum: PRICING_VEHICLE_TYPES, required: true },
    mode: { type: String, enum: PRICING_MODES, required: true },

    // fixed_block (e.g. car): every `blockHours` hours costs `blockFee`,
    // rounded up to the next block.
    blockHours: { type: Number, default: null, min: 0 },
    blockFee: { type: Number, default: null, min: 0 },

    // time_block (e.g. motorcycle): flat fee per time-of-day window the
    // stay touches, recurring each calendar day.
    timeBlocks: { type: [timeBlockSchema], default: [] },

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
