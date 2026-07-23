import Joi from 'joi';
import { ROLES } from '../constants/roles.js';

const phonePattern = /^[0-9+\-\s]{7,15}$/;
const platePattern = /^[A-Z0-9\-\.]{4,12}$/;
const cccdPattern = /^[0-9]{12}$/;

const minDob = new Date();
minDob.setFullYear(minDob.getFullYear() - 100);
const maxDob = new Date();
maxDob.setFullYear(maxDob.getFullYear() - 16);

export const updateMeSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100),
  phone: Joi.string().trim().pattern(phonePattern).messages({
    'string.pattern.base': 'Phone number is invalid',
  }),
  email: Joi.string().email().lowercase().trim(),
  cccd: Joi.string().trim().pattern(cccdPattern).messages({
    'string.pattern.base': 'CCCD must be exactly 12 digits',
  }),
  dateOfBirth: Joi.date().min(minDob).max(maxDob).messages({
    'date.min': 'Date of birth is not valid',
    'date.max': 'Must be at least 16 years old',
  }),
  gender: Joi.string().valid('male', 'female', 'other'),
  address: Joi.string().trim().max(255),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string().min(8).max(128).required().messages({
    'string.min': 'New password must be at least 8 characters',
    'any.required': 'New password is required',
  }),
});

export const addVehicleSchema = Joi.object({
  licensePlate: Joi.string()
    .trim()
    .uppercase()
    .pattern(platePattern)
    .required()
    .messages({
      'string.pattern.base': 'License plate is invalid',
      'any.required': 'License plate is required',
    }),
  vehicleType: Joi.string().valid('motorcycle', 'car').required().messages({
    'any.only': 'Vehicle type must be motorcycle or car',
    'any.required': 'Vehicle type is required',
  }),
});

export const updateUserSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100),
  email: Joi.string().email().lowercase().trim(),
  phone: Joi.string().trim().pattern(phonePattern).messages({
    'string.pattern.base': 'Phone number is invalid',
  }),
  cccd: Joi.string().trim().pattern(cccdPattern).messages({
    'string.pattern.base': 'CCCD must be exactly 12 digits',
  }),
  dateOfBirth: Joi.date().min(minDob).max(maxDob).messages({
    'date.min': 'Date of birth is not valid',
    'date.max': 'Must be at least 16 years old',
  }),
  gender: Joi.string().valid('male', 'female', 'other'),
  address: Joi.string().trim().max(255),
});

export const changeRoleSchema = Joi.object({
  role: Joi.string()
    .valid(...ROLES)
    .required()
    .messages({
      'any.only': `Role must be one of: ${ROLES.join(', ')}`,
    }),
});

export const updateStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});
