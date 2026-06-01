import * as reportService from '../services/report.service.js';
import { success } from '../utils/response.js';

export const getDashboard = async (req, res, next) => {
  try {
    const result = await reportService.getDashboard();
    success(res, result, 'Dashboard report');
  } catch (err) {
    next(err);
  }
};

export const getRevenue = async (req, res, next) => {
  try {
    const result = await reportService.getRevenue(req.query);
    success(res, result, 'Revenue report');
  } catch (err) {
    next(err);
  }
};

export const getSessionStats = async (req, res, next) => {
  try {
    const result = await reportService.getSessionStats(req.query);
    success(res, result, 'Session stats report');
  } catch (err) {
    next(err);
  }
};

export const getOccupancy = async (req, res, next) => {
  try {
    const result = await reportService.getOccupancy();
    success(res, result, 'Occupancy report');
  } catch (err) {
    next(err);
  }
};

export const getPeakHours = async (req, res, next) => {
  try {
    const result = await reportService.getPeakHours(req.query);
    success(res, result, 'Peak hours report');
  } catch (err) {
    next(err);
  }
};
