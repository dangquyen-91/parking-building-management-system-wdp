import User from '../models/user.model.js';
import { ROLES } from '../constants/roles.js';
import AppError from '../utils/appError.js';

const SORTABLE_FIELDS = ['fullName', 'email', 'createdAt', 'role'];
const MAX_VEHICLES = 5;

// Managers may only manage staff accounts (see permission matrix).
const assertManageable = (requester, targetUser) => {
  if (requester?.role === 'manager' && targetUser.role !== 'staff') {
    throw new AppError('Managers can only manage staff accounts', 403);
  }
};

export const getAllUsers = async ({ page = 1, limit = 10, role, isActive, sort, order, search }, requester) => {
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  // Managers are scoped to staff accounts regardless of any role filter passed.
  if (requester?.role === 'manager') filter.role = 'staff';
  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ fullName: regex }, { email: regex }];
  }

  const sortField = SORTABLE_FIELDS.includes(sort) ? sort : 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(Number(limit)).sort({ [sortField]: sortOrder }),
    User.countDocuments(filter),
  ]);
  return { users, total, page: Number(page), limit: Number(limit) };
};

export const getUserById = async (id, requester) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  assertManageable(requester, user);
  return user;
};

export const updateMe = async (id, data) => {
  const allowed = ['fullName', 'phone', 'email', 'cccd', 'dateOfBirth', 'gender', 'address'];
  const update = {};
  allowed.forEach((field) => {
    if (data[field] !== undefined) update[field] = data[field];
  });

  if (update.email) {
    const exists = await User.exists({ email: update.email, _id: { $ne: id } });
    if (exists) throw new AppError('Email is already in use', 409);
  }

  if (update.cccd) {
    const exists = await User.exists({ cccd: update.cccd, _id: { $ne: id } });
    if (exists) throw new AppError('CCCD is already registered to another account', 409);
  }

  const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const changePassword = async (id, currentPassword, newPassword) => {
  const user = await User.findById(id).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new AppError('Current password is incorrect', 400);

  if (currentPassword === newPassword) throw new AppError('New password must differ from current password', 400);

  user.password = newPassword;
  user.refreshToken = undefined;
  await user.save();

  return await User.findById(id);
};

export const addVehicle = async (id, licensePlate, vehicleType) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);

  if (user.vehicles.length >= MAX_VEHICLES) {
    throw new AppError(`Maximum ${MAX_VEHICLES} vehicles allowed per account`, 400);
  }

  const duplicate = user.vehicles.some((v) => v.licensePlate === licensePlate.toUpperCase());
  if (duplicate) throw new AppError('This license plate is already registered', 409);

  user.vehicles.push({ licensePlate: licensePlate.toUpperCase(), vehicleType });
  await user.save();
  return user;
};

export const removeVehicle = async (id, vehicleId) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);

  const vehicle = user.vehicles.id(vehicleId);
  if (!vehicle) throw new AppError('Vehicle not found', 404);

  vehicle.deleteOne();
  await user.save();
  return user;
};

export const updateUser = async (id, data, requester) => {
  const target = await User.findById(id);
  if (!target) throw new AppError('User not found', 404);
  assertManageable(requester, target);

  const allowed = ['fullName', 'phone', 'email', 'cccd', 'dateOfBirth', 'gender', 'address'];
  const update = {};
  allowed.forEach((field) => {
    if (data[field] !== undefined) update[field] = data[field];
  });

  if (update.email) {
    const exists = await User.exists({ email: update.email, _id: { $ne: id } });
    if (exists) throw new AppError('Email is already in use', 409);
  }

  if (update.cccd) {
    const exists = await User.exists({ cccd: update.cccd, _id: { $ne: id } });
    if (exists) throw new AppError('CCCD is already registered to another account', 409);
  }

  const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const changeRole = async (id, role, requesterId) => {
  if (id.toString() === requesterId.toString()) throw new AppError('Cannot change your own role', 403);
  if (!ROLES.includes(role)) throw new AppError(`Role must be one of: ${ROLES.join(', ')}`, 400);
  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateStatus = async (id, isActive, requester) => {
  if (id.toString() === requester._id.toString()) throw new AppError('Cannot change your own status', 403);
  const target = await User.findById(id);
  if (!target) throw new AppError('User not found', 404);
  assertManageable(requester, target);
  target.isActive = isActive;
  await target.save({ validateBeforeSave: false });
  return target;
};
