import Joi from 'joi';

// Vietnamese plate after normalizing (uppercase, no spaces): 2-digit province +
// 1-2 letters + 4-5 digits, optional dash and ".dd" suffix. e.g. 51F-12345, 30E-123.45
const PLATE_RE = /^\d{2}[A-Z]{1,2}-?\d{3,5}(\.\d{2})?$/;
// Vietnamese mobile: 10 digits starting with 0 (03/05/07/08/09...).
const PHONE_RE = /^0\d{9}$/;

const licensePlate = Joi.string()
  .trim()
  .custom((value, helpers) => {
    const normalized = value.toUpperCase().replace(/\s/g, '');
    return PLATE_RE.test(normalized) ? value : helpers.error('any.invalid');
  })
  .messages({ 'any.invalid': 'Biển số xe không hợp lệ (ví dụ: 51F-12345).' });

const phone = Joi.string()
  .trim()
  .pattern(PHONE_RE)
  .messages({ 'string.pattern.base': 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).' });

export const createBookingSchema = Joi.object({
  email: Joi.string().email().trim().max(254).required(),
  phone: phone.required(),
  licensePlate: licensePlate.required(),
  expectedArrivalTime: Joi.date().iso().required(),
  expectedExitTime: Joi.date().iso().greater(Joi.ref('expectedArrivalTime')).required().messages({
    'date.greater': 'Giờ ra dự kiến phải sau giờ đến.',
  }),
});

export const lookupBookingSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  licensePlate: Joi.string().trim().min(4).max(20).required(),
});

export const cancelBookingSchema = Joi.object({
  email: Joi.string().email().trim(),
  licensePlate: Joi.string().trim().min(4).max(20),
});
