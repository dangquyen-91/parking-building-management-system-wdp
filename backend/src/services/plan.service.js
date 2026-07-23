import Plan from '../models/plan.model.js';
import Subscription from '../models/subscription.model.js';
import AppError from '../utils/appError.js';

export const create = async (data) => {
  const existing = await Plan.findOne({ code: data.code.toUpperCase() });
  if (existing) throw new AppError(`Plan code ${data.code} already exists`, 409);
  return Plan.create(data);
};

export const getAll = async ({ vehicleType, isActive } = {}) => {
  const filter = {};
  if (vehicleType) filter.vehicleType = vehicleType;
  if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;
  return Plan.find(filter).sort({ vehicleType: 1, durationDays: 1 });
};

export const getById = async (id) => {
  const plan = await Plan.findById(id);
  if (!plan) throw new AppError('Plan not found', 404);
  return plan;
};

export const getByCode = async (code) => {
  const plan = await Plan.findOne({ code: code.toUpperCase(), isActive: true });
  if (!plan) throw new AppError(`Plan ${code} not found or inactive`, 404);
  return plan;
};

export const update = async (id, data) => {
  const plan = await Plan.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!plan) throw new AppError('Plan not found', 404);
  return plan;
};

export const remove = async (id) => {
  const plan = await Plan.findById(id);
  if (!plan) throw new AppError('Plan not found', 404);
  const inUse = await Subscription.countDocuments({
    planId: id,
    status: { $in: ['pending', 'active'] },
  });
  if (inUse > 0) {
    throw new AppError(
      `Cannot delete plan: ${inUse} pending/active subscription(s) still use it. Deactivate it instead (isActive=false).`,
      409
    );
  }
  await Plan.findByIdAndDelete(id);
  return plan;
};
