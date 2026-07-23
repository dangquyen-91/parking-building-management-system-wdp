import { Router } from 'express';
import {
  create,
  lookup,
  getMine,
  getAll,
  getOne,
  cancel,
  confirm,
} from '../controllers/booking.controller.js';
import { authenticate, authorize, optionalAuth } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createBookingSchema,
  lookupBookingSchema,
  cancelBookingSchema,
} from '../validations/booking.validation.js';

const router = Router();

router.post('/', optionalAuth, validate(createBookingSchema), create);
router.get('/check', validate(lookupBookingSchema, 'query'), lookup);
router.patch('/:id/cancel', optionalAuth, validate(cancelBookingSchema), cancel);
router.post('/:id/confirm', optionalAuth, validate(cancelBookingSchema), confirm);

router.get('/me', authenticate, getMine);

router.get('/', authenticate, authorize('admin', 'manager', 'staff'), getAll);
router.get('/:id', authenticate, authorize('admin', 'manager', 'staff'), getOne);

export default router;
