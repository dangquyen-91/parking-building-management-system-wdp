import Joi from 'joi';

export const updatePlanSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  price: Joi.number().integer().min(0),
  durationDays: Joi.number().integer().min(1),
  description: Joi.string().trim().max(500).allow('', null),
  isActive: Joi.boolean(),
}).min(1);
