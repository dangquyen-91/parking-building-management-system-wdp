import mongoose from 'mongoose';
import Payment from '../models/payment.model.js';
import ParkingSession from '../models/parking-session.model.js';
import ParkingSlot from '../models/parking-slot.model.js';
import ParkingRow from '../models/parking-row.model.js';
import Floor from '../models/floor.model.js';
import Subscription from '../models/subscription.model.js';
import Booking from '../models/booking.model.js';

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};
const daysAgo = (n) => {
  const x = new Date();
  x.setDate(x.getDate() - n);
  return startOfDay(x);
};

const sumPayments = async (filter) => {
  const agg = await Payment.aggregate([
    { $match: { status: 'paid', ...filter } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  return agg[0] || { total: 0, count: 0 };
};

const sumCashSessions = async (filter) => {
  const agg = await ParkingSession.aggregate([
    {
      $match: {
        status: 'completed',
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        ...filter,
      },
    },
    { $group: { _id: null, total: { $sum: '$fee' }, count: { $sum: 1 } } },
  ]);
  return agg[0] || { total: 0, count: 0 };
};

export const getDashboard = async () => {
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(new Date());

  const [
    subRevenue,
    sessionRevenue,
    bookingRevenue,
    cashRevenue,
    activeSessionsCount,
    activeSubsCount,
    pendingBookingsCount,
    todayCheckinsCount,
    todayCheckoutsCount,
  ] = await Promise.all([
    sumPayments({ targetType: 'subscription', paidAt: { $gte: today, $lte: tomorrow } }),
    sumPayments({ targetType: 'session', paidAt: { $gte: today, $lte: tomorrow } }),
    sumPayments({ targetType: 'booking', paidAt: { $gte: today, $lte: tomorrow } }),
    sumCashSessions({ exitTime: { $gte: today, $lte: tomorrow } }),
    ParkingSession.countDocuments({ status: 'active' }),
    Subscription.countDocuments({ status: 'active' }),
    Booking.countDocuments({ status: { $in: ['pending', 'paid'] } }),
    ParkingSession.countDocuments({ entryTime: { $gte: today, $lte: tomorrow } }),
    ParkingSession.countDocuments({ exitTime: { $gte: today, $lte: tomorrow }, status: 'completed' }),
  ]);

  const totalCapacityAgg = await Floor.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: '$totalSlots' } } },
  ]);
  const totalCapacity = totalCapacityAgg[0]?.total || 0;

  return {
    date: today,
    revenueToday: {
      subscription: subRevenue.total,
      booking: bookingRevenue.total,
      sessionTransfer: sessionRevenue.total,
      sessionCash: cashRevenue.total,
      total:
        subRevenue.total + bookingRevenue.total + sessionRevenue.total + cashRevenue.total,
    },
    activity: {
      activeSessions: activeSessionsCount,
      activeSubscriptions: activeSubsCount,
      pendingBookings: pendingBookingsCount,
      checkinsToday: todayCheckinsCount,
      checkoutsToday: todayCheckoutsCount,
    },
    occupancy: {
      currentVehicles: activeSessionsCount,
      totalCapacity,
      utilizationPercent: totalCapacity > 0 ? Math.round((activeSessionsCount / totalCapacity) * 100) : 0,
    },
  };
};

