import ParkingSession from '../models/parking-session.model.js';
import ParkingSlot from '../models/parking-slot.model.js';
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

  // Block if vehicle already has an active session
  const existing = await ParkingSession.findOne({ licensePlate: normalizedPlate, status: 'active' });
  if (existing) {
    throw new AppError(`Vehicle ${normalizedPlate} already has an active parking session`, 400);
  }

  // Validate resident account if provided
  if (userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('Resident account not found', 404);
    if (!user.isActive) throw new AppError('Resident account is inactive', 400);
  }

  // Atomically find and lock an empty slot matching vehicleType
  const slot = await ParkingSlot.findOneAndUpdate(
    { vehicleType, status: 'empty' },
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
    // Rollback slot if session creation fails
    await ParkingSlot.findByIdAndUpdate(slot._id, { status: 'empty' });
    throw err;
  }
};

export const getActiveSessions = async ({ page = 1, limit = 20, vehicleType, licensePlate }) => {
  const filter = { status: 'active' };
  if (vehicleType) filter.vehicleType = vehicleType;
  if (licensePlate) filter.licensePlate = new RegExp(licensePlate.toUpperCase(), 'i');

  const skip = (Number(page) - 1) * Number(limit);
  const [sessions, total] = await Promise.all([
    ParkingSession.find(filter)
      .populate(SESSION_POPULATE)
      .skip(skip)
      .limit(Number(limit))
      .sort({ entryTime: -1 }),
    ParkingSession.countDocuments(filter),
  ]);
  return { sessions, total, page: Number(page), limit: Number(limit) };
};

export const getById = async (id) => {
  const session = await ParkingSession.findById(id).populate(SESSION_POPULATE);
  if (!session) throw new AppError('Session not found', 404);
  return session;
};

/**
 * Lookup a license plate before check-in so staff can confirm:
 *  - Is the vehicle already parked? (active session)
 *  - Which resident was linked last time? (hint for userId)
 *  - How many slots are still available for that vehicle type?
 */
export const lookup = async (licensePlate) => {
  const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');

  // 1. Check for an existing active session
  const activeSession = await ParkingSession.findOne({
    licensePlate: normalizedPlate,
    status: 'active',
  }).populate(SESSION_POPULATE);

  // 2. Find the most recent completed session → get linked resident hint
  const lastSession = await ParkingSession.findOne({
    licensePlate: normalizedPlate,
    status: { $in: ['completed', 'cancelled'] },
  })
    .sort({ exitTime: -1 })
    .populate('userId', 'fullName phone email')
    .select('userId entryTime exitTime vehicleType fee');

  // 3. Count available slots per vehicleType (helps staff see capacity at a glance)
  const [availableMotorcycle, availableCar] = await Promise.all([
    ParkingSlot.countDocuments({ vehicleType: 'motorcycle', status: 'empty' }),
    ParkingSlot.countDocuments({ vehicleType: 'car', status: 'empty' }),
  ]);

  return {
    licensePlate: normalizedPlate,
    // 'already_active' means cannot check-in; 'available' means good to go
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
