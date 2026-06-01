import mongoose from 'mongoose';
import dns from 'dns';
import Pricing from '../models/pricing.model.js';
import logger from '../utils/logger.js';

dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const SEED_PRICINGS = [
  {
    vehicleType: 'motorcycle',
    baseFee: 5000,
    baseUnit: 'turn',
    overnightFee: 5000,
    overnightStartHour: 22,
    overnightEndHour: 6,
    dailyCap: null,
    description: '5,000đ/lượt (≤24h), +5,000đ/đêm chạm khung 22:00-06:00',
  },
  {
    vehicleType: 'car',
    baseFee: 20000,
    baseUnit: 'hour',
    overnightFee: 30000,
    overnightStartHour: 22,
    overnightEndHour: 6,
    dailyCap: 120000,
    description: '20,000đ/giờ (làm tròn lên 1h), cap 120,000đ/24h, +30,000đ/đêm',
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const pricing of SEED_PRICINGS) {
    await Pricing.findOneAndUpdate(
      { vehicleType: pricing.vehicleType, isActive: true },
      pricing,
      { upsert: true, new: true }
    );
    logger.info(`Seeded pricing for ${pricing.vehicleType}`);
  }
  await mongoose.disconnect();
  logger.info('Pricing seed completed');
  process.exit(0);
};

run().catch((err) => {
  logger.error('Pricing seed failed', { error: err.message });
  process.exit(1);
});
