import { Router } from 'express';
import { getAll, getOne } from '../controllers/payment.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin', 'manager'));

router.get('/', getAll);
router.get('/:id', getOne);

export default router;
