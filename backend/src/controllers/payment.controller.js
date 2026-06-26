import * as paymentService from '../services/payment.service.js';
import { success } from '../utils/response.js';

export const getAll = async (req, res, next) => {
  try {
    const result = await paymentService.getAll(req.query);
    success(res, result, 'Payments retrieved');
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const payment = await paymentService.getById(req.params.id);
    success(res, { payment }, 'Payment retrieved');
  } catch (err) {
    next(err);
  }
};
