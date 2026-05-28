import cron from 'node-cron';
import Subscription from '../models/subscription.model.js';
import Payment from '../models/payment.model.js';
import logger from '../utils/logger.js';

const PENDING_TTL_MINUTES = 60;

const expireActiveSubscriptions = async () => {
  const result = await Subscription.updateMany(
    { status: 'active', endDate: { $lt: new Date() } },
    { status: 'expired' }
  );
  if (result.modifiedCount > 0) {
    logger.info(`Expired ${result.modifiedCount} active subscription(s) past endDate`);
  }
};

const cancelStalePending = async () => {
  const cutoff = new Date(Date.now() - PENDING_TTL_MINUTES * 60 * 1000);
  const stale = await Subscription.find({ status: 'pending', createdAt: { $lt: cutoff } });
  if (stale.length === 0) return;

  for (const sub of stale) {
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
