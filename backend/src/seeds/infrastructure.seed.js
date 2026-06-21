import mongoose from 'mongoose';
import dns from 'dns';
import Building from '../models/building.model.js';
import Floor from '../models/floor.model.js';
import ParkingSlot from '../models/parking-slot.model.js';
import ParkingRow from '../models/parking-row.model.js';

dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const resetMode = process.argv.includes('--reset');

// Layout: 2 basements (hầm), each split into 2 zones (khu) by vehicle type.
// floorNumber = hầm number; section = zone within the hầm.
const FLOORS_CONFIG = [
  // ---- Hầm 1 — Cư dân ----
  {
    floorNumber: 1,
    section: 'A',
    vehicleType: 'motorcycle',
    floorType: 'resident',
    totalSlots: 100,
    description: 'Hầm 1 - Khu A - Xe máy cư dân',
    rowsPrefix: 'H1A-',
    rowsCount: 10,
    rowCapacity: 10,
  },
  {
    floorNumber: 1,
    section: 'B',
    vehicleType: 'car',
    floorType: 'resident',
    totalSlots: 50,
    description: 'Hầm 1 - Khu B - Ô tô cư dân',
    slotsPrefix: 'H1B-',
    slotsCount: 50,
  },
  // ---- Hầm 2 — Vãng lai ----
  {
    floorNumber: 2,
    section: 'A',
    vehicleType: 'motorcycle',
    floorType: 'visitor',
    totalSlots: 100,
    description: 'Hầm 2 - Khu A - Xe máy vãng lai',
    rowsPrefix: 'H2A-',
    rowsCount: 10,
    rowCapacity: 10,
  },
  {
    floorNumber: 2,
    section: 'B',
    vehicleType: 'car',
    floorType: 'visitor',
    totalSlots: 50,
    description: 'Hầm 2 - Khu B - Ô tô vãng lai',
    slotsPrefix: 'H2B-',
    slotsCount: 50,
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
    console.log(`Created building "${building.name}"`);
  } else {
    console.log(`Using existing building "${building.name}" (${building._id})`);
  }
  return building;
};

const ensureFloor = async (buildingId, config) => {
  let floor = await Floor.findOne({
    buildingId,
    floorNumber: config.floorNumber,
    section: config.section,
  });
  if (floor) {
    console.log(`Hầm ${config.floorNumber} Khu ${config.section} already exists — keep`);
    return floor;
  }
  floor = await Floor.create({
    buildingId,
    floorNumber: config.floorNumber,
    section: config.section,
    vehicleType: config.vehicleType,
    floorType: config.floorType,
    totalSlots: config.totalSlots,
    description: config.description,
  });
  console.log(
    `Created Hầm ${config.floorNumber} Khu ${config.section} (${config.vehicleType}/${config.floorType}, ${config.totalSlots})`
  );
  return floor;
};

const ensureCarSlots = async (floor, prefix, count) => {
  const existing = await ParkingSlot.countDocuments({ floorId: floor._id });
  if (existing > 0) {
    console.log(`  ${prefix}: ${existing} slots already exist — skip`);
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
  console.log(`  Created ${count} car slots (${prefix})`);
};

const ensureMotoRows = async (floor, { rowsPrefix, rowsCount, rowCapacity }) => {
  const existing = await ParkingRow.countDocuments({ floorId: floor._id });
  if (existing > 0) {
    console.log(`  ${rowsPrefix}: ${existing} rows already exist — skip`);
    return;
  }
  const padLen = Math.max(String(rowsCount).length, 2);
  const docs = Array.from({ length: rowsCount }, (_, i) => ({
    floorId: floor._id,
    rowCode: `${rowsPrefix}${String(i + 1).padStart(padLen, '0')}`,
    capacity: rowCapacity,
    occupiedCount: 0,
    status: 'available',
  }));
  await ParkingRow.insertMany(docs);
  console.log(`  Created ${rowsCount} motorcycle rows (${rowsPrefix}, ${rowCapacity} each)`);
};

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // Drop the legacy unique index (buildingId+floorNumber) so a single hầm can
  // hold multiple zones (replaced by buildingId+floorNumber+section).
  try {
    await Floor.collection.dropIndex('buildingId_1_floorNumber_1');
    console.log('Dropped legacy floor index buildingId_1_floorNumber_1');
  } catch {
    /* index not present — fine */
  }

  if (resetMode) {
    await Promise.all([
      ParkingSlot.deleteMany({}),
      ParkingRow.deleteMany({}),
      Floor.deleteMany({}),
    ]);
    console.log('RESET: cleared all floors, car slots, motorcycle rows');
  }

  const building = await ensureBuilding();

  for (const config of FLOORS_CONFIG) {
    const floor = await ensureFloor(building._id, config);
    if (config.slotsCount) {
      await ensureCarSlots(floor, config.slotsPrefix, config.slotsCount);
    }
    if (config.rowsCount) {
      await ensureMotoRows(floor, config);
    }
  }

  await mongoose.disconnect();
  console.log('Infrastructure seed completed');
  process.exit(0);
};

run().catch((err) => {
  console.error('Infrastructure seed failed', { error: err.message });
  process.exit(1);
});
