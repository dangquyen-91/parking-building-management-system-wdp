import Joi from 'joi';

export const checkInSchema = Joi.object({
  vehicleType: Joi.string().valid('motorcycle', 'car').required(),
  licensePlate: Joi.string().trim().min(4).max(20).required(),

  slotId: Joi.string().hex().length(24).when('vehicleType', {
    is: 'car',
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),

  rowId: Joi.string().hex().length(24).when('vehicleType', {
    is: 'motorcycle',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),

  note: Joi.string().trim().max(300).allow('', null),
});

export const lookupSchema = Joi.object({
  licensePlate: Joi.string().trim().min(4).max(20).required(),
});
