import { Router } from 'express';
import { getAll, getOne, create, update, remove } from '../controllers/plan.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createPlanSchema, updatePlanSchema } from '../validations/plan.validation.js';

const router = Router();

// Public: guests can browse plans before deciding to buy (login is only
// required at purchase time via POST /subscriptions).
router.get('/', getAll);
router.get('/:id', getOne);

// Management: login + role required.
router.post('/', authenticate, authorize('admin', 'manager'), validate(createPlanSchema), create);
router.patch('/:id', authenticate, authorize('admin', 'manager'), validate(updatePlanSchema), update);
router.delete('/:id', authenticate, authorize('admin', 'manager'), remove);

export default router;
