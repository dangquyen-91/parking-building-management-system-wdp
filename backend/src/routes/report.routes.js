import { Router } from 'express';
import {
  getDashboard,
  getRevenue,
  getRevenueByVehicleType,
  getRevenueComparison,
  getSessionStats,
  getSubscriptionStats,
  getBookingStats,
  getOccupancy,
  getOccupancyTrend,
  getPeakHours,
  getStaffReport,
} from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin', 'manager'));

router.get('/dashboard', getDashboard);

router.get('/revenue', getRevenue);
router.get('/revenue/by-vehicle', getRevenueByVehicleType);
router.get('/revenue/comparison', getRevenueComparison);

router.get('/sessions', getSessionStats);

router.get('/subscriptions', getSubscriptionStats);

router.get('/bookings', getBookingStats);

router.get('/occupancy', getOccupancy);
router.get('/occupancy/trend', getOccupancyTrend);

router.get('/peak-hours', getPeakHours);

router.get('/staff', authorize('admin', 'manager'), getStaffReport);

export default router;
