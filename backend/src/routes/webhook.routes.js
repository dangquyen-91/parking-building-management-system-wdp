import { Router } from 'express';
import { handleWebhook } from '../controllers/subscription.controller.js';
import { noCache } from '../middlewares/cache.middleware.js';

const router = Router();

router.post('/payos', noCache, handleWebhook);

export default router;
