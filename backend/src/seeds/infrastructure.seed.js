import mongoose from 'mongoose';
import dns from 'dns';
import Building from '../models/building.model.js';
import Floor from '../models/floor.model.js';
import ParkingSlot from '../models/parking-slot.model.js';
import ParkingRow from '../models/parking-row.model.js';
import logger from '../utils/logger.js';

dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const FLOORS_CONFIG = [
  {
    floorNumber: -1,
    vehicleType: 'motorcycle',
    floorType: 'resident',
    totalSlots: 100,
    description: 'Tầng hầm 1 - Xe máy cư dân',
    rows: [
      { rowCode: 'BM1-A', capacity: 25 },
      { rowCode: 'BM1-B', capacity: 25 },
      { rowCode: 'BM1-C', capacity: 25 },
      { rowCode: 'BM1-D', capacity: 25 },
    ],
  },
  {
    floorNumber: -2,
    vehicleType: 'car',
    floorType: 'resident',
    totalSlots: 30,
    description: 'Tầng hầm 2 - Xe ô tô cư dân',
    slotsPrefix: 'BC2-',
    slotsCount: 30,
  },
  {
    floorNumber: 1,
    vehicleType: 'car',
    floorType: 'visitor',
    totalSlots: 20,
    description: 'Tầng 1 - Xe ô tô vãng lai',
    slotsPrefix: 'V1-',
    slotsCount: 20,
  },
  {
    floorNumber: 2,
    vehicleType: 'motorcycle',
    floorType: 'visitor',
    totalSlots: 80,
    description: 'Tầng 2 - Xe máy vãng lai',
    rows: [
      { rowCode: 'V2-A', capacity: 20 },
      { rowCode: 'V2-B', capacity: 20 },
      { rowCode: 'V2-C', capacity: 20 },
      { rowCode: 'V2-D', capacity: 20 },
    ],
  },
];

const ensureBuilding = async () => {
  let building = await Building.findOne({ isActive: true }).sort({ createdAt: 1 });
  if (!building) {
    building = await Building.create({
      name: 'PBMS Demo Building',
      address: '123 Demo Street',
      description: 'Seed building for infrastructure',
    });
    logger.info(`Created building "${building.name}"`);
  } else {
    logger.info(`Using existing building "${building.name}" (${building._id})`);
  }
  return building;
};

const ensureFloor = async (buildingId, config) => {
  let floor = await Floor.findOne({ buildingId, floorNumber: config.floorNumber });
  if (floor) {
    logger.info(`Floor ${config.floorNumber} already exists — keep`);
    return floor;
  }
  floor = await Floor.create({
    buildingId,
    floorNumber: config.floorNumber,
    vehicleType: config.vehicleType,
    floorType: config.floorType,
    totalSlots: config.totalSlots,
    description: config.description,
  });
  logger.info(`Created floor ${config.floorNumber} (${config.vehicleType}/${config.floorType})`);
  return floor;
};

const ensureCarSlots = async (floor, prefix, count) => {
  const existing = await ParkingSlot.countDocuments({ floorId: floor._id });
  if (existing > 0) {
    logger.info(`  Floor ${floor.floorNumber}: ${existing} slots already exist — skip`);
    return;
  }
  const padLen = Math.max(String(count).length, 2);
  const docs = Array.from({ length: count }, (_, i) => ({
    floorId: floor._id,
    slotCode: `${prefix}${String(i + 1).padStart(padLen, '0')}`,
    vehicleType: 'car',
    status: 'empty',
  }));
  await ParkingSlot.insertMany(docs);
  logger.info(`  Created ${count} car slots on floor ${floor.floorNumber}`);
};

const ensureMotoRows = async (floor, rows) => {
  const existing = await ParkingRow.countDocuments({ floorId: floor._id });
  if (existing > 0) {
    logger.info(`  Floor ${floor.floorNumber}: ${existing} rows already exist — skip`);
    return;
  }
  const docs = rows.map((r) => ({
    floorId: floor._id,
    rowCode: r.rowCode,
    capacity: r.capacity,
    occupiedCount: 0,
    status: 'available',
  }));
  await ParkingRow.insertMany(docs);
  logger.info(`  Created ${rows.length} motorcycle rows on floor ${floor.floorNumber}`);
};

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const building = await ensureBuilding();

  for (const config of FLOORS_CONFIG) {
    const floor = await ensureFloor(building._id, config);
    if (config.slotsCount) {
      await ensureCarSlots(floor, config.slotsPrefix, config.slotsCount);
    }
    if (config.rows) {
      await ensureMotoRows(floor, config.rows);
    }
  }

  await mongoose.disconnect();
  logger.info('Infrastructure seed completed');
  process.exit(0);
};

run().catch((err) => {
  logger.error('Infrastructure seed failed', { error: err.message });
  process.exit(1);
});
