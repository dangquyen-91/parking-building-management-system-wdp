import { Router } from 'express';
import {
  purchase,
  getMine,
  getAll,
  getOne,
  getQR,
  cancel,
  confirm,
} from '../controllers/subscription.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { noCache, privateCache } from '../middlewares/cache.middleware.js';
import { purchaseSchema } from '../validations/subscription.validation.js';

const router = Router();

router.use(authenticate);

router.post('/', noCache, validate(purchaseSchema), purchase);
router.get('/me', noCache, getMine);
router.patch('/:id/cancel', noCache, cancel);
router.post('/:id/confirm', noCache, confirm);

router.get('/', authorize('admin', 'manager', 'staff'), privateCache(30), getAll);
router.get('/:id/qr', noCache, getQR);
router.get('/:id', authorize('admin', 'manager', 'staff'), privateCache(30), getOne);

export default router;
