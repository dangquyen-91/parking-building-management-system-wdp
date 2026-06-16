import { Router } from 'express';
import {
  requestEntryQR,
  checkIn,
  getActiveSessions,
  getOne,
  lookup,
  previewCheckout,
  checkOutCash,
  checkOutTransfer,
  scanPlate,
  getSessionQR,
  verifyQR,
} from '../controllers/session.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { noCache, privateCache } from '../middlewares/cache.middleware.js';
import {
  checkInSchema,
  lookupSchema,
  verifyQRSchema,
  scanPlateSchema,
  checkoutSchema,
  requestEntryQRSchema,
} from '../validations/session.validation.js';

const router = Router();

router.use(authenticate);

router.post('/entry-qr', authorize('admin', 'staff'), noCache, validate(requestEntryQRSchema), requestEntryQR);

router.post('/check-in', authorize('admin', 'staff'), noCache, validate(checkInSchema), checkIn);

router.post('/scan-plate', authorize('admin', 'manager', 'staff'), noCache, validate(scanPlateSchema), scanPlate);

router.post('/verify-qr', authorize('admin', 'manager', 'staff'), noCache, validate(verifyQRSchema), verifyQR);

router.get('/lookup', authorize('admin', 'manager', 'staff'), noCache, validate(lookupSchema, 'query'), lookup);

router.get('/:id/checkout/preview', authorize('admin', 'manager', 'staff'), noCache, previewCheckout);
router.post('/:id/checkout/cash', authorize('admin', 'staff'), noCache, validate(checkoutSchema), checkOutCash);
router.post('/:id/checkout/transfer', authorize('admin', 'staff'), noCache, validate(checkoutSchema), checkOutTransfer);

router.get('/', authorize('admin', 'manager', 'staff'), privateCache(15), getActiveSessions);
router.get('/:id/qr', authorize('admin', 'manager', 'staff'), noCache, getSessionQR);
router.get('/:id', authorize('admin', 'manager', 'staff'), privateCache(15), getOne);

export default router;
