import * as slotService from '../services/parking-slot.service.js';
import { success } from '../utils/response.js';

export const getAll = async (req, res, next) => {
  try {
    const result = await slotService.getAll(req.query);
    success(res, result, 'Slots retrieved');
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const slot = await slotService.getById(req.params.id);
    success(res, { slot }, 'Slot retrieved');
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const slot = await slotService.create(req.body);
    success(res, { slot }, 'Slot created', 201);
  } catch (err) {
    next(err);
  }
};

export const bulkCreate = async (req, res, next) => {
  try {
    const slots = await slotService.bulkCreate(req.body);
    success(res, { slots, count: slots.length }, `${slots.length} slots created`, 201);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const slot = await slotService.update(req.params.id, req.body);
    success(res, { slot }, 'Slot updated');
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await slotService.remove(req.params.id);
    success(res, null, 'Slot deleted');
  } catch (err) {
    next(err);
  }
};
