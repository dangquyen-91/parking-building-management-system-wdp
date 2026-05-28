import Plan from '../models/plan.model.js';
import AppError from '../utils/appError.js';

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
