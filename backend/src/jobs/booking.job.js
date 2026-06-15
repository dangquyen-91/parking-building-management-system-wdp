import cron from 'node-cron';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
import logger from '../utils/logger.js';

const PENDING_TTL_MINUTES = 15;

const expirePaidBookingsPastExit = async () => {
  const now = new Date();
  const result = await Booking.updateMany(
    { status: 'paid', expectedExitTime: { $lt: now } },
    { status: 'expired' }
  );
  if (result.modifiedCount > 0) {
    logger.info(`Expired ${result.modifiedCount} paid booking(s) past expectedExitTime (no-show)`);
  }
};

const cancelStalePendingBookings = async () => {
  const cutoff = new Date(Date.now() - PENDING_TTL_MINUTES * 60 * 1000);
  const stale = await Booking.find({ status: 'pending', createdAt: { $lt: cutoff } });
  if (stale.length === 0) return;

  for (const booking of stale) {
    booking.status = 'cancelled';
    await booking.save();
    await Payment.updateMany(
      { bookingId: booking._id, status: 'pending' },
      { status: 'expired' }
    );
  }
  logger.info(`Cancelled ${stale.length} stale pending booking(s) older than ${PENDING_TTL_MINUTES} minutes`);
};

export const startBookingJobs = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      await expirePaidBookingsPastExit();
      await cancelStalePendingBookings();
    } catch (err) {
      logger.error('Booking cron job failed', { error: err.message });
    }
  });
  logger.info('Booking cron jobs scheduled (every 5 minutes)');
};
