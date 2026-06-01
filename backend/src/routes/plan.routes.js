import { Router } from 'express';
import { getAll, getOne, update } from '../controllers/plan.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { privateCache, noCache } from '../middlewares/cache.middleware.js';
import { updatePlanSchema } from '../validations/plan.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', privateCache(300), getAll);
router.get('/:id', privateCache(300), getOne);
router.patch('/:id', authorize('admin', 'manager'), noCache, validate(updatePlanSchema), update);

export default router;
