import cron from 'node-cron';
import Subscription from '../models/subscription.model.js';
import Payment from '../models/payment.model.js';
import ParkingSlot from '../models/parking-slot.model.js';
import logger from '../utils/logger.js';

const PENDING_TTL_MINUTES = 60;

const expireActiveSubscriptions = async () => {
  const subsToExpire = await Subscription.find({
    status: 'active',
    endDate: { $lt: new Date() },
  }).select('_id slotId');

  if (subsToExpire.length === 0) return;

  for (const sub of subsToExpire) {
    if (sub.slotId) {
      await ParkingSlot.findOneAndUpdate(
        { _id: sub.slotId, status: 'reserved' },
        { status: 'empty' }
      );
    }
    sub.status = 'expired';
    await sub.save();
  }
  logger.info(`Expired ${subsToExpire.length} active subscription(s) past endDate; released slots`);
};

const cancelStalePending = async () => {
  const cutoff = new Date(Date.now() - PENDING_TTL_MINUTES * 60 * 1000);
  const stale = await Subscription.find({ status: 'pending', createdAt: { $lt: cutoff } });
  if (stale.length === 0) return;

  for (const sub of stale) {
    if (sub.slotId) {
      await ParkingSlot.findOneAndUpdate(
        { _id: sub.slotId, status: 'reserved' },
        { status: 'empty' }
      );
    }
    sub.status = 'cancelled';
    await sub.save();
    await Payment.updateMany(
      { subscriptionId: sub._id, status: 'pending' },
      { status: 'expired' }
    );
  }
  logger.info(`Cancelled ${stale.length} stale pending subscription(s) older than ${PENDING_TTL_MINUTES} minutes`);
};

export const startSubscriptionJobs = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      await expireActiveSubscriptions();
      await cancelStalePending();
    } catch (err) {
      logger.error('Subscription cron job failed', { error: err.message });
    }
  });
  logger.info('Subscription cron jobs scheduled (every 15 minutes)');
};
