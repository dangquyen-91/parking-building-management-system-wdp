import Joi from 'joi';

export const createBuildingSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  address: Joi.string().trim().min(5).max(200).required(),
  description: Joi.string().trim().max(500),
});

export const updateBuildingSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  address: Joi.string().trim().min(5).max(200),
  description: Joi.string().trim().max(500),
}).min(1);
