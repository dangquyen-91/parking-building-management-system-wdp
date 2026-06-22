import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authLimiter, refreshLimiter } from '../middlewares/rate-limit.middleware.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh-token', refreshLimiter, refresh);
router.post('/logout', authenticate, logout);

export default router;
