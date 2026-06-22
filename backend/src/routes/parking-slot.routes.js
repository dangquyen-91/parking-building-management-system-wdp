import { Router } from 'express';
import {
  getAll,
  getOne,
  create,
  bulkCreate,
  update,
  remove,
  getAvailableForSubscription,
} from '../controllers/parking-slot.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createSlotSchema,
  bulkCreateSchema,
  updateSlotSchema,
} from '../validations/parking-slot.validation.js';

const router = Router();

router.use(authenticate);

router.get('/available-for-subscription', getAvailableForSubscription);

router.get('/', authorize('admin', 'manager', 'staff'), getAll);
router.get('/:id', authorize('admin', 'manager', 'staff'), getOne);

router.post('/', authorize('admin', 'manager'), validate(createSlotSchema), create);
router.post('/bulk', authorize('admin', 'manager'), validate(bulkCreateSchema), bulkCreate);

router.patch('/:id', authorize('admin', 'manager', 'staff'), validate(updateSlotSchema), update);
router.delete('/:id', authorize('admin', 'manager'), remove);

export default router;
