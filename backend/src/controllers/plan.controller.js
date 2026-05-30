import * as planService from '../services/plan.service.js';
import { success } from '../utils/response.js';

export const getAll = async (req, res, next) => {
  try {
    const plans = await planService.getAll(req.query);
    success(res, { plans }, 'Plans retrieved');
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const plan = await planService.getById(req.params.id);
    success(res, { plan }, 'Plan retrieved');
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const plan = await planService.update(req.params.id, req.body);
    success(res, { plan }, 'Plan updated');
  } catch (err) {
    next(err);
  }
};
