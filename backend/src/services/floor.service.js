import Floor from '../models/floor.model.js';
import Building from '../models/building.model.js';
import ParkingSlot from '../models/parking-slot.model.js';
import ParkingRow from '../models/parking-row.model.js';
import ParkingSession from '../models/parking-session.model.js';
import AppError from '../utils/appError.js';

const SORTABLE_FIELDS = ['floorNumber', 'vehicleType', 'createdAt'];

export const getAll = async ({ buildingId, vehicleType, floorType, isActive, sort, order, page = 1, limit = 10 }) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const filter = {};
  if (buildingId) filter.buildingId = buildingId;
  if (vehicleType) filter.vehicleType = vehicleType;
  if (floorType) filter.floorType = floorType;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const sortField = SORTABLE_FIELDS.includes(sort) ? sort : 'floorNumber';
  const sortOrder = order === 'asc' ? 1 : -1;

  const skip = (pageNum - 1) * limitNum;
  const [floors, total] = await Promise.all([
    Floor.find(filter)
      .populate('buildingId', 'name address')
      .skip(skip)
      .limit(limitNum)
      .sort({ [sortField]: sortOrder }),
    Floor.countDocuments(filter),
  ]);
  return { floors, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
};

export const getById = async (id) => {
  const floor = await Floor.findById(id).populate('buildingId', 'name address');
  if (!floor) throw new AppError('Floor not found', 404);

  if (floor.vehicleType === 'car') {
    const slotStats = await ParkingSlot.aggregate([
      { $match: { floorId: floor._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const stats = { empty: 0, occupied: 0, reserved: 0, maintenance: 0 };
    slotStats.forEach(({ _id, count }) => { stats[_id] = count; });
    return { ...floor.toObject(), slotStats: stats };
  }

  const rowAgg = await ParkingRow.aggregate([
    { $match: { floorId: floor._id } },
    {
      $group: {
        _id: null,
        totalRows:     { $sum: 1 },
        totalCapacity: { $sum: '$capacity' },
        totalOccupied: { $sum: '$occupiedCount' },
        available:     { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
        full:          { $sum: { $cond: [{ $eq: ['$status', 'full'] },      1, 0] } },
        maintenance:   { $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] } },
      },
    },
  ]);
  const rowStats = rowAgg[0]
    ? (({ _id, ...rest }) => rest)(rowAgg[0])
    : { totalRows: 0, totalCapacity: 0, totalOccupied: 0, available: 0, full: 0, maintenance: 0 };

  return { ...floor.toObject(), rowStats };
};

export const create = async (data) => {
  const building = await Building.findById(data.buildingId);
  if (!building) throw new AppError('Building not found', 404);
  if (!building.isActive) throw new AppError('Building is inactive', 400);

  // A "khu" (zone) is a Floor record; one floorNumber may hold several sections.
  const section = (data.section || 'A').toUpperCase().replace(/\s/g, '');
  const existing = await Floor.findOne({
    buildingId: data.buildingId,
    floorNumber: data.floorNumber,
    section,
  });
  if (existing) {
    throw new AppError(`Khu ${section} của tầng ${data.floorNumber} đã tồn tại trong tòa nhà này`, 409);
  }

  return Floor.create({ ...data, section });
};

export const update = async (id, data) => {
  const floor = await Floor.findById(id);
  if (!floor) throw new AppError('Floor not found', 404);

  if (data.floorNumber !== undefined || data.section !== undefined) {
    const floorNumber = data.floorNumber ?? floor.floorNumber;
    const section = (data.section ?? floor.section ?? 'A').toUpperCase().replace(/\s/g, '');
    const conflict = await Floor.findOne({ buildingId: floor.buildingId, floorNumber, section });
    if (conflict && conflict._id.toString() !== id) {
      throw new AppError(`Khu ${section} của tầng ${floorNumber} đã tồn tại trong tòa nhà này`, 409);
    }
    if (data.section !== undefined) data.section = section;
  }

  Object.assign(floor, data);
  return floor.save();
};

export const getOccupancyByFloorNumber = async (buildingId, floorNumber) => {
  if (!buildingId) throw new AppError('buildingId is required', 400);
  if (floorNumber === undefined) throw new AppError('floorNumber is required', 400);

  const floors = await Floor.find({ buildingId, floorNumber: parseInt(floorNumber), isActive: true });
  if (!floors.length) throw new AppError('No active floors found for this building and floor number', 404);

  const result = {
    floorNumber: parseInt(floorNumber),
    motorcycle: { current: 0, total: 0 },
    car: { current: 0, total: 0 },
  };

  await Promise.all(
    floors.map(async (floor) => {
      if (floor.vehicleType === 'motorcycle') {
        const agg = await ParkingRow.aggregate([
          { $match: { floorId: floor._id, isActive: true } },
          { $group: { _id: null, occupied: { $sum: '$occupiedCount' }, capacity: { $sum: '$capacity' } } },
        ]);
        result.motorcycle.current += agg[0]?.occupied || 0;
        result.motorcycle.total += agg[0]?.capacity || 0;
      } else {
        const slotIds = await ParkingSlot.find({ floorId: floor._id }, '_id').then(s => s.map(x => x._id));
        const [walkInCount, residentCount] = await Promise.all([
          // xe ô tô vãng lai: session gắn floorId trực tiếp (không có slotId cố định)
          ParkingSession.countDocuments({ floorId: floor._id, vehicleType: 'car', status: 'active' }),
          // xe ô tô thuê bao: session gắn slotId thuộc tầng này
          ParkingSession.countDocuments({ slotId: { $in: slotIds }, status: 'active' }),
        ]);
        result.car.current += walkInCount + residentCount;
        result.car.total += floor.totalSlots;
      }
    })
  );

  return result;
};

export const remove = async (id) => {
  const hasSlots = await ParkingSlot.exists({ floorId: id });
  if (hasSlots) throw new AppError('Cannot delete floor with existing parking slots', 409);

  const hasRows = await ParkingRow.exists({ floorId: id });
  if (hasRows) throw new AppError('Cannot delete floor with existing parking rows', 409);

  const floor = await Floor.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!floor) throw new AppError('Floor not found', 404);
  return floor;
};
