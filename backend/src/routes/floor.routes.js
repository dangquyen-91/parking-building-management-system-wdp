import { Router } from 'express';
import { getAll, getOne, getOccupancy, create, update, remove } from '../controllers/floor.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createFloorSchema, updateFloorSchema } from '../validations/floor.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'manager'), getAll);
router.get('/occupancy', authorize('admin', 'manager'), getOccupancy);
router.get('/:id', authorize('admin', 'manager'), getOne);
router.post('/', authorize('admin', 'manager'), validate(createFloorSchema), create);
router.patch('/:id', authorize('admin', 'manager'), validate(updateFloorSchema), update);
router.delete('/:id', authorize('admin', 'manager'), remove);

export default router;
