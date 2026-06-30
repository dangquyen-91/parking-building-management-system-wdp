import * as authService from '../services/auth.service.js';
import { success } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    success(res, { user }, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    success(res, { accessToken, refreshToken, user }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const tokens = await authService.refreshAccessToken(req.body.refreshToken);
    success(res, tokens, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user._id);
    success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.body);
    success(res, null, result.message);
  } catch (err) {
    next(err);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const result = await authService.resendVerification(req.body);
    success(res, null, result.message);
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body);
    success(res, null, result.message);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    success(res, null, result.message);
  } catch (err) {
    next(err);
  }
};
