import Joi from 'joi';
import { SLOT_STATUSES } from '../models/parking-slot.model.js';

export const createSlotSchema = Joi.object({
  floorId: Joi.string().hex().length(24).required(),
  slotCode: Joi.string().trim().max(20).required(),
  vehicleType: Joi.string().valid('motorcycle', 'car').required(), // must match floor's type
  note: Joi.string().trim().max(300),
});

const bulkByQuantitySchema = Joi.object({
  floorId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).max(200).required(),
  prefix: Joi.string().trim().max(5).default('A'),       // e.g. "A" → A01, A02...
  startFrom: Joi.number().integer().min(1),               // override start number
});

const bulkByListSchema = Joi.object({
  floorId: Joi.string().hex().length(24).required(),
  slots: Joi.array()
    .items(
      Joi.object({
        slotCode: Joi.string().trim().max(20).required(),
        vehicleType: Joi.string().valid('motorcycle', 'car'), // optional — service enforces floor match
        note: Joi.string().trim().max(300),
      })
    )
    .min(1)
    .max(200)
    .required(),
});

export const bulkCreateSchema = Joi.alternatives()
  .try(bulkByQuantitySchema, bulkByListSchema)
  .messages({ 'alternatives.match': 'Provide either "quantity" (number) or "slots" (array)' });

export const updateSlotSchema = Joi.object({
  slotCode: Joi.string().trim().min(1).max(20),
  vehicleType: Joi.string().valid('motorcycle', 'car'),
  status: Joi.string().valid(...SLOT_STATUSES),
  note: Joi.string().trim().max(300).allow(''),
}).min(1);
