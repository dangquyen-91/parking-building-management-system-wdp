import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import * as rowController from '../controllers/parking-row.controller.js';
import {
  createParkingRowSchema,
  updateParkingRowSchema,
  updateRowStatusSchema,
} from '../validations/parking-row.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', rowController.getAll);
router.get('/:id', rowController.getOne);

router.patch('/:id/status', authorize('admin', 'manager', 'staff'), validate(updateRowStatusSchema), rowController.updateStatus);

router.post('/', authorize('admin', 'manager'), validate(createParkingRowSchema), rowController.create);
router.patch('/:id', authorize('admin', 'manager'), validate(updateParkingRowSchema), rowController.update);
router.delete('/:id', authorize('admin'), rowController.remove);

export default router;
