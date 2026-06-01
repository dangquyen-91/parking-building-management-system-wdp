import * as bookingService from '../services/booking.service.js';
import { success } from '../utils/response.js';

export const create = async (req, res, next) => {
  try {
    const result = await bookingService.create({
      ...req.body,
      userId: req.user?._id || null,
    });
    success(res, result, 'Booking created, awaiting payment', 201);
  } catch (err) {
    next(err);
  }
};

export const lookup = async (req, res, next) => {
  try {
    const result = await bookingService.lookup(req.query);
    success(res, result, 'Bookings retrieved by phone + plate');
  } catch (err) {
    next(err);
  }
};

export const getMine = async (req, res, next) => {
  try {
    const bookings = await bookingService.getMyBookings(req.user._id, req.query);
    success(res, { bookings }, 'My bookings retrieved');
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const result = await bookingService.getAll(req.query);
    success(res, result, 'Bookings retrieved');
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const booking = await bookingService.getById(req.params.id);
    success(res, { booking }, 'Booking retrieved');
  } catch (err) {
    next(err);
  }
};

export const cancel = async (req, res, next) => {
  try {
    const booking = await bookingService.cancel({
      id: req.params.id,
      userId: req.user?._id || null,
      phoneNumber: req.body?.phoneNumber,
      licensePlate: req.body?.licensePlate,
    });
    success(res, { booking }, 'Booking cancelled');
  } catch (err) {
    next(err);
  }
};
