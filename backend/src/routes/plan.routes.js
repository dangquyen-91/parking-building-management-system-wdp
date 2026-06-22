import { Router } from 'express';
import { getAll, getOne, update } from '../controllers/plan.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { updatePlanSchema } from '../validations/plan.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', getAll);
router.get('/:id', getOne);
router.patch('/:id', authorize('admin', 'manager'), validate(updatePlanSchema), update);

export default router;
