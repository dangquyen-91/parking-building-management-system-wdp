import * as rowService from '../services/parking-row.service.js';
import { success } from '../utils/response.js';

export const getAll = async (req, res, next) => {
  try {
    const result = await rowService.getAll(req.query);
    success(res, result, 'Rows retrieved');
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const row = await rowService.getById(req.params.id);
    success(res, { row }, 'Row retrieved');
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const row = await rowService.create(req.body);
    success(res, { row }, 'Row created', 201);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const row = await rowService.update(req.params.id, req.body);
    success(res, { row }, 'Row updated');
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const row = await rowService.updateStatus(req.params.id, status, note);
    success(res, { row }, 'Row status updated');
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await rowService.remove(req.params.id);
    success(res, null, 'Row deleted');
  } catch (err) {
    next(err);
  }
};
