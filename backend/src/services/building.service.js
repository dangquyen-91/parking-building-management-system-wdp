import Building from '../models/building.model.js';
import Floor from '../models/floor.model.js';
import AppError from '../utils/appError.js';

const SORTABLE_FIELDS = ['name', 'address', 'createdAt'];

export const getAll = async ({ page = 1, limit = 10, isActive, sort, order }) => {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const sortField = SORTABLE_FIELDS.includes(sort) ? sort : 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;

  const skip = (Number(page) - 1) * Number(limit);
  const [buildings, total] = await Promise.all([
    Building.find(filter).skip(skip).limit(Number(limit)).sort({ [sortField]: sortOrder }),
    Building.countDocuments(filter),
  ]);
  return { buildings, total, page: Number(page), limit: Number(limit) };
};

export const getById = async (id) => {
  const building = await Building.findById(id);
  if (!building) throw new AppError('Building not found', 404);
  return building;
};

export const create = async (data) => Building.create(data);

export const update = async (id, data) => {
  const building = await Building.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!building) throw new AppError('Building not found', 404);
  return building;
};

export const remove = async (id) => {
  const hasFloors = await Floor.exists({ buildingId: id, isActive: true });
  if (hasFloors) throw new AppError('Cannot delete building that still has active floors', 400);
  const building = await Building.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!building) throw new AppError('Building not found', 404);
  return building;
};
