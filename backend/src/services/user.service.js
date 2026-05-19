import User from '../models/user.model.js';
import { ROLES } from '../constants/roles.js';
import AppError from '../utils/appError.js';

const SORTABLE_FIELDS = ['fullName', 'email', 'createdAt', 'role'];

export const getAllUsers = async ({ page = 1, limit = 10, role, isActive, sort, order }) => {
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const sortField = SORTABLE_FIELDS.includes(sort) ? sort : 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(Number(limit)).sort({ [sortField]: sortOrder }),
    User.countDocuments(filter),
  ]);
  return { users, total, page: Number(page), limit: Number(limit) };
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateMe = async (id, data) => {
  const allowed = ['fullName', 'phone'];
  const update = {};
  allowed.forEach((field) => {
    if (data[field] !== undefined) update[field] = data[field];
  });

  const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateUser = async (id, data) => {
  const allowed = ['fullName', 'phone', 'email'];
  const update = {};
  allowed.forEach((field) => {
    if (data[field] !== undefined) update[field] = data[field];
  });

  const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const changeRole = async (id, role) => {
  if (!ROLES.includes(role)) throw new AppError(`Role must be one of: ${ROLES.join(', ')}`, 400);
  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateStatus = async (id, isActive) => {
  const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!user) throw new AppError('User not found', 404);
  return user;
};
