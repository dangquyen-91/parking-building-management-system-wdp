import { Router } from 'express';
import { getAll, getOne, update, remove } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin'), getAll);
router.get('/:id', authorize('admin', 'staff'), getOne);
router.patch('/:id', authorize('admin'), update);
router.delete('/:id', authorize('admin'), remove);

export default router;
