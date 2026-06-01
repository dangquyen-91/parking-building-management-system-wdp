import { Router } from 'express';
import {
  getDashboard,
  getRevenue,
  getSessionStats,
  getOccupancy,
  getPeakHours,
} from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { privateCache } from '../middlewares/cache.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin', 'manager'));

router.get('/dashboard', privateCache(30), getDashboard);
router.get('/revenue', privateCache(60), getRevenue);
router.get('/sessions', privateCache(60), getSessionStats);
router.get('/occupancy', privateCache(15), getOccupancy);
router.get('/peak-hours', privateCache(60), getPeakHours);

export default router;
