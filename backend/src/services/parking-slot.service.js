import ParkingSlot from '../models/parking-slot.model.js';
import Floor from '../models/floor.model.js';
import Building from '../models/building.model.js';
import AppError from '../utils/appError.js';

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Load floor + its building in one query.
 * Throws 404 / 400 if floor or building is missing / inactive.
 */
const loadActiveFloor = async (floorId) => {
  const floor = await Floor.findById(floorId).populate('buildingId', 'isActive');
  if (!floor) throw new AppError('Floor not found', 404);
  if (!floor.isActive) throw new AppError('Floor is inactive', 400);
  if (!floor.buildingId?.isActive) throw new AppError('Building is inactive', 400);
  return floor;
};

// ─── getAll ─────────────────────────────────────────────────────────────────

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

  // filter by floorId directly, or resolve all floorIds under a building
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

// ─── getById ─────────────────────────────────────────────────────────────────

export const getById = async (id) => {
  const slot = await ParkingSlot.findById(id).populate({
    path: 'floorId',
    select: 'floorNumber vehicleType totalSlots buildingId',
    populate: { path: 'buildingId', select: 'name address' },
  });
  if (!slot) throw new AppError('Parking slot not found', 404);
  return slot;
};

// ─── create ──────────────────────────────────────────────────────────────────

export const create = async (data) => {
  const floor = await loadActiveFloor(data.floorId);

  // Enforce vehicleType must match the floor
  if (data.vehicleType !== floor.vehicleType) {
    throw new AppError(`This floor only accepts "${floor.vehicleType}" slots`, 400);
  }

  // Check floor capacity
  const currentCount = await ParkingSlot.countDocuments({ floorId: data.floorId });
  if (currentCount >= floor.totalSlots) {
    throw new AppError(
      `Floor has reached its maximum capacity of ${floor.totalSlots} slots`,
      409
    );
  }

  // Duplicate slotCode check (also enforced by unique index, but give nicer error)
  const normalizedCode = data.slotCode.trim().toUpperCase();
  const conflict = await ParkingSlot.findOne({ floorId: data.floorId, slotCode: normalizedCode });
  if (conflict) throw new AppError(`Slot code "${normalizedCode}" already exists on this floor`, 409);

  return ParkingSlot.create({ ...data, slotCode: normalizedCode });
};

// ─── bulkCreate ───────────────────────────────────────────────────────────────

export const bulkCreate = async ({ floorId, quantity, prefix = 'A', startFrom, slots }) => {
  const floor = await loadActiveFloor(floorId);

  const currentCount = await ParkingSlot.countDocuments({ floorId });
  let docs;

  if (slots) {
    // ── Mode B: explicit list ─────────────────────────────────────────────
    // vehicleType per slot must match floor
    const mismatch = slots.find((s) => s.vehicleType && s.vehicleType !== floor.vehicleType);
    if (mismatch) {
      throw new AppError(
        `This floor only accepts "${floor.vehicleType}" slots. ` +
          `Slot "${mismatch.slotCode}" has type "${mismatch.vehicleType}"`,
        400
      );
    }

    // Capacity check
    if (currentCount + slots.length > floor.totalSlots) {
      throw new AppError(
        `Floor capacity exceeded. Current: ${currentCount}, adding: ${slots.length}, max: ${floor.totalSlots}`,
        409
      );
    }

    // Duplicate within the request
    const incomingCodes = slots.map((s) => s.slotCode.trim().toUpperCase());
    const uniqueIncoming = new Set(incomingCodes);
    if (uniqueIncoming.size !== incomingCodes.length) {
      const dup = incomingCodes.find((c, i) => incomingCodes.indexOf(c) !== i);
      throw new AppError(`Duplicate slotCode in request: "${dup}"`, 400);
    }

    // Duplicate vs existing DB slots
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
    // ── Mode A: auto-generate by quantity ────────────────────────────────
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

    // Conflict check against DB
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

// ─── update ───────────────────────────────────────────────────────────────────

export const update = async (id, data) => {
  const slot = await ParkingSlot.findById(id);
  if (!slot) throw new AppError('Parking slot not found', 404);
  if (data.status === 'empty' && slot.status === 'occupied') {
    throw new AppError('Cannot manually set occupied slot to empty — use check-out instead', 400);
  }
  return ParkingSlot.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

// ─── remove ───────────────────────────────────────────────────────────────────

export const remove = async (id) => {
  const slot = await ParkingSlot.findById(id);
  if (!slot) throw new AppError('Parking slot not found', 404);
  if (slot.status === 'occupied') throw new AppError('Cannot delete an occupied slot', 400);
  await slot.deleteOne();
};
