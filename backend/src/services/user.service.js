import User from '../models/user.model.js';
import AppError from '../utils/appError.js';

export const getAllUsers = async ({ page = 1, limit = 10 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(Number(limit)),
    User.countDocuments(),
  ]);
  return { users, total, page: Number(page), limit: Number(limit) };
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateUser = async (id, data) => {
  const forbidden = ['password', 'role', 'refreshToken'];
  forbidden.forEach((f) => delete data[f]);

  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const deleteUser = async (id) => {
  const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!user) throw new AppError('User not found', 404);
  return user;
};
