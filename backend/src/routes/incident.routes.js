import { Router } from 'express';
import { getAll, getOne } from '../controllers/incident.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Incidents are reviewed by management only (staff create them via checkout).
router.use(authenticate);
router.use(authorize('admin', 'manager'));

router.get('/', getAll);
router.get('/:id', getOne);

export default router;
