import { Router } from 'express';
import { getAll, getOne, create, update, remove } from '../controllers/building.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { privateCache, noCache } from '../middlewares/cache.middleware.js';
import { createBuildingSchema, updateBuildingSchema } from '../validations/building.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'manager', 'staff'), privateCache(60), getAll);
router.get('/:id', authorize('admin', 'manager', 'staff'), privateCache(60), getOne);
router.post('/', authorize('admin', 'manager'), noCache, validate(createBuildingSchema), create);
router.patch('/:id', authorize('admin', 'manager'), noCache, validate(updateBuildingSchema), update);
router.delete('/:id', authorize('admin'), noCache, remove);

export default router;
