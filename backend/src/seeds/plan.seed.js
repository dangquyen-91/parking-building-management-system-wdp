import mongoose from 'mongoose';
import dns from 'dns';
import Plan from '../models/plan.model.js';
import logger from '../utils/logger.js';

dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const SEED_PLANS = [
  {
    code: 'MOTO_MONTHLY',
    name: 'Xe máy - Gói tháng',
    vehicleType: 'motorcycle',
    durationDays: 30,
    price: 150000,
    description: 'Gói gửi xe máy 30 ngày cho cư dân',
  },
  {
    code: 'MOTO_QUARTERLY',
    name: 'Xe máy - Gói quý',
    vehicleType: 'motorcycle',
    durationDays: 90,
    price: 400000,
    description: 'Gói gửi xe máy 90 ngày cho cư dân',
  },
  {
    code: 'CAR_MONTHLY',
    name: 'Ô tô - Gói tháng',
    vehicleType: 'car',
    durationDays: 30,
    price: 1500000,
    description: 'Gói gửi ô tô 30 ngày cho cư dân',
  },
  {
    code: 'CAR_QUARTERLY',
    name: 'Ô tô - Gói quý',
    vehicleType: 'car',
    durationDays: 90,
    price: 4000000,
    description: 'Gói gửi ô tô 90 ngày cho cư dân',
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const plan of SEED_PLANS) {
    await Plan.findOneAndUpdate({ code: plan.code }, plan, { upsert: true, new: true });
    logger.info(`Seeded plan ${plan.code} (${plan.price.toLocaleString()}đ)`);
  }
  await mongoose.disconnect();
  logger.info('Plan seed completed');
  process.exit(0);
};

run().catch((err) => {
  logger.error('Plan seed failed', { error: err.message });
  process.exit(1);
});
