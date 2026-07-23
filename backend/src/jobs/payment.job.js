import cron from 'node-cron';
import Payment from '../models/payment.model.js';
import * as subscriptionService from '../services/subscription.service.js';

// Safety net for missed/delayed PayOS webhooks (and users who never hit the
// return-url). Poll PayOS for recent still-pending payments and activate any
// that were actually PAID — before the cancel jobs void the order.
const reconcilePendingPayments = async () => {
  const now = Date.now();
  const pending = await Payment.find({
    provider: 'payos',
    status: 'pending',
    // Give the webhook a head start (skip < 2 min old); ignore ancient ones
    // whose payment link is already dead.
    createdAt: { $lte: new Date(now - 2 * 60 * 1000), $gte: new Date(now - 90 * 60 * 1000) },
  })
    .select('orderCode')
    .sort({ createdAt: 1 })
    .limit(50);

  if (pending.length === 0) return;

  let activated = 0;
  for (const p of pending) {
    try {
      const result = await subscriptionService.confirmPaymentByOrderCode(p.orderCode);
      if (result?.processed && result.reason !== 'not_paid_yet') activated += 1;
    } catch (err) {
      console.warn('Reconcile payment failed', { orderCode: p.orderCode, error: err.message });
    }
  }
  if (activated > 0) {
    console.log(`Reconciled ${activated} paid-but-pending PayOS payment(s)`);
  }
};

export const startPaymentJobs = () => {
  cron.schedule('*/3 * * * *', async () => {
    try {
      await reconcilePendingPayments();
    } catch (err) {
      console.error('Payment reconciliation cron failed', { error: err.message });
    }
  });
  console.log('Payment reconciliation cron scheduled (every 3 minutes)');
};
