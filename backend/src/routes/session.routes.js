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
  checkOutLostQr,
  confirmCheckout,
  scanPlate,
  getSessionQR,
  verifyQR,
} from '../controllers/session.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  checkInSchema,
  lookupSchema,
  verifyQRSchema,
  scanPlateSchema,
  checkoutSchema,
  lostQrCheckoutSchema,
  requestEntryQRSchema,
} from '../validations/session.validation.js';

const router = Router();

router.use(authenticate);

router.post('/entry-qr', authorize('admin', 'staff'), validate(requestEntryQRSchema), requestEntryQR);

router.post('/check-in', authorize('admin', 'staff'), validate(checkInSchema), checkIn);

router.post('/scan-plate', authorize('admin', 'manager', 'staff'), validate(scanPlateSchema), scanPlate);

router.post('/verify-qr', authorize('admin', 'manager', 'staff'), validate(verifyQRSchema), verifyQR);

router.get('/lookup', authorize('admin', 'manager', 'staff'), validate(lookupSchema, 'query'), lookup);

router.get('/:id/checkout/preview', authorize('admin', 'manager', 'staff'), previewCheckout);
router.post('/:id/checkout/cash', authorize('admin', 'staff'), validate(checkoutSchema), checkOutCash);
router.post('/:id/checkout/transfer', authorize('admin', 'staff'), validate(checkoutSchema), checkOutTransfer);
router.post('/:id/checkout/confirm', authorize('admin', 'staff'), confirmCheckout);
router.post('/:id/checkout/lost-qr', authorize('admin', 'staff'), validate(lostQrCheckoutSchema), checkOutLostQr);

router.get('/', authorize('admin', 'manager', 'staff'), getActiveSessions);
router.get('/:id/qr', authorize('admin', 'manager', 'staff'), getSessionQR);
router.get('/:id', authorize('admin', 'manager', 'staff'), getOne);

export default router;
