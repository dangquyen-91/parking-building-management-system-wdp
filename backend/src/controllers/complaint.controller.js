import * as complaintService from '../services/complaint.service.js';
import { success } from '../utils/response.js';

export const create = async (req, res, next) => {
  try {
    const result = await complaintService.create({ ...req.body, userId: req.user._id });
    success(res, result, 'Complaint filed', 201);
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const result = await complaintService.getAll(req.query);
    success(res, result, 'Complaints retrieved');
  } catch (err) {
    next(err);
  }
};

export const getMine = async (req, res, next) => {
  try {
    const complaints = await complaintService.getMine(req.user._id, req.query);
    success(res, { complaints }, 'My complaints retrieved');
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const complaint = await complaintService.getById(req.params.id);
    success(res, { complaint }, 'Complaint retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const complaint = await complaintService.updateStatus(req.params.id, req.body, req.user._id);
    success(res, { complaint }, 'Complaint status updated');
  } catch (err) {
    next(err);
  }
};
