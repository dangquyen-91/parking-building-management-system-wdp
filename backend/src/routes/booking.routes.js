import { Router } from 'express';
import {
  create,
  lookup,
  getMine,
  getAll,
  getOne,
  cancel,
} from '../controllers/booking.controller.js';
import { authenticate, authorize, optionalAuth } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { noCache, privateCache } from '../middlewares/cache.middleware.js';
import {
  createBookingSchema,
  lookupBookingSchema,
  cancelBookingSchema,
} from '../validations/booking.validation.js';

const router = Router();

router.post('/', optionalAuth, noCache, validate(createBookingSchema), create);
router.get('/check', noCache, validate(lookupBookingSchema, 'query'), lookup);
router.patch('/:id/cancel', optionalAuth, noCache, validate(cancelBookingSchema), cancel);

router.get('/me', authenticate, noCache, getMine);

router.get('/', authenticate, authorize('admin', 'manager', 'staff'), privateCache(30), getAll);
router.get('/:id', authenticate, authorize('admin', 'manager', 'staff'), privateCache(30), getOne);

export default router;
