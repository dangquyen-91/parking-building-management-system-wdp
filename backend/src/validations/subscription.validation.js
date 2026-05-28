import Joi from 'joi';

export const purchaseSchema = Joi.object({
  planId: Joi.string().hex().length(24).required(),
  licensePlate: Joi.string().trim().min(4).max(20).required(),
});
