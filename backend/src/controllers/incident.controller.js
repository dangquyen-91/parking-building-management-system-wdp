import * as incidentService from '../services/incident.service.js';
import { success } from '../utils/response.js';

export const getAll = async (req, res, next) => {
  try {
    const result = await incidentService.getAll(req.query);
    success(res, result, 'Incidents retrieved');
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const incident = await incidentService.getById(req.params.id);
    success(res, { incident }, 'Incident retrieved');
  } catch (err) {
    next(err);
  }
};
