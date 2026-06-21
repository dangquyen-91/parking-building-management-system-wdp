import mongoose from 'mongoose';
import dns from 'dns';
import User from '../models/user.model.js';

dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const SEED_USERS = [
  {
    fullName: 'System Admin',
    email: 'admin@test.com',
    password: 'Admin@1234',
    phone: '0900000001',
    role: 'admin',
  },
  {
    fullName: 'Parking Manager',
    email: 'manager@test.com',
    password: 'Manager@1234',
    phone: '0900000002',
    role: 'manager',
  },
  {
    fullName: 'Parking Staff',
    email: 'staff@test.com',
    password: 'Staff@1234',
    phone: '0900000003',
    role: 'staff',
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const data of SEED_USERS) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      existing.role = data.role;
      existing.fullName = data.fullName;
      existing.phone = data.phone;
      existing.isActive = true;
      await existing.save({ validateBeforeSave: false });
      console.log(`Updated existing user ${data.email} (role=${data.role}) — password NOT changed`);
    } else {
      await User.create(data);
      console.log(`Created user ${data.email} (role=${data.role}) — password: ${data.password}`);
    }
  }
  await mongoose.disconnect();
  console.log('User seed completed');
  process.exit(0);
};

run().catch((err) => {
  console.error('User seed failed', { error: err.message });
  process.exit(1);
});
