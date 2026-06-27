import * as userService from '../services/user.service.js';
import { success } from '../utils/response.js';

export const getAll = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers(req.query, req.user);
    success(res, result, 'Users retrieved');
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user._id);
    success(res, { user }, 'Profile retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const user = await userService.updateMe(req.user._id, req.body);
    success(res, { user }, 'Profile updated');
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await userService.changePassword(req.user._id, currentPassword, newPassword);
    success(res, { user }, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

export const addVehicle = async (req, res, next) => {
  try {
    const { licensePlate, vehicleType } = req.body;
    const user = await userService.addVehicle(req.user._id, licensePlate, vehicleType);
    success(res, { user }, 'Vehicle added', 201);
  } catch (err) {
    next(err);
  }
};

export const removeVehicle = async (req, res, next) => {
  try {
    const user = await userService.removeVehicle(req.user._id, req.params.vehicleId);
    success(res, { user }, 'Vehicle removed');
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id, req.user);
    success(res, { user }, 'User retrieved');
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user);
    success(res, { user }, 'User updated');
  } catch (err) {
    next(err);
  }
};

export const changeRole = async (req, res, next) => {
  try {
    const user = await userService.changeRole(req.params.id, req.body.role, req.user._id);
    success(res, { user }, 'User role updated');
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const user = await userService.updateStatus(req.params.id, req.body.isActive, req.user);
    success(res, { user }, `User ${req.body.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) {
    next(err);
  }
};
