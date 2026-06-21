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
import { purchaseSchema } from '../validations/subscription.validation.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(purchaseSchema), purchase);
router.get('/me', getMine);
router.patch('/:id/cancel', cancel);
router.post('/:id/confirm', confirm);

router.get('/', authorize('admin', 'manager', 'staff'), getAll);
router.get('/:id/qr', getQR);
router.get('/:id', authorize('admin', 'manager', 'staff'), getOne);

export default router;
