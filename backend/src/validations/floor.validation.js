import Joi from 'joi';
import { VEHICLE_TYPES, FLOOR_TYPES } from '../models/floor.model.js';

export const createFloorSchema = Joi.object({
  buildingId:  Joi.string().hex().length(24).required(),
  floorNumber: Joi.number().integer().min(1).required(),
  section:     Joi.string().trim().uppercase().max(10).default('A'),
  vehicleType: Joi.string().valid(...VEHICLE_TYPES).required(),
  floorType:   Joi.string().valid(...FLOOR_TYPES).required(),
  totalSlots:  Joi.number().integer().min(1).required(),
  description: Joi.string().trim().max(300),
});

export const updateFloorSchema = Joi.object({
  floorNumber: Joi.number().integer().min(1),
  section:     Joi.string().trim().uppercase().max(10),
  vehicleType: Joi.string().valid(...VEHICLE_TYPES),
  floorType:   Joi.string().valid(...FLOOR_TYPES),
  totalSlots:  Joi.number().integer().min(1),
  description: Joi.string().trim().max(300),
}).min(1);
