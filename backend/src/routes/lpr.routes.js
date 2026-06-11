import { Router } from 'express';
import multer from 'multer';
import { recognizeAndLookup, getLogs } from '../controllers/lpr.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { noCache, privateCache } from '../middlewares/cache.middleware.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are accepted'));
    } else {
      cb(null, true);
    }
  },
});

router.use(authenticate);

router.post('/recognize', authorize('admin', 'staff'), noCache, upload.single('image'), recognizeAndLookup);

router.get('/logs', authorize('admin', 'manager', 'staff'), privateCache(15), getLogs);

export default router;
