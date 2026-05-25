import ParkingRow from '../models/parking-row.model.js';
import ParkingSession from '../models/parking-session.model.js';
import Floor from '../models/floor.model.js';
import AppError from '../utils/appError.js';
import { ROW_STATUSES } from '../models/parking-row.model.js';

const ROW_SORT_FIELDS = ['rowCode', 'capacity', 'occupiedCount', 'status', 'createdAt'];

export const getAll = async ({
  page = 1,
  limit = 10,
  floorId,
  buildingId,
  status,
  sortBy = 'rowCode',
  sortOrder = 'asc',
} = {}) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const filter = {};
  if (floorId) {
    filter.floorId = floorId;
  } else if (buildingId) {
    const floors = await Floor.find({ buildingId }).select('_id');
    filter.floorId = { $in: floors.map((f) => f._id) };
  }
  if (status) {
    if (!ROW_STATUSES.includes(status))
      throw new AppError(`Invalid status. Must be one of: ${ROW_STATUSES.join(', ')}`, 400);
    filter.status = status;
  }

  const sortField = ROW_SORT_FIELDS.includes(sortBy) ? sortBy : 'rowCode';
  const sortDir = sortOrder.toLowerCase() === 'desc' ? -1 : 1;

  const [rows, total] = await Promise.all([
    ParkingRow.find(filter)
      .populate({
        path: 'floorId',
        select: 'floorNumber vehicleType totalSlots buildingId',
        populate: { path: 'buildingId', select: 'name address' },
      })
      .sort({ [sortField]: sortDir })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    ParkingRow.countDocuments(filter),
  ]);

  return { rows, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
};

export const getById = async (id) => {
  const row = await ParkingRow.findById(id).populate({
    path: 'floorId',
    select: 'floorNumber vehicleType totalSlots buildingId',
    populate: { path: 'buildingId', select: 'name address' },
  });
  if (!row) throw new AppError('Parking row not found', 404);
  return row;
};

export const create = async ({ floorId, rowCode, capacity, note }) => {
  const floor = await Floor.findById(floorId).populate('buildingId', 'isActive');
  if (!floor) throw new AppError('Floor not found', 404);
  if (!floor.isActive) throw new AppError('Floor is inactive', 400);
  if (!floor.buildingId?.isActive) throw new AppError('Building is inactive', 400);
  if (floor.vehicleType !== 'motorcycle') {
    throw new AppError('Parking rows can only be created on motorcycle floors', 400);
  }

  const existing = await ParkingRow.findOne({ floorId, rowCode: rowCode.trim() });
  if (existing) throw new AppError(`Row code "${rowCode}" already exists on this floor`, 409);

  const capacityAgg = await ParkingRow.aggregate([
    { $match: { floorId: floor._id } },
    { $group: { _id: null, total: { $sum: '$capacity' } } },
  ]);
  const usedCapacity = capacityAgg[0]?.total || 0;
  if (usedCapacity + capacity > floor.totalSlots) {
    throw new AppError(
      `Floor capacity exceeded. Used: ${usedCapacity}, adding: ${capacity}, max: ${floor.totalSlots}`,
      409
    );
  }

  return ParkingRow.create({
    floorId,
    rowCode: rowCode.trim(),
    capacity,
    occupiedCount: 0,
    status: 'available',
    note: note || null,
  });
};

export const update = async (id, { rowCode, capacity, note }) => {
  const row = await ParkingRow.findById(id);
  if (!row) throw new AppError('Parking row not found', 404);

  const data = {};

  if (rowCode !== undefined) {
    data.rowCode = rowCode.trim();
    const conflict = await ParkingRow.findOne({ floorId: row.floorId, rowCode: data.rowCode });
    if (conflict && conflict._id.toString() !== id) {
      throw new AppError(`Row code "${data.rowCode}" already exists on this floor`, 409);
    }
  }

  if (capacity !== undefined) {
    if (capacity < row.occupiedCount) {
      throw new AppError(
        `Cannot reduce capacity to ${capacity}: ${row.occupiedCount} motorcycles currently parked`,
        409
      );
    }

    // Check tổng capacity của floor sau khi update
    const floor = await Floor.findById(row.floorId);
    const capacityAgg = await ParkingRow.aggregate([
      { $match: { floorId: floor._id, _id: { $ne: row._id } } },
      { $group: { _id: null, total: { $sum: '$capacity' } } },
    ]);
    const otherCapacity = capacityAgg[0]?.total || 0;
    if (otherCapacity + capacity > floor.totalSlots) {
      throw new AppError(
        `Floor capacity exceeded. Other rows: ${otherCapacity}, updating to: ${capacity}, max: ${floor.totalSlots}`,
        409
      );
    }

    data.capacity = capacity;
    if (capacity <= row.occupiedCount) data.status = 'full';
    else if (row.status === 'full') data.status = 'available';
  }

  if (note !== undefined) data.note = note;

  Object.assign(row, data);
  return row.save();
};

export const updateStatus = async (id, status, note) => {
  const row = await ParkingRow.findById(id);
  if (!row) throw new AppError('Parking row not found', 404);

  const updateData = { status };
  if (note !== undefined) updateData.note = note;
  Object.assign(row, updateData);
  return row.save();
};

export const remove = async (id) => {
  const row = await ParkingRow.findById(id);
  if (!row) throw new AppError('Parking row not found', 404);

  const activeSession = await ParkingSession.exists({ rowId: id, status: 'active' });
  if (activeSession) throw new AppError('Cannot delete row with an active parking session', 409);

  await row.deleteOne();
};
