import Joi from 'joi';
import { SLOT_STATUSES } from '../models/parking-slot.model.js';

export const createSlotSchema = Joi.object({
  floorId: Joi.string().hex().length(24).required(),
  slotCode: Joi.string().trim().max(20).required(),
  note: Joi.string().trim().max(300),
});

export const bulkCreateSchema = Joi.object({
  floorId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).max(200).required(),
});

export const updateSlotSchema = Joi.object({
  status: Joi.string().valid(...SLOT_STATUSES),
  note: Joi.string().trim().max(300).allow(''),
}).min(1);
