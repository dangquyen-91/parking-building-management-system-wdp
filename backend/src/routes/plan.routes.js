import { Router } from 'express';
import { getAll, getOne, create, update, remove } from '../controllers/plan.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createPlanSchema, updatePlanSchema } from '../validations/plan.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', authorize('admin', 'manager'), validate(createPlanSchema), create);
router.patch('/:id', authorize('admin', 'manager'), validate(updatePlanSchema), update);
router.delete('/:id', authorize('admin', 'manager'), remove);

export default router;
