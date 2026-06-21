import Joi from 'joi';

export const createBookingSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  licensePlate: Joi.string().trim().min(4).max(20).required(),
  expectedArrivalTime: Joi.date().iso().required(),
  expectedExitTime: Joi.date().iso().required(),
});

export const lookupBookingSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  licensePlate: Joi.string().trim().min(4).max(20).required(),
});

export const cancelBookingSchema = Joi.object({
  email: Joi.string().email().trim(),
  licensePlate: Joi.string().trim().min(4).max(20),
});
