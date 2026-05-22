import Joi from 'joi';

export const checkInSchema = Joi.object({
  licensePlate: Joi.string().trim().min(4).max(20).required(),
  vehicleType: Joi.string().valid('motorcycle', 'car').required(),
  userId: Joi.string().hex().length(24), // optional — resident account
  note: Joi.string().trim().max(300),
});

export const lookupSchema = Joi.object({
  licensePlate: Joi.string().trim().min(4).max(20).required(),
});
