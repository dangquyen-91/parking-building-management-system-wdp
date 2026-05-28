import Subscription from '../models/subscription.model.js';
import Plan from '../models/plan.model.js';
import Payment from '../models/payment.model.js';
import User from '../models/user.model.js';
import * as payosService from './payos.service.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';

const SUBSCRIPTION_POPULATE = [
  { path: 'planId', select: 'code name vehicleType durationDays price' },
  { path: 'userId', select: 'fullName email phone' },
];

export const purchase = async ({ userId, planId, licensePlate }) => {
  const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');

  const plan = await Plan.findById(planId);
  if (!plan) throw new AppError('Plan not found', 404);
  if (!plan.isActive) throw new AppError('Plan is inactive', 400);

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  if (!user.isActive) throw new AppError('User account is inactive', 400);

  const conflict = await Subscription.findOne({ licensePlate: normalizedPlate, status: 'active' });
  if (conflict) {
    throw new AppError(`License plate ${normalizedPlate} already has an active subscription`, 400);
  }

  const stalePending = await Subscription.find({
    userId,
    licensePlate: normalizedPlate,
    status: 'pending',
  });
  for (const old of stalePending) {
    const oldPayment = await Payment.findOne({ subscriptionId: old._id, status: 'pending' });
    if (oldPayment) {
      try {
        await payosService.cancelPaymentLink(oldPayment.orderCode, 'Replaced by new purchase');
      } catch (err) {
        logger.warn('Failed to cancel old PayOS payment link', { orderCode: oldPayment.orderCode, error: err.message });
      }
      oldPayment.status = 'cancelled';
      await oldPayment.save();
    }
    old.status = 'cancelled';
    await old.save();
  }

  const subscription = await Subscription.create({
    userId,
    planId,
    licensePlate: normalizedPlate,
    vehicleType: plan.vehicleType,
    status: 'pending',
  });

  const orderCode = payosService.generateOrderCode();
  let payosResponse;
  try {
    payosResponse = await payosService.createPaymentLink({
      orderCode,
      amount: plan.price,
      description: `Sub ${plan.code}`,
      items: [{ name: plan.name, quantity: 1, price: plan.price }],
      buyerName: user.fullName,
      buyerEmail: user.email,
      buyerPhone: user.phone,
    });
  } catch (err) {
    await Subscription.findByIdAndDelete(subscription._id);
    throw err;
  }

  const payment = await Payment.create({
    subscriptionId: subscription._id,
    userId,
    provider: 'payos',
    orderCode,
    amount: plan.price,
    description: `Sub ${plan.code} - ${normalizedPlate}`,
    status: 'pending',
    checkoutUrl: payosResponse.checkoutUrl,
    paymentLinkId: payosResponse.paymentLinkId,
    providerData: payosResponse,
  });

  return {
    subscription: await subscription.populate(SUBSCRIPTION_POPULATE),
    payment: {
      orderCode: payment.orderCode,
      amount: payment.amount,
      checkoutUrl: payment.checkoutUrl,
      paymentLinkId: payment.paymentLinkId,
      qrCode: payosResponse.qrCode,
      accountNumber: payosResponse.accountNumber,
      accountName: payosResponse.accountName,
      bin: payosResponse.bin,
    },
  };
};

export const handleWebhook = async (webhookBody) => {
  const data = await payosService.verifyWebhook(webhookBody);
  const isSuccess = webhookBody.success === true && webhookBody.code === '00';

  const payment = await Payment.findOneAndUpdate(
    { orderCode: data.orderCode, status: 'pending' },
    {
      status: isSuccess ? 'paid' : 'failed',
      ...(isSuccess && { paidAt: new Date() }),
      $set: { 'providerData.webhook': webhookBody },
    },
    { new: true }
  );

  if (!payment) {
    const existing = await Payment.findOne({ orderCode: data.orderCode });
    if (!existing) {
      logger.warn('Webhook received for unknown orderCode', { orderCode: data.orderCode });
      return { processed: false, reason: 'order_not_found' };
    }
    return { processed: false, reason: `already_${existing.status}` };
  }

  if (!isSuccess) {
    return { processed: true, status: 'failed' };
  }

  const subscription = await Subscription.findById(payment.subscriptionId).populate('planId');
  if (!subscription) {
    logger.error('Subscription missing for paid payment', { paymentId: payment._id });
    return { processed: true, status: 'paid_but_no_sub' };
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + subscription.planId.durationDays);

  const activated = await Subscription.findOneAndUpdate(
    { _id: subscription._id, status: 'pending' },
    { status: 'active', startDate, endDate },
    { new: true }
  );

  if (!activated) {
    logger.warn('Subscription was not pending when activating', { subscriptionId: subscription._id });
    return { processed: true, status: 'already_processed', subscriptionId: subscription._id };
  }

  return { processed: true, status: 'activated', subscriptionId: subscription._id };
};

export const getMySubscriptions = async (userId, { status } = {}) => {
  const filter = { userId };
  if (status) filter.status = status;
  return Subscription.find(filter).populate(SUBSCRIPTION_POPULATE).sort({ createdAt: -1 });
};

export const getById = async (id) => {
  const subscription = await Subscription.findById(id).populate(SUBSCRIPTION_POPULATE);
  if (!subscription) throw new AppError('Subscription not found', 404);
  return subscription;
};

export const getAll = async ({ page = 1, limit = 20, status, vehicleType, licensePlate } = {}) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const filter = {};
  if (status) filter.status = status;
  if (vehicleType) filter.vehicleType = vehicleType;
  if (licensePlate) filter.licensePlate = new RegExp(licensePlate.toUpperCase(), 'i');

  const skip = (pageNum - 1) * limitNum;
  const [subscriptions, total] = await Promise.all([
    Subscription.find(filter)
      .populate(SUBSCRIPTION_POPULATE)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }),
    Subscription.countDocuments(filter),
  ]);
  return { subscriptions, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
};

export const cancel = async (id, userId) => {
  const subscription = await Subscription.findById(id);
  if (!subscription) throw new AppError('Subscription not found', 404);
  if (subscription.userId.toString() !== userId.toString())
    throw new AppError('You can only cancel your own subscription', 403);
  if (subscription.status !== 'pending')
    throw new AppError('Only pending subscriptions can be cancelled', 400);

  const payment = await Payment.findOne({ subscriptionId: id, status: 'pending' });
  if (payment) {
    try {
      await payosService.cancelPaymentLink(payment.orderCode, 'User cancelled subscription');
    } catch (err) {
      logger.warn('Failed to cancel PayOS payment link', { error: err.message });
    }
    payment.status = 'cancelled';
    await payment.save();
  }

  subscription.status = 'cancelled';
  await subscription.save();
  return subscription.populate(SUBSCRIPTION_POPULATE);
};

export const findActiveByPlate = async (licensePlate) => {
  const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');
  return Subscription.findOne({ licensePlate: normalizedPlate, status: 'active' })
    .populate(SUBSCRIPTION_POPULATE);
};