export const getRevenue = async ({ from, to } = {}) => {
  const start = from ? startOfDay(new Date(from)) : daysAgo(30);
  const end = to ? endOfDay(new Date(to)) : endOfDay(new Date());

  const [subAgg, bookingAgg, sessionTransferAgg, cashAgg] = await Promise.all([
    Payment.aggregate([
      { $match: { status: 'paid', targetType: 'subscription', paidAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
    Payment.aggregate([
      { $match: { status: 'paid', targetType: 'booking', paidAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
    Payment.aggregate([
      { $match: { status: 'paid', targetType: 'session', paidAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
    ParkingSession.aggregate([
      {
        $match: {
          status: 'completed',
          paymentMethod: 'cash',
          paymentStatus: 'paid',
          exitTime: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$exitTime' } },
          total: { $sum: '$fee' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const dailyMap = new Map();
  const addToDay = (date, source, amount, count) => {
    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date,
        subscription: 0,
        booking: 0,
        sessionTransfer: 0,
        sessionCash: 0,
        total: 0,
        transactions: 0,
      });
    }
    const row = dailyMap.get(date);
    row[source] += amount;
    row.total += amount;
    row.transactions += count;
  };

  subAgg.forEach((r) => addToDay(r._id, 'subscription', r.total, r.count));
  bookingAgg.forEach((r) => addToDay(r._id, 'booking', r.total, r.count));
  sessionTransferAgg.forEach((r) => addToDay(r._id, 'sessionTransfer', r.total, r.count));
  cashAgg.forEach((r) => addToDay(r._id, 'sessionCash', r.total, r.count));

  const daily = [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date));
  const totals = daily.reduce(
    (acc, r) => {
      acc.subscription += r.subscription;
      acc.booking += r.booking;
      acc.sessionTransfer += r.sessionTransfer;
      acc.sessionCash += r.sessionCash;
      acc.total += r.total;
      acc.transactions += r.transactions;
      return acc;
    },
    { subscription: 0, booking: 0, sessionTransfer: 0, sessionCash: 0, total: 0, transactions: 0 }
  );

  return { from: start, to: end, totals, daily };
};

export const getSessionStats = async ({ from, to } = {}) => {
  const start = from ? startOfDay(new Date(from)) : daysAgo(7);
  const end = to ? endOfDay(new Date(to)) : endOfDay(new Date());

  const [byVehicleType, byCustomerType, daily] = await Promise.all([
    ParkingSession.aggregate([
      { $match: { entryTime: { $gte: start, $lte: end } } },
      { $group: { _id: '$vehicleType', count: { $sum: 1 } } },
    ]),
    ParkingSession.aggregate([
      { $match: { entryTime: { $gte: start, $lte: end } } },
      { $group: { _id: '$customerType', count: { $sum: 1 } } },
    ]),
    ParkingSession.aggregate([
      { $match: { entryTime: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$entryTime' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const totalSessions = byVehicleType.reduce((sum, x) => sum + x.count, 0);

  return {
    from: start,
    to: end,
    totalSessions,
    byVehicleType: Object.fromEntries(byVehicleType.map((x) => [x._id, x.count])),
    byCustomerType: Object.fromEntries(byCustomerType.map((x) => [x._id, x.count])),
    daily: daily.map((d) => ({ date: d._id, count: d.count })),
  };
};

export const getOccupancy = async () => {
  const floors = await Floor.find({ isActive: true })
    .populate('buildingId', 'name')
    .select('_id floorNumber section vehicleType floorType totalSlots buildingId description');

  const floorIds = floors.map((f) => f._id);

  const [slotCounts, rowCounts, carSessionCounts] = await Promise.all([
    ParkingSlot.aggregate([
      { $match: { floorId: { $in: floorIds } } },
      { $group: { _id: { floorId: '$floorId', status: '$status' }, count: { $sum: 1 } } },
    ]),
    ParkingRow.aggregate([
      { $match: { floorId: { $in: floorIds } } },
      {
        $group: {
          _id: '$floorId',
          totalCapacity: { $sum: '$capacity' },
          totalOccupied: { $sum: '$occupiedCount' },
        },
      },
    ]),
    ParkingSession.aggregate([
      { $match: { status: 'active', vehicleType: 'car', floorId: { $in: floorIds } } },
      { $group: { _id: '$floorId', count: { $sum: 1 } } },
    ]),
  ]);

  const slotMap = new Map();
  for (const r of slotCounts) {
    const key = r._id.floorId.toString();
    if (!slotMap.has(key)) slotMap.set(key, { empty: 0, occupied: 0, reserved: 0, maintenance: 0 });
    slotMap.get(key)[r._id.status] = r.count;
  }
  const rowMap = new Map(rowCounts.map((r) => [r._id.toString(), r]));
  const carSessionMap = new Map(carSessionCounts.map((r) => [r._id.toString(), r.count]));

  const floorReport = floors.map((f) => {
    const key = f._id.toString();
    if (f.vehicleType === 'car') {
      // Visitor car floor: counter-based (walk-ins don't occupy a fixed slot).
      if (f.floorType === 'visitor') {
        const occupied = carSessionMap.get(key) || 0;
        return {
          floorId: f._id,
          floorNumber: f.floorNumber,
          section: f.section,
          floorType: f.floorType,
          vehicleType: 'car',
          description: f.description,
          building: f.buildingId,
          totalSlots: f.totalSlots,
          currentSlots: f.totalSlots,
          occupied,
          empty: Math.max(0, f.totalSlots - occupied),
          reserved: 0,
          maintenance: 0,
          utilizationPercent: f.totalSlots > 0 ? Math.round((occupied / f.totalSlots) * 100) : 0,
        };
      }
      // Resident car floor: slot-status based (reserved slots are the product).
      const stats = slotMap.get(key) || { empty: 0, occupied: 0, reserved: 0, maintenance: 0 };
      const total = stats.empty + stats.occupied + stats.reserved + stats.maintenance;
      return {
        floorId: f._id,
        floorNumber: f.floorNumber,
        section: f.section,
        floorType: f.floorType,
        vehicleType: 'car',
        description: f.description,
        building: f.buildingId,
        totalSlots: f.totalSlots,
        currentSlots: total,
        occupied: stats.occupied,
        empty: stats.empty,
        reserved: stats.reserved,
        maintenance: stats.maintenance,
        utilizationPercent: total > 0 ? Math.round((stats.occupied / total) * 100) : 0,
      };
    }
    const rowStats = rowMap.get(key) || { totalCapacity: 0, totalOccupied: 0 };
    return {
      floorId: f._id,
      floorNumber: f.floorNumber,
      section: f.section,
      floorType: f.floorType,
      vehicleType: 'motorcycle',
      description: f.description,
      building: f.buildingId,
      totalCapacity: rowStats.totalCapacity,
      occupied: rowStats.totalOccupied,
      empty: rowStats.totalCapacity - rowStats.totalOccupied,
      utilizationPercent:
        rowStats.totalCapacity > 0
          ? Math.round((rowStats.totalOccupied / rowStats.totalCapacity) * 100)
          : 0,
    };
  });

  const totalOccupied = floorReport.reduce((sum, f) => sum + (f.occupied || 0), 0);
  const totalCapacity = floorReport.reduce(
    (sum, f) => sum + (f.totalCapacity || f.totalSlots || 0),
    0
  );

  return {
    overall: {
      totalCapacity,
      occupied: totalOccupied,
      utilizationPercent: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
    },
    floors: floorReport,
  };
};

export const getPeakHours = async ({ days = 7 } = {}) => {
  const start = daysAgo(parseInt(days));
  const end = endOfDay(new Date());

  const hourly = await ParkingSession.aggregate([
    { $match: { entryTime: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { hour: { $hour: '$entryTime' }, vehicleType: '$vehicleType' },
        count: { $sum: 1 },
      },
    },
  ]);

  const result = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    motorcycle: 0,
    car: 0,
    total: 0,
  }));
  for (const r of hourly) {
    result[r._id.hour][r._id.vehicleType] = r.count;
    result[r._id.hour].total += r.count;
  }

  const peakHour = result.reduce((max, r) => (r.total > max.total ? r : max), result[0]);

  return {
    from: start,
    to: end,
    days: parseInt(days),
    hourly: result,
    peakHour: { hour: peakHour.hour, count: peakHour.total },
  };
};
