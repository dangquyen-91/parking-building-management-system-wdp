import Joi from 'joi';

export const checkInSchema = Joi.object({
  vehicleType: Joi.string().valid('motorcycle', 'car').required(),
  licensePlate: Joi.string().trim().min(4).max(20).required(),

  // Optional: residents are bound to their reserved slot via subscription;
  // walk-ins are auto-assigned a visitor floor (counter-based, no fixed slot).
  slotId: Joi.string().hex().length(24).when('vehicleType', {
    is: 'car',
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),

  // Optional: system auto-picks the first row with capacity if not provided.
  rowId: Joi.string().hex().length(24).when('vehicleType', {
    is: 'motorcycle',
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),

  note: Joi.string().trim().max(300).allow('', null),
});

export const lookupSchema = Joi.object({
  licensePlate: Joi.string().trim().min(4).max(20).required(),
});
