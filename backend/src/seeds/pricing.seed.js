import mongoose from 'mongoose';
import dns from 'dns';
import Pricing from '../models/pricing.model.js';

dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const SEED_PRICINGS = [
  {
    vehicleType: 'motorcycle',
    mode: 'time_block',
    blockHours: null,
    blockFee: null,
    timeBlocks: [
      { startHour: 6, endHour: 17, fee: 5000, label: 'Ngày (06:00-17:00)' },
      { startHour: 17, endHour: 22, fee: 10000, label: 'Tối (17:00-22:00)' },
      { startHour: 22, endHour: 6, fee: 15000, label: 'Đêm (22:00-06:00)' },
    ],
    description:
      'Theo khung giờ: 06-17 = 5k, 17-22 = 10k, 22-06 = 15k (chạm khung nào tính khung đó)',
  },
  {
    vehicleType: 'car',
    mode: 'fixed_block',
    blockHours: 4,
    blockFee: 35000,
    timeBlocks: [],
    description: '35,000đ mỗi 4 giờ (làm tròn lên block 4h, vd 9h = 3 block = 105k)',
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
    console.log(`Seeded pricing for ${pricing.vehicleType}`);
  }
  await mongoose.disconnect();
  console.log('Pricing seed completed');
  process.exit(0);
};

run().catch((err) => {
  console.error('Pricing seed failed', { error: err.message });
  process.exit(1);
});
