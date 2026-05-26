import ParkingSlot from '../models/parking-slot.model.js';
import Floor from '../models/floor.model.js';
import Building from '../models/building.model.js';
import AppError from '../utils/appError.js';

const loadActiveFloor = async (floorId) => {
  const floor = await Floor.findById(floorId).populate('buildingId', 'isActive');
  if (!floor) throw new AppError('Floor not found', 404);
  if (!floor.isActive) throw new AppError('Floor is inactive', 400);
  if (!floor.buildingId?.isActive) throw new AppError('Building is inactive', 400);
  return floor;
};

const SORT_WHITELIST = ['slotCode', 'vehicleType', 'status', 'createdAt'];

export const getAll = async ({
  page = 1,
  limit = 50,
  floorId,
  buildingId,
  vehicleType,
  status,
  sortBy = 'slotCode',
  sortOrder = 'asc',
} = {}) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(200, Math.max(1, parseInt(limit)));

  const filter = {};
  if (vehicleType) filter.vehicleType = vehicleType;
  if (status) filter.status = status;

  if (floorId) {
    filter.floorId = floorId;
  } else if (buildingId) {
    const floors = await Floor.find({ buildingId }).select('_id');
    filter.floorId = { $in: floors.map((f) => f._id) };
  }

  const sortField = SORT_WHITELIST.includes(sortBy) ? sortBy : 'slotCode';
  const sortDir = sortOrder.toLowerCase() === 'desc' ? -1 : 1;

  const [slots, total] = await Promise.all([
    ParkingSlot.find(filter)
      .populate({
        path: 'floorId',
        select: 'floorNumber vehicleType totalSlots buildingId',
        populate: { path: 'buildingId', select: 'name address' },
      })
      .sort({ [sortField]: sortDir })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    ParkingSlot.countDocuments(filter),
  ]);

  return { slots, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
};

export const getById = async (id) => {
  const slot = await ParkingSlot.findById(id).populate({
    path: 'floorId',
    select: 'floorNumber vehicleType totalSlots buildingId',
    populate: { path: 'buildingId', select: 'name address' },
  });
  if (!slot) throw new AppError('Parking slot not found', 404);
  return slot;
};

export const create = async (data) => {
  const floor = await loadActiveFloor(data.floorId);

  if (floor.vehicleType !== 'car') {
    throw new AppError('Parking slots can only be created on car floors. Use parking rows for motorcycle floors.', 400);
  }

  if (data.vehicleType !== floor.vehicleType) {
    throw new AppError(`This floor only accepts "${floor.vehicleType}" slots`, 400);
  }

  const currentCount = await ParkingSlot.countDocuments({ floorId: data.floorId });
  if (currentCount >= floor.totalSlots) {
    throw new AppError(
      `Floor has reached its maximum capacity of ${floor.totalSlots} slots`,
      409
    );
  }

  const normalizedCode = data.slotCode.trim().toUpperCase();
  const conflict = await ParkingSlot.findOne({ floorId: data.floorId, slotCode: normalizedCode });
  if (conflict) throw new AppError(`Slot code "${normalizedCode}" already exists on this floor`, 409);

  return ParkingSlot.create({ ...data, slotCode: normalizedCode });
};

export const bulkCreate = async ({ floorId, quantity, prefix = 'A', startFrom, slots }) => {
  const floor = await loadActiveFloor(floorId);

  if (floor.vehicleType !== 'car') {
    throw new AppError('Parking slots can only be created on car floors. Use parking rows for motorcycle floors.', 400);
  }

  const currentCount = await ParkingSlot.countDocuments({ floorId });
  let docs;

  if (slots) {
    const mismatch = slots.find((s) => s.vehicleType && s.vehicleType !== floor.vehicleType);
    if (mismatch) {
      throw new AppError(
        `This floor only accepts "${floor.vehicleType}" slots. ` +
          `Slot "${mismatch.slotCode}" has type "${mismatch.vehicleType}"`,
        400
      );
    }

    if (currentCount + slots.length > floor.totalSlots) {
      throw new AppError(
        `Floor capacity exceeded. Current: ${currentCount}, adding: ${slots.length}, max: ${floor.totalSlots}`,
        409
      );
    }

    const incomingCodes = slots.map((s) => s.slotCode.trim().toUpperCase());
    const uniqueIncoming = new Set(incomingCodes);
    if (uniqueIncoming.size !== incomingCodes.length) {
      const dup = incomingCodes.find((c, i) => incomingCodes.indexOf(c) !== i);
      throw new AppError(`Duplicate slotCode in request: "${dup}"`, 400);
    }

    const conflicts = await ParkingSlot.find({
      floorId,
      slotCode: { $in: [...uniqueIncoming] },
    }).select('slotCode');
    if (conflicts.length > 0) {
      throw new AppError(
        `SlotCode already exists on this floor: ${conflicts.map((s) => s.slotCode).join(', ')}`,
        409
      );
    }

    docs = slots.map((s) => ({
      floorId,
      slotCode: s.slotCode.trim().toUpperCase(),
      vehicleType: floor.vehicleType, // always use floor's type
      note: s.note,
      status: 'empty',
    }));
  } else {
    if (currentCount + quantity > floor.totalSlots) {
      throw new AppError(
        `Floor capacity exceeded. Current: ${currentCount}, adding: ${quantity}, max: ${floor.totalSlots}`,
        409
      );
    }

    const from = startFrom !== undefined ? startFrom : currentCount + 1;
    const padLen = Math.max(String(from + quantity - 1).length, 2);
    const pre = prefix.trim().toUpperCase();

    const generatedCodes = Array.from(
      { length: quantity },
      (_, i) => `${pre}${String(from + i).padStart(padLen, '0')}`
    );

    const conflicts = await ParkingSlot.find({
      floorId,
      slotCode: { $in: generatedCodes },
    }).select('slotCode');
    if (conflicts.length > 0) {
      throw new AppError(
        `SlotCode already exists on this floor: ${conflicts.map((s) => s.slotCode).join(', ')}`,
        409
      );
    }

    docs = generatedCodes.map((slotCode) => ({
      floorId,
      slotCode,
      vehicleType: floor.vehicleType,
      status: 'empty',
    }));
  }

  return ParkingSlot.insertMany(docs);
};

export const update = async (id, data) => {
  const slot = await ParkingSlot.findById(id).populate('floorId', 'vehicleType');
  if (!slot) throw new AppError('Parking slot not found', 404);

  if (data.status === 'empty' && slot.status === 'occupied') {
    throw new AppError('Cannot manually set occupied slot to empty — use check-out instead', 400);
  }

  if (data.vehicleType && data.vehicleType !== slot.floorId.vehicleType) {
    throw new AppError(`This floor only accepts "${slot.floorId.vehicleType}" slots`, 400);
  }

  if (data.slotCode) {
    data.slotCode = data.slotCode.trim().toUpperCase();
    const conflict = await ParkingSlot.findOne({ floorId: slot.floorId._id, slotCode: data.slotCode });
    if (conflict && conflict._id.toString() !== id) {
      throw new AppError(`Slot code "${data.slotCode}" already exists on this floor`, 409);
    }
  }

  Object.assign(slot, data);
  return slot.save();
};

export const remove = async (id) => {
  const slot = await ParkingSlot.findById(id);
  if (!slot) throw new AppError('Parking slot not found', 404);
  if (slot.status === 'occupied') throw new AppError('Cannot delete an occupied slot', 400);
  await slot.deleteOne();
};
