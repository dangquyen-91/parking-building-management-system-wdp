import * as buildingService from '../services/building.service.js';
import { success } from '../utils/response.js';

export const getAll = async (req, res, next) => {
  try {
    const result = await buildingService.getAll(req.query);
    success(res, result, 'Buildings retrieved');
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const building = await buildingService.getById(req.params.id);
    success(res, { building }, 'Building retrieved');
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const building = await buildingService.create(req.body);
    success(res, { building }, 'Building created', 201);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const building = await buildingService.update(req.params.id, req.body);
    success(res, { building }, 'Building updated');
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await buildingService.remove(req.params.id);
    success(res, null, 'Building deactivated');
  } catch (err) {
    next(err);
  }
};
