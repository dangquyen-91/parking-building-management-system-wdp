/**
 * One-time migration: set isEmailVerified = true for all existing users.
 * Run once after deploying the email-verification feature so existing
 * admin / manager / staff / user accounts are not locked out.
 *
 * Usage:
 *   node src/scripts/migrate-email-verified.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const result = await mongoose.connection
  .collection('users')
  .updateMany({ isEmailVerified: { $ne: true } }, { $set: { isEmailVerified: true } });

console.log(`Migration done: ${result.modifiedCount} users updated.`);
await mongoose.disconnect();
