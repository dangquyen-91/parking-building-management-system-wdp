import * as lprService from '../services/lpr.service.js';
import { success } from '../utils/response.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';

export const recognizeAndLookup = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('Image file is required', 400);

    const lprResult = await lprService.callLprService(req.file.buffer, req.file.mimetype);

    if (!lprResult.license_plate) {
      await lprService.saveScanLog({
        lprResult,
        lookup: { activeSession: null, activeSubscription: null, paidBooking: null },
        staffId: req.user._id,
      });

      return success(res, {
        licensePlate: null,
        confidence: lprResult.confidence ?? 0,
        processingTimeMs: lprResult.processing_time_ms ?? 0,
      }, 'No license plate detected in image');
    }

    logger.info('LPR plate recognized', {
      plate: lprResult.license_plate,
      confidence: lprResult.confidence,
      ms: lprResult.processing_time_ms,
    });

    const lookup = await lprService.lookupByPlate(lprResult.license_plate);

    await lprService.saveScanLog({ lprResult, lookup, staffId: req.user._id });

    return success(res, {
      licensePlate: lprResult.license_plate,
      confidence: lprResult.confidence,
      bbox: lprResult.bbox ?? null,
      processingTimeMs: lprResult.processing_time_ms ?? 0,
      activeSession: lookup.activeSession,
      activeSubscription: lookup.activeSubscription,
      paidBooking: lookup.paidBooking,
    }, 'License plate recognized');
  } catch (err) {
    next(err);
  }
};

export const getLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, licensePlate } = req.query;
    const result = await lprService.getLogs({
      page: Number(page),
      limit: Number(limit),
      licensePlate,
    });
    success(res, result, 'LPR scan logs retrieved');
  } catch (err) {
    next(err);
  }
};
