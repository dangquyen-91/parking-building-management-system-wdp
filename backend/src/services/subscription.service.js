import Subscription from '../models/subscription.model.js';
import Plan from '../models/plan.model.js';
import Payment from '../models/payment.model.js';
import User from '../models/user.model.js';
import ParkingSlot from '../models/parking-slot.model.js';
import Floor from '../models/floor.model.js';
import * as payosService from './payos.service.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';

const SUBSCRIPTION_POPULATE = [
  { path: 'planId', select: 'code name vehicleType durationDays price' },
  { path: 'userId', select: 'fullName email phone' },
  {
    path: 'slotId',
    select: 'slotCode vehicleType floorId',
    populate: { path: 'floorId', select: 'floorNumber buildingId floorType' },
  },
];

export const purchase = async ({ userId, planId, licensePlate, slotId }) => {
  const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');

  const plan = await Plan.findById(planId);
  if (!plan) throw new AppError('Plan not found', 404);
  if (!plan.isActive) throw new AppError('Plan is inactive', 400);

  if (plan.vehicleType === 'car' && !slotId) {
    throw new AppError('slotId is required for car subscriptions (fixed parking spot)', 400);
  }
  if (plan.vehicleType === 'motorcycle' && slotId) {
    throw new AppError('Motorcycle subscriptions do not lock a slot. Remove slotId.', 400);
  }

  if (plan.vehicleType === 'motorcycle') {
    const residentMotoFloors = await Floor.find({
      vehicleType: 'motorcycle',
      floorType: 'resident',
      isActive: true,
    }).select('totalSlots');
    const totalCapacity = residentMotoFloors.reduce((sum, f) => sum + f.totalSlots, 0);
    const soldCount = await Subscription.countDocuments({
      vehicleType: 'motorcycle',
      status: { $in: ['pending', 'active'] },
    });
    if (soldCount >= totalCapacity) {
      throw new AppError(
        `Resident motorcycle subscriptions are sold out (${soldCount}/${totalCapacity})`,
        409
      );
    }
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  if (!user.isActive) throw new AppError('User account is inactive', 400);

  const conflict = await Subscription.findOne({ licensePlate: normalizedPlate, status: 'active' });
  if (conflict) {
    throw new AppError(`License plate ${normalizedPlate} already has an active subscription`, 400);
  }

  if (slotId) {
    const slot = await ParkingSlot.findById(slotId).populate({
      path: 'floorId',
      select: 'isActive vehicleType floorType buildingId',
      populate: { path: 'buildingId', select: 'isActive' },
    });
    if (!slot) throw new AppError('Parking slot not found', 404);
    if (slot.vehicleType !== 'car') throw new AppError('Slot must be a car slot', 400);
    if (!slot.floorId.isActive) throw new AppError('Floor is inactive', 400);
    if (!slot.floorId.buildingId?.isActive) throw new AppError('Building is inactive', 400);
    if (slot.floorId.floorType !== 'resident')
      throw new AppError('Subscription slot must be on a resident floor', 400);

    const slotInUse = await Subscription.findOne({
      slotId,
      status: { $in: ['pending', 'active'] },
    });
    if (slotInUse)
      throw new AppError(`Slot ${slot.slotCode} is already reserved by another subscription`, 409);
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
    if (old.slotId) {
      await ParkingSlot.findOneAndUpdate(
        { _id: old.slotId, status: 'reserved' },
        { status: 'empty' }
      );
    }
    old.status = 'cancelled';
    await old.save();
  }

  if (slotId) {
    const locked = await ParkingSlot.findOneAndUpdate(
      { _id: slotId, status: 'empty' },
      { status: 'reserved' },
      { new: true }
    );
    if (!locked)
      throw new AppError(`Slot is no longer available — current status changed`, 409);
  }

  let subscription;
  try {
    subscription = await Subscription.create({
      userId,
      planId,
      licensePlate: normalizedPlate,
      vehicleType: plan.vehicleType,
      slotId: slotId || null,
      status: 'pending',
    });
  } catch (err) {
    if (slotId) await ParkingSlot.findByIdAndUpdate(slotId, { status: 'empty' });
    throw err;
  }

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
    if (slotId) await ParkingSlot.findByIdAndUpdate(slotId, { status: 'empty' });
    throw err;
  }

  const payment = await Payment.create({
    targetType: 'subscription',
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
    if (payment.targetType === 'subscription') {
      const failedSub = await Subscription.findById(payment.subscriptionId);
      if (failedSub?.slotId) {
        await ParkingSlot.findOneAndUpdate(
          { _id: failedSub.slotId, status: 'reserved' },
          { status: 'empty' }
        );
      }
    }
    return { processed: true, status: 'failed', targetType: payment.targetType };
  }

  if (payment.targetType === 'session') {
    const { activateSessionFromWebhook } = await import('./session.service.js');
    const result = await activateSessionFromWebhook(payment._id);
    if (!result) return { processed: true, status: 'paid_but_no_session' };
    if (result.alreadyClosed)
      return { processed: true, status: 'already_processed', sessionId: result.sessionId };
    return { processed: true, status: 'session_closed', sessionId: result.sessionId };
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

  if (subscription.slotId) {
    await ParkingSlot.findOneAndUpdate(
      { _id: subscription.slotId, status: 'reserved' },
      { status: 'empty' }
    );
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
