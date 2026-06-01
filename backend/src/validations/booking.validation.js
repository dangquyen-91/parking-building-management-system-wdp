import Joi from 'joi';

export const createBookingSchema = Joi.object({
  phoneNumber: Joi.string().trim().min(8).max(15).required(),
  licensePlate: Joi.string().trim().min(4).max(20).required(),
  expectedArrivalTime: Joi.date().iso().required(),
  expectedExitTime: Joi.date().iso().required(),
});

export const lookupBookingSchema = Joi.object({
  phoneNumber: Joi.string().trim().min(8).max(15).required(),
  licensePlate: Joi.string().trim().min(4).max(20).required(),
});

export const cancelBookingSchema = Joi.object({
  phoneNumber: Joi.string().trim().min(8).max(15),
  licensePlate: Joi.string().trim().min(4).max(20),
});
