import { Router } from 'express';
import { handleWebhook } from '../controllers/subscription.controller.js';

const router = Router();

router.post('/payos', handleWebhook);

export default router;
