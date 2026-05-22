import { Router } from 'express';
import { checkIn, getActiveSessions, getOne, lookup } from '../controllers/session.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { noCache, privateCache } from '../middlewares/cache.middleware.js';
import { checkInSchema, lookupSchema } from '../validations/session.validation.js';

const router = Router();

router.use(authenticate);

router.post('/check-in', authorize('admin', 'staff'), noCache, validate(checkInSchema), checkIn);

// Must be before /:id to avoid being treated as an id param
router.get('/lookup', authorize('admin', 'manager', 'staff'), noCache, validate(lookupSchema, 'query'), lookup);

router.get('/', authorize('admin', 'manager', 'staff'), privateCache(15), getActiveSessions);
router.get('/:id', authorize('admin', 'manager', 'staff'), privateCache(15), getOne);

export default router;
