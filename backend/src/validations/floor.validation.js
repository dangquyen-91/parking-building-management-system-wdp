import Joi from 'joi';

export const createFloorSchema = Joi.object({
  buildingId: Joi.string().hex().length(24).required(),
  floorNumber: Joi.number().integer().min(1).required(),
  vehicleType: Joi.string().valid('motorcycle', 'car').required(),
  totalSlots: Joi.number().integer().min(1).required(),
  description: Joi.string().trim().max(300),
});

export const updateFloorSchema = Joi.object({
  floorNumber: Joi.number().integer().min(1),
  vehicleType: Joi.string().valid('motorcycle', 'car'),
  totalSlots: Joi.number().integer().min(1),
  description: Joi.string().trim().max(300),
}).min(1);
