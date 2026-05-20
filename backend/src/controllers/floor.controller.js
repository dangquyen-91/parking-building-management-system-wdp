import * as floorService from '../services/floor.service.js';
import { success } from '../utils/response.js';

export const getAll = async (req, res, next) => {
  try {
    const result = await floorService.getAll(req.query);
    success(res, result, 'Floors retrieved');
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const floor = await floorService.getById(req.params.id);
    success(res, { floor }, 'Floor retrieved');
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const floor = await floorService.create(req.body);
    success(res, { floor }, 'Floor created', 201);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const floor = await floorService.update(req.params.id, req.body);
    success(res, { floor }, 'Floor updated');
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await floorService.remove(req.params.id);
    success(res, null, 'Floor deactivated');
  } catch (err) {
    next(err);
  }
};
