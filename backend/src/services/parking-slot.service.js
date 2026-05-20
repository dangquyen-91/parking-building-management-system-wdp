import ParkingSlot from '../models/parking-slot.model.js';
import Floor from '../models/floor.model.js';
import AppError from '../utils/appError.js';

export const getAll = async ({ floorId, status, vehicleType, page = 1, limit = 50 }) => {
  const filter = {};
  if (floorId) filter.floorId = floorId;
  if (status) filter.status = status;
  if (vehicleType) filter.vehicleType = vehicleType;

  const skip = (Number(page) - 1) * Number(limit);
  const [slots, total] = await Promise.all([
    ParkingSlot.find(filter)
      .populate('floorId', 'floorNumber vehicleType buildingId')
      .skip(skip)
      .limit(Number(limit))
      .sort({ slotCode: 1 }),
    ParkingSlot.countDocuments(filter),
  ]);
  return { slots, total, page: Number(page), limit: Number(limit) };
};

export const getById = async (id) => {
  const slot = await ParkingSlot.findById(id).populate('floorId', 'floorNumber vehicleType buildingId');
  if (!slot) throw new AppError('Parking slot not found', 404);
  return slot;
};

export const create = async (data) => {
  const floor = await Floor.findById(data.floorId);
  if (!floor) throw new AppError('Floor not found', 404);
  if (!floor.isActive) throw new AppError('Floor is inactive', 400);
  return ParkingSlot.create({ ...data, vehicleType: floor.vehicleType });
};

export const bulkCreate = async ({ floorId, quantity }) => {
  const floor = await Floor.findById(floorId);
  if (!floor) throw new AppError('Floor not found', 404);
  if (!floor.isActive) throw new AppError('Floor is inactive', 400);

  const existing = await ParkingSlot.countDocuments({ floorId });
  const slots = Array.from({ length: quantity }, (_, i) => ({
    floorId,
    slotCode: `F${floor.floorNumber}-${String(existing + i + 1).padStart(3, '0')}`,
    vehicleType: floor.vehicleType,
    status: 'empty',
  }));

  return ParkingSlot.insertMany(slots);
};

export const update = async (id, data) => {
  const slot = await ParkingSlot.findById(id);
  if (!slot) throw new AppError('Parking slot not found', 404);
  if (data.status === 'empty' && slot.status === 'occupied') {
    throw new AppError('Cannot manually set occupied slot to empty — use check-out instead', 400);
  }
  return ParkingSlot.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const remove = async (id) => {
  const slot = await ParkingSlot.findById(id);
  if (!slot) throw new AppError('Parking slot not found', 404);
  if (slot.status === 'occupied') throw new AppError('Cannot delete an occupied slot', 400);
  await slot.deleteOne();
};
