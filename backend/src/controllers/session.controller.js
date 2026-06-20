import * as sessionService from '../services/session.service.js';
import * as anprService from '../services/anpr.service.js';
import { success } from '../utils/response.js';


export const requestEntryQR = async (req, res, next) => {
  try {
    const result = await sessionService.requestEntryQR(req.body.licensePlate);
    success(res, result, 'Entry ticket QR generated');
  } catch (err) {
    next(err);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const result = await sessionService.checkIn({
      ...req.body,
      staffId: req.user._id,
    });
    success(res, result, 'Vehicle checked in successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getActiveSessions = async (req, res, next) => {
  try {
    const result = await sessionService.getActiveSessions(req.query);
    success(res, result, 'Active sessions retrieved');
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const session = await sessionService.getById(req.params.id);
    success(res, { session }, 'Session retrieved');
  } catch (err) {
    next(err);
  }
};

export const lookup = async (req, res, next) => {
  try {
    const result = await sessionService.lookup(req.query.licensePlate);
    success(res, result, 'License plate lookup result');
  } catch (err) {
    next(err);
  }
};

export const previewCheckout = async (req, res, next) => {
  try {
    const result = await sessionService.previewCheckout(req.params.id);
    success(res, result, 'Checkout preview');
  } catch (err) {
    next(err);
  }
};

export const checkOutCash = async (req, res, next) => {
  try {
    const session = await sessionService.checkOutCash(req.params.id, req.user._id, req.body);
    success(res, { session }, 'Vehicle checked out (cash) successfully');
  } catch (err) {
    next(err);
  }
};

export const checkOutTransfer = async (req, res, next) => {
  try {
    const result = await sessionService.checkOutTransfer(req.params.id, req.user._id, req.body);
    success(res, result, 'PayOS payment link created for transfer');
  } catch (err) {
    next(err);
  }
};

export const confirmCheckout = async (req, res, next) => {
  try {
    const session = await sessionService.confirmCheckout(req.params.id);
    success(res, { session }, 'Checkout payment confirmed');
  } catch (err) {
    next(err);
  }
};

export const scanPlate = async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ status: 'fail', message: 'image (base64) is required' });
    }
    const result = await anprService.readLicensePlate(image);
    success(res, { result }, result ? 'License plate detected' : 'No plate detected');
  } catch (err) {
    next(err);
  }
};

export const getSessionQR = async (req, res, next) => {
  try {
    const result = await sessionService.getSessionQR(req.params.id);
    success(res, result, 'QR code retrieved');
  } catch (err) {
    next(err);
  }
};

export const verifyQR = async (req, res, next) => {
  try {
    const result = await sessionService.verifyQR(req.body);
    success(res, result, 'QR verified — proceed to checkout');
  } catch (err) {
    next(err);
  }
};
