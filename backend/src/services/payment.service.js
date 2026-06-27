import Payment from '../models/payment.model.js';
import AppError from '../utils/appError.js';

const PAYMENT_POPULATE = [
  { path: 'userId', select: 'fullName email phone' },
  { path: 'subscriptionId', select: 'licensePlate vehicleType status' },
  { path: 'bookingId', select: 'licensePlate vehicleType status' },
  { path: 'sessionId', select: 'licensePlate vehicleType status' },
];

export const getAll = async ({ page = 1, limit = 20, status, targetType, orderCode } = {}) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const filter = {};
  if (status) filter.status = status;
  if (targetType) filter.targetType = targetType;
  if (orderCode) filter.orderCode = Number(orderCode);

  const skip = (pageNum - 1) * limitNum;
  const [payments, total] = await Promise.all([
    Payment.find(filter).populate(PAYMENT_POPULATE).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
    Payment.countDocuments(filter),
  ]);
  return { payments, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
};

export const getById = async (id) => {
  const payment = await Payment.findById(id).populate(PAYMENT_POPULATE);
  if (!payment) throw new AppError('Payment not found', 404);
  return payment;
};
