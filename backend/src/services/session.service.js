import ParkingSession from '../models/parking-session.model.js';
import ParkingSlot from '../models/parking-slot.model.js';
import ParkingRow from '../models/parking-row.model.js';
import Floor from '../models/floor.model.js';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';

const SESSION_POPULATE = [
  {
    path: 'slotId',
    select: 'slotCode vehicleType floorId',
    populate: { path: 'floorId', select: 'floorNumber buildingId' },
  },
  {
    path: 'rowId',
    select: 'rowCode capacity occupiedCount floorId',
    populate: { path: 'floorId', select: 'floorNumber buildingId' },
  },
  { path: 'staffId', select: 'fullName email' },
  { path: 'userId',  select: 'fullName phone email' },
];

export const checkIn = async ({ slotId, rowId, licensePlate, vehicleType, staffId, userId, note }) => {
  const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');

  const existing = await ParkingSession.findOne({ licensePlate: normalizedPlate, status: 'active' });
  if (existing) {
    throw new AppError(`Vehicle ${normalizedPlate} already has an active parking session`, 400);
  }

  if (userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('Resident account not found', 404);
    if (!user.isActive) throw new AppError('Resident account is inactive', 400);
  }

  if (vehicleType === 'car') {
    const slot = await ParkingSlot.findById(slotId).populate({
      path: 'floorId',
      select: 'isActive vehicleType floorType buildingId',
      populate: { path: 'buildingId', select: 'isActive' },
    });
    if (!slot) throw new AppError('Parking slot not found', 404);
    if (!slot.floorId.isActive) throw new AppError('Floor is inactive', 400);
    if (!slot.floorId.buildingId?.isActive) throw new AppError('Building is inactive', 400);
    if (slot.floorId.vehicleType !== 'car') throw new AppError('This slot only accepts car', 400);
    if (slot.floorId.floorType === 'resident' && !userId)
      throw new AppError('This floor is for residents only. userId is required.', 403);
    if (slot.floorId.floorType === 'visitor' && userId)
      throw new AppError('This floor is for visitors only. Do not provide userId.', 403);

    const locked = await ParkingSlot.findOneAndUpdate(
      { _id: slotId, status: 'empty' },
      { status: 'occupied' },
      { new: true }
    );
    if (!locked) throw new AppError(`Slot is not available (current status: ${slot.status})`, 409);

    try {
      const session = await ParkingSession.create({
        slotId,
        rowId: null,
        licensePlate: normalizedPlate,
        vehicleType,
        entryTime: new Date(),
        staffId,
        userId: userId || null,
        status: 'active',
        note,
      });
      return session.populate(SESSION_POPULATE);
    } catch (err) {
      await ParkingSlot.findByIdAndUpdate(slotId, { status: 'empty' });
      throw err;
    }
  }

  const row = await ParkingRow.findById(rowId).populate({
    path: 'floorId',
    select: 'isActive vehicleType floorType buildingId',
    populate: { path: 'buildingId', select: 'isActive' },
  });
  if (!row) throw new AppError('Parking row not found', 404);
  if (!row.floorId.isActive) throw new AppError('Floor is inactive', 400);
  if (!row.floorId.buildingId?.isActive) throw new AppError('Building is inactive', 400);
  if (row.floorId.vehicleType !== 'motorcycle') throw new AppError('This row only accepts motorcycle', 400);
  if (row.floorId.floorType === 'resident' && !userId)
    throw new AppError('This floor is for residents only. userId is required.', 403);
  if (row.floorId.floorType === 'visitor' && userId)
    throw new AppError('This floor is for visitors only. Do not provide userId.', 403);

  const newOccupied = row.occupiedCount + 1;

  const locked = await ParkingRow.findOneAndUpdate(
    { _id: rowId, status: { $ne: 'maintenance' }, occupiedCount: { $lt: row.capacity } },
    {
      $inc: { occupiedCount: 1 },
      $set: { status: newOccupied >= row.capacity ? 'full' : 'available' },
    },
    { new: true }
  );
  if (!locked) throw new AppError(`Row is full or under maintenance (${row.occupiedCount}/${row.capacity})`, 409);

  try {
    const session = await ParkingSession.create({
      slotId: null,
      rowId,
      licensePlate: normalizedPlate,
      vehicleType,
      entryTime: new Date(),
      staffId,
      userId: userId || null,
      status: 'active',
      note,
    });
    return session.populate(SESSION_POPULATE);
  } catch (err) {
    await ParkingRow.findByIdAndUpdate(rowId, {
      $inc: { occupiedCount: -1 },
      $set: { status: row.status },
    });
    throw err;
  }
};

export const getActiveSessions = async ({ page = 1, limit = 20, vehicleType, licensePlate, floorId, buildingId } = {}) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const filter = { status: 'active' };
  if (vehicleType) filter.vehicleType = vehicleType;
  if (licensePlate) filter.licensePlate = new RegExp(licensePlate.toUpperCase(), 'i');

  if (floorId || buildingId) {
    const floorIds = floorId
      ? [floorId]
      : (await Floor.find({ buildingId }).select('_id')).map((f) => f._id);

    const [slots, rows] = await Promise.all([
      ParkingSlot.find({ floorId: { $in: floorIds } }).select('_id'),
      ParkingRow.find({ floorId: { $in: floorIds } }).select('_id'),
    ]);

    filter.$or = [
      { slotId: { $in: slots.map((s) => s._id) } },
      { rowId:  { $in: rows.map((r) => r._id) } },
    ];
  }

  const skip = (pageNum - 1) * limitNum;
  const [sessions, total] = await Promise.all([
    ParkingSession.find(filter)
      .populate(SESSION_POPULATE)
      .skip(skip)
      .limit(limitNum)
      .sort({ entryTime: -1 }),
    ParkingSession.countDocuments(filter),
  ]);
  return { sessions, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
};

export const getById = async (id) => {
  const session = await ParkingSession.findById(id).populate(SESSION_POPULATE);
  if (!session) throw new AppError('Session not found', 404);
  return session;
};

export const lookup = async (licensePlate) => {
  const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');

  const activeSession = await ParkingSession.findOne({
    licensePlate: normalizedPlate,
    status: 'active',
  }).populate(SESSION_POPULATE);

  const lastSession = await ParkingSession.findOne({
    licensePlate: normalizedPlate,
    status: { $in: ['completed', 'cancelled'] },
  })
    .sort({ exitTime: -1 })
    .populate('userId', 'fullName phone email')
    .select('userId entryTime exitTime vehicleType fee');

  const availableCar = await ParkingSlot.countDocuments({ vehicleType: 'car', status: 'empty' });

  const motoAgg = await ParkingRow.aggregate([
    { $match: { status: 'available' } },
    { $group: { _id: null, available: { $sum: { $subtract: ['$capacity', '$occupiedCount'] } } } },
  ]);
  const availableMotorcycle = motoAgg[0]?.available || 0;

  return {
    licensePlate: normalizedPlate,
    status: activeSession ? 'already_active' : 'available',
    activeSession: activeSession || null,
    hint: {
      linkedResident: lastSession?.userId || null,
      lastVisit: lastSession
        ? {
            vehicleType: lastSession.vehicleType,
            entryTime: lastSession.entryTime,
            exitTime: lastSession.exitTime,
            fee: lastSession.fee,
          }
        : null,
    },
    availableSlots: {
      motorcycle: availableMotorcycle,
      car: availableCar,
    },
  };
};
