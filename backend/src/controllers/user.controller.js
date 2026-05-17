import * as userService from '../services/user.service.js';
import { success } from '../utils/response.js';

export const getAll = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers(req.query);
    success(res, result, 'Users retrieved');
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    success(res, { user }, 'User retrieved');
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    success(res, { user }, 'User updated');
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    success(res, null, 'User deactivated');
  } catch (err) {
    next(err);
  }
};
