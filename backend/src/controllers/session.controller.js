import * as sessionService from '../services/session.service.js';
import { success } from '../utils/response.js';


export const checkIn = async (req, res, next) => {
  try {
    const session = await sessionService.checkIn({
      ...req.body,
      staffId: req.user._id,
    });
    success(res, { session }, 'Vehicle checked in successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getActiveSessions = async (req, res, next) => {
  try {
    const result = await sessionService.getActiveSessions(req.query);
    success(res, result, 'Active sessions retrieved');
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const session = await sessionService.getById(req.params.id);
    success(res, { session }, 'Session retrieved');
  } catch (err) {
    next(err);
  }
};

export const lookup = async (req, res, next) => {
  try {
    const result = await sessionService.lookup(req.query.licensePlate);
    success(res, result, 'License plate lookup result');
  } catch (err) {
    next(err);
  }
};

export const previewCheckout = async (req, res, next) => {
  try {
    const result = await sessionService.previewCheckout(req.params.id);
    success(res, result, 'Checkout preview');
  } catch (err) {
    next(err);
  }
};

export const checkOutCash = async (req, res, next) => {
  try {
    const session = await sessionService.checkOutCash(req.params.id, req.user._id);
    success(res, { session }, 'Vehicle checked out (cash) successfully');
  } catch (err) {
    next(err);
  }
};

export const checkOutTransfer = async (req, res, next) => {
  try {
    const result = await sessionService.checkOutTransfer(req.params.id, req.user._id);
    success(res, result, 'PayOS payment link created for transfer');
  } catch (err) {
    next(err);
  }
};
