import { Router } from 'express';
import {
  getDashboard,
  getRevenue,
  getSessionStats,
  getOccupancy,
  getPeakHours,
} from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin', 'manager'));

router.get('/dashboard', getDashboard);
router.get('/revenue', getRevenue);
router.get('/sessions', getSessionStats);
router.get('/occupancy', getOccupancy);
router.get('/peak-hours', getPeakHours);

export default router;
