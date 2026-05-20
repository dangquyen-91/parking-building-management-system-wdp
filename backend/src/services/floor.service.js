import Floor from '../models/floor.model.js';
import Building from '../models/building.model.js';
import ParkingSlot from '../models/parking-slot.model.js';
import AppError from '../utils/appError.js';

const SORTABLE_FIELDS = ['floorNumber', 'vehicleType', 'createdAt'];

export const getAll = async ({ buildingId, vehicleType, isActive, sort, order, page = 1, limit = 10 }) => {
  const filter = {};
  if (buildingId) filter.buildingId = buildingId;
  if (vehicleType) filter.vehicleType = vehicleType;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const sortField = SORTABLE_FIELDS.includes(sort) ? sort : 'floorNumber';
  const sortOrder = order === 'asc' ? 1 : -1;

  const skip = (Number(page) - 1) * Number(limit);
  const [floors, total] = await Promise.all([
    Floor.find(filter)
      .populate('buildingId', 'name address')
      .skip(skip)
      .limit(Number(limit))
      .sort({ [sortField]: sortOrder }),
    Floor.countDocuments(filter),
  ]);
  return { floors, total, page: Number(page), limit: Number(limit) };
};

export const getById = async (id) => {
  const floor = await Floor.findById(id).populate('buildingId', 'name address');
  if (!floor) throw new AppError('Floor not found', 404);

  const slotStats = await ParkingSlot.aggregate([
    { $match: { floorId: floor._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const stats = { empty: 0, occupied: 0, reserved: 0, maintenance: 0 };
  slotStats.forEach(({ _id, count }) => { stats[_id] = count; });

  return { ...floor.toObject(), slotStats: stats };
};

export const create = async (data) => {
  const building = await Building.findById(data.buildingId);
  if (!building) throw new AppError('Building not found', 404);
  if (!building.isActive) throw new AppError('Building is inactive', 400);
  return Floor.create(data);
};

export const update = async (id, data) => {
  const floor = await Floor.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!floor) throw new AppError('Floor not found', 404);
  return floor;
};

export const remove = async (id) => {
  const hasSlots = await ParkingSlot.exists({ floorId: id });
  if (hasSlots) throw new AppError('Cannot delete floor that still has parking slots', 400);
  const floor = await Floor.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!floor) throw new AppError('Floor not found', 404);
  return floor;
};
