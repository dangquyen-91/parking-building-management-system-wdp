import Joi from 'joi';
import { COMPLAINT_STATUSES } from '../models/complaint.model.js';

export const createComplaintSchema = Joi.object({
  slotId: Joi.string().hex().length(24).required(),
  offendingPlate: Joi.string().trim().min(4).max(20).required(),
  description: Joi.string().trim().max(500).allow('', null),
});

export const updateComplaintStatusSchema = Joi.object({
  status: Joi.string().valid(...COMPLAINT_STATUSES).required(),
  resolutionNote: Joi.string().trim().max(500).allow('', null),
});
