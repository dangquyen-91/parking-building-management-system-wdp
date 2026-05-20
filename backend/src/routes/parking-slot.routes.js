import { Router } from 'express';
import { getAll, getOne, create, bulkCreate, update, remove } from '../controllers/parking-slot.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { privateCache, noCache } from '../middlewares/cache.middleware.js';
import {
  createSlotSchema,
  bulkCreateSchema,
  updateSlotSchema,
} from '../validations/parking-slot.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'manager', 'staff'), privateCache(30), getAll);
router.get('/:id', authorize('admin', 'manager', 'staff'), privateCache(30), getOne);

router.post('/', authorize('admin', 'manager'), noCache, validate(createSlotSchema), create);
router.post('/bulk', authorize('admin', 'manager'), noCache, validate(bulkCreateSchema), bulkCreate);

// Staff can update status (e.g. mark maintenance), admin/manager can do everything
router.patch('/:id', authorize('admin', 'manager', 'staff'), noCache, validate(updateSlotSchema), update);
router.delete('/:id', authorize('admin', 'manager'), noCache, remove);

export default router;
