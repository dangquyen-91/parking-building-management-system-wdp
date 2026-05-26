import { Router } from 'express';
import { getAll, getMe, updateMe, getOne, update, changeRole, updateStatus } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { privateCache, noCache } from '../middlewares/cache.middleware.js';
import {
  updateMeSchema,
  updateUserSchema,
  changeRoleSchema,
  updateStatusSchema,
} from '../validations/user.validation.js';

const router = Router();

router.use(authenticate);

router.get('/me', privateCache(60), getMe);
router.patch('/me', noCache, validate(updateMeSchema), updateMe);

router.get('/', authorize('admin', 'manager'), privateCache(30), getAll);
router.get('/:id', authorize('admin', 'manager'), privateCache(30), getOne);

router.patch('/:id', authorize('admin'), noCache, validate(updateUserSchema), update);
router.patch('/:id/role', authorize('admin'), noCache, validate(changeRoleSchema), changeRole);
router.patch('/:id/status', authorize('admin'), noCache, validate(updateStatusSchema), updateStatus);

export default router;
