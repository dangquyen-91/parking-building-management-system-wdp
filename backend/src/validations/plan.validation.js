import Joi from 'joi';
import { PLAN_CODES, PLAN_VEHICLE_TYPES } from '../models/plan.model.js';

export const createPlanSchema = Joi.object({
  code: Joi.string().valid(...PLAN_CODES).required(),
  name: Joi.string().trim().min(2).max(100).required(),
  vehicleType: Joi.string().valid(...PLAN_VEHICLE_TYPES).required(),
  durationDays: Joi.number().integer().min(1).required(),
  price: Joi.number().integer().min(0).required(),
  description: Joi.string().trim().max(500).allow('', null),
  isActive: Joi.boolean(),
});

export const updatePlanSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  price: Joi.number().integer().min(0),
  durationDays: Joi.number().integer().min(1),
  description: Joi.string().trim().max(500).allow('', null),
  isActive: Joi.boolean(),
}).min(1);
