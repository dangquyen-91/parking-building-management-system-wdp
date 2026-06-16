import * as subscriptionService from '../services/subscription.service.js';
import { success } from '../utils/response.js';

export const purchase = async (req, res, next) => {
  try {
    const result = await subscriptionService.purchase({
      ...req.body,
      userId: req.user._id,
    });
    success(res, result, 'Subscription created, awaiting payment', 201);
  } catch (err) {
    next(err);
  }
};

export const getMine = async (req, res, next) => {
  try {
    const subscriptions = await subscriptionService.getMySubscriptions(req.user._id, req.query);
    success(res, { subscriptions }, 'My subscriptions retrieved');
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const result = await subscriptionService.getAll(req.query);
    success(res, result, 'Subscriptions retrieved');
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getById(req.params.id);
    success(res, { subscription }, 'Subscription retrieved');
  } catch (err) {
    next(err);
  }
};

export const cancel = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.cancel(req.params.id, req.user._id);
    success(res, { subscription }, 'Subscription cancelled');
  } catch (err) {
    next(err);
  }
};

export const getQR = async (req, res, next) => {
  try {
    const result = await subscriptionService.getQR(req.params.id, req.user);
    success(res, result, 'Subscription QR retrieved');
  } catch (err) {
    next(err);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const result = await subscriptionService.handleWebhook(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
