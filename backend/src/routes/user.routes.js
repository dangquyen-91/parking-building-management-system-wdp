import { Router } from 'express';
import {
  getAll,
  getMe,
  updateMe,
  changePassword,
  addVehicle,
  removeVehicle,
  getOne,
  update,
  changeRole,
  updateStatus,
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  updateMeSchema,
  changePasswordSchema,
  addVehicleSchema,
  updateUserSchema,
  changeRoleSchema,
  updateStatusSchema,
} from '../validations/user.validation.js';

const router = Router();

router.use(authenticate);

// Profile
router.get('/me', getMe);
router.patch('/me', validate(updateMeSchema), updateMe);
router.patch('/me/password', validate(changePasswordSchema), changePassword);

// Vehicles
router.post('/me/vehicles', validate(addVehicleSchema), addVehicle);
router.delete('/me/vehicles/:vehicleId', removeVehicle);

// Admin / Manager
router.get('/', authorize('admin', 'manager'), getAll);
router.get('/:id', authorize('admin', 'manager'), getOne);

router.patch('/:id', authorize('admin', 'manager'), validate(updateUserSchema), update);
router.patch('/:id/role', authorize('admin'), validate(changeRoleSchema), changeRole);
router.patch('/:id/status', authorize('admin', 'manager'), validate(updateStatusSchema), updateStatus);

export default router;
