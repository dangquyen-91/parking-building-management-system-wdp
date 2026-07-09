import { Router } from 'express';
import {
  create,
  getAll,
  getMine,
  getOne,
  updateStatus,
} from '../controllers/complaint.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createComplaintSchema,
  updateComplaintStatusSchema,
} from '../validations/complaint.validation.js';

const router = Router();

router.use(authenticate);

// Resident files a complaint about their own slot being occupied.
router.post('/', validate(createComplaintSchema), create);
router.get('/me', getMine);

// Staff / manager / admin handle complaints.
router.get('/', authorize('admin', 'manager', 'staff'), getAll);
router.get('/:id', authorize('admin', 'manager', 'staff'), getOne);
router.patch('/:id/status', authorize('admin', 'manager', 'staff'), validate(updateComplaintStatusSchema), updateStatus);

export default router;
