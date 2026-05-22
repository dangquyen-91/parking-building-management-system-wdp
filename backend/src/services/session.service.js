import ParkingSession from '../models/parking-session.model.js';
import ParkingSlot from '../models/parking-slot.model.js';
import Floor from '../models/floor.model.js';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';

const SESSION_POPULATE = [
  {
    path: 'slotId',
    select: 'slotCode vehicleType floorId',
    populate: { path: 'floorId', select: 'floorNumber buildingId' },
  },
  { path: 'staffId', select: 'fullName email' },
  { path: 'userId', select: 'fullName phone email' },
];

export const checkIn = async ({ licensePlate, vehicleType, staffId, userId, note }) => {
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

  const activeFloors = await Floor.find({ isActive: true })
    .populate({ path: 'buildingId', select: 'isActive' })
    .select('_id buildingId');
  const validFloorIds = activeFloors
    .filter((f) => f.buildingId?.isActive)
    .map((f) => f._id);

  const slot = await ParkingSlot.findOneAndUpdate(
    { vehicleType, status: 'empty', floorId: { $in: validFloorIds } },
    { status: 'occupied' },
    { new: true }
  );
  if (!slot) throw new AppError(`No available ${vehicleType} slots at the moment`, 404);

  try {
    const session = await ParkingSession.create({
      slotId: slot._id,
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
    await ParkingSlot.findByIdAndUpdate(slot._id, { status: 'empty' });
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
    const slotFilter = {};
    if (floorId) {
      slotFilter.floorId = floorId;
    } else {
      const floors = await Floor.find({ buildingId }).select('_id');
      slotFilter.floorId = { $in: floors.map((f) => f._id) };
    }
    const slots = await ParkingSlot.find(slotFilter).select('_id');
    filter.slotId = { $in: slots.map((s) => s._id) };
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

  const [availableMotorcycle, availableCar] = await Promise.all([
    ParkingSlot.countDocuments({ vehicleType: 'motorcycle', status: 'empty' }),
    ParkingSlot.countDocuments({ vehicleType: 'car', status: 'empty' }),
  ]);

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
