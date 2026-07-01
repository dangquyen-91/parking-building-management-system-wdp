import Incident from '../models/incident.model.js';
import AppError from '../utils/appError.js';

const INCIDENT_POPULATE = [
  { path: 'staffId', select: 'fullName email' },
  { path: 'sessionId', select: 'licensePlate vehicleType entryTime exitTime fee' },
];

export const getAll = async ({ page = 1, limit = 20, type, licensePlate } = {}) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const filter = {};
  if (type) filter.type = type;
  if (licensePlate) filter.licensePlate = new RegExp(licensePlate.toUpperCase(), 'i');

  const skip = (pageNum - 1) * limitNum;
  const [incidents, total] = await Promise.all([
    Incident.find(filter).populate(INCIDENT_POPULATE).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
    Incident.countDocuments(filter),
  ]);
  return { incidents, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
};

export const getById = async (id) => {
  const incident = await Incident.findById(id).populate(INCIDENT_POPULATE);
  if (!incident) throw new AppError('Incident not found', 404);
  return incident;
};
