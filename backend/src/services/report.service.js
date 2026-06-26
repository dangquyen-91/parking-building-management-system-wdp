import mongoose from 'mongoose';
import Payment from '../models/payment.model.js';
import ParkingSession from '../models/parking-session.model.js';
import ParkingSlot from '../models/parking-slot.model.js';
import ParkingRow from '../models/parking-row.model.js';
import Floor from '../models/floor.model.js';
import Subscription from '../models/subscription.model.js';
import Booking from '../models/booking.model.js';
import User from '../models/user.model.js';

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

const periodExpr = (dateField, groupBy) => {
  if (groupBy === 'week') return { $dateToString: { format: '%G-W%V', date: dateField } };
  if (groupBy === 'month') return { $dateToString: { format: '%Y-%m', date: dateField } };
  return { $dateToString: { format: '%Y-%m-%d', date: dateField } };
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
    { $match: { status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', ...filter } },
    { $group: { _id: null, total: { $sum: '$fee' }, count: { $sum: 1 } } },
  ]);
  return agg[0] || { total: 0, count: 0 };
};

const sumCashSessionsByVehicle = async (filter) => {
  const agg = await ParkingSession.aggregate([
    { $match: { status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', ...filter } },
    { $group: { _id: '$vehicleType', total: { $sum: '$fee' }, count: { $sum: 1 } } },
  ]);
  const result = { motorcycle: { total: 0, count: 0 }, car: { total: 0, count: 0 } };
  for (const r of agg) {
    if (r._id === 'motorcycle' || r._id === 'car') result[r._id] = { total: r.total, count: r.count };
  }
  return result;
};

const sumPaymentsByVehicle = async (targetType, dateFilter) => {
  const lookup = {
    subscription: { from: 'subscriptions', localField: 'subscriptionId' },
    session: { from: 'parkingsessions', localField: 'sessionId' },
    booking: { from: 'bookings', localField: 'bookingId' },
  }[targetType];

  const agg = await Payment.aggregate([
    { $match: { status: 'paid', targetType, paidAt: dateFilter } },
    { $lookup: { from: lookup.from, localField: lookup.localField, foreignField: '_id', as: 'ref' } },
    { $unwind: '$ref' },
    { $group: { _id: '$ref.vehicleType', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);

  const result = { motorcycle: { total: 0, count: 0 }, car: { total: 0, count: 0 } };
  for (const r of agg) {
    if (r._id === 'motorcycle' || r._id === 'car') result[r._id] = { total: r.total, count: r.count };
  }
  return result;
};

// ─── 1. Dashboard ─────────────────────────────────────────────────────────────

export const getDashboard = async () => {
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(new Date());
  const todayFilter = { $gte: today, $lte: tomorrow };

  const [
    subRevenue,
    sessionRevenue,
    bookingRevenue,
    cashRevenue,
    subByVehicle,
    sessionTransferByVehicle,
    bookingByVehicle,
    cashByVehicle,
    activeSessionsCount,
    activeSubsCount,
    pendingBookingsCount,
    todayCheckinsCount,
    todayCheckoutsCount,
  ] = await Promise.all([
    sumPayments({ targetType: 'subscription', paidAt: todayFilter }),
    sumPayments({ targetType: 'session', paidAt: todayFilter }),
    sumPayments({ targetType: 'booking', paidAt: todayFilter }),
    sumCashSessions({ exitTime: todayFilter }),
    sumPaymentsByVehicle('subscription', todayFilter),
    sumPaymentsByVehicle('session', todayFilter),
    sumPaymentsByVehicle('booking', todayFilter),
    sumCashSessionsByVehicle({ exitTime: todayFilter }),
    ParkingSession.countDocuments({ status: 'active' }),
    Subscription.countDocuments({ status: 'active' }),
    Booking.countDocuments({ status: { $in: ['pending', 'paid'] } }),
    ParkingSession.countDocuments({ entryTime: todayFilter }),
    ParkingSession.countDocuments({ exitTime: todayFilter, status: 'completed' }),
  ]);

  const totalCapacityAgg = await Floor.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: '$totalSlots' } } },
  ]);
  const totalCapacity = totalCapacityAgg[0]?.total || 0;

  const buildVehicleTotal = (v) => ({
    subscription: subByVehicle[v]?.total || 0,
    booking: bookingByVehicle[v]?.total || 0,
    sessionTransfer: sessionTransferByVehicle[v]?.total || 0,
    sessionCash: cashByVehicle[v]?.total || 0,
    total:
      (subByVehicle[v]?.total || 0) +
      (bookingByVehicle[v]?.total || 0) +
      (sessionTransferByVehicle[v]?.total || 0) +
      (cashByVehicle[v]?.total || 0),
  });

  return {
    date: today,
    revenueToday: {
      subscription: subRevenue.total,
      booking: bookingRevenue.total,
      sessionTransfer: sessionRevenue.total,
      sessionCash: cashRevenue.total,
      total: subRevenue.total + bookingRevenue.total + sessionRevenue.total + cashRevenue.total,
      byVehicleType: {
        motorcycle: buildVehicleTotal('motorcycle'),
        car: buildVehicleTotal('car'),
      },
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

// ─── 2. Revenue (with groupBy: day | week | month) ────────────────────────────

export const getRevenue = async ({ from, to, groupBy = 'day' } = {}) => {
  const start = from ? startOfDay(new Date(from)) : daysAgo(30);
  const end = to ? endOfDay(new Date(to)) : endOfDay(new Date());
  const grp = ['day', 'week', 'month'].includes(groupBy) ? groupBy : 'day';

  const [subAgg, bookingAgg, sessionTransferAgg, cashAgg] = await Promise.all([
    Payment.aggregate([
      { $match: { status: 'paid', targetType: 'subscription', paidAt: { $gte: start, $lte: end } } },
      { $group: { _id: periodExpr('$paidAt', grp), total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      { $match: { status: 'paid', targetType: 'booking', paidAt: { $gte: start, $lte: end } } },
      { $group: { _id: periodExpr('$paidAt', grp), total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      { $match: { status: 'paid', targetType: 'session', paidAt: { $gte: start, $lte: end } } },
      { $group: { _id: periodExpr('$paidAt', grp), total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    ParkingSession.aggregate([
      { $match: { status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', exitTime: { $gte: start, $lte: end } } },
      { $group: { _id: periodExpr('$exitTime', grp), total: { $sum: '$fee' }, count: { $sum: 1 } } },
    ]),
  ]);

  const periodMap = new Map();
  const addToPeriod = (period, source, amount, count) => {
    if (!periodMap.has(period)) {
      periodMap.set(period, { period, subscription: 0, booking: 0, sessionTransfer: 0, sessionCash: 0, total: 0, transactions: 0 });
    }
    const row = periodMap.get(period);
    row[source] += amount;
    row.total += amount;
    row.transactions += count;
  };

  subAgg.forEach((r) => addToPeriod(r._id, 'subscription', r.total, r.count));
  bookingAgg.forEach((r) => addToPeriod(r._id, 'booking', r.total, r.count));
  sessionTransferAgg.forEach((r) => addToPeriod(r._id, 'sessionTransfer', r.total, r.count));
  cashAgg.forEach((r) => addToPeriod(r._id, 'sessionCash', r.total, r.count));

  const periods = [...periodMap.values()].sort((a, b) => a.period.localeCompare(b.period));
  const totals = periods.reduce(
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

  return { from: start, to: end, groupBy: grp, totals, periods };
};

export const getRevenueByVehicleType = async ({ from, to, groupBy = 'day' } = {}) => {
  const start = from ? startOfDay(new Date(from)) : daysAgo(30);
  const end = to ? endOfDay(new Date(to)) : endOfDay(new Date());
  const grp = ['day', 'week', 'month'].includes(groupBy) ? groupBy : 'day';

  const [cashAgg, sessionTransferAgg, subscriptionAgg, bookingAgg] = await Promise.all([
    ParkingSession.aggregate([
      { $match: { status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', exitTime: { $gte: start, $lte: end } } },
      { $group: { _id: { vehicleType: '$vehicleType', period: periodExpr('$exitTime', grp) }, total: { $sum: '$fee' }, count: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      { $match: { status: 'paid', targetType: 'session', paidAt: { $gte: start, $lte: end } } },
      { $lookup: { from: 'parkingsessions', localField: 'sessionId', foreignField: '_id', as: 'session' } },
      { $unwind: '$session' },
      { $group: { _id: { vehicleType: '$session.vehicleType', period: periodExpr('$paidAt', grp) }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      { $match: { status: 'paid', targetType: 'subscription', paidAt: { $gte: start, $lte: end } } },
      { $lookup: { from: 'subscriptions', localField: 'subscriptionId', foreignField: '_id', as: 'subscription' } },
      { $unwind: '$subscription' },
      { $group: { _id: { vehicleType: '$subscription.vehicleType', period: periodExpr('$paidAt', grp) }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      { $match: { status: 'paid', targetType: 'booking', paidAt: { $gte: start, $lte: end } } },
      { $lookup: { from: 'bookings', localField: 'bookingId', foreignField: '_id', as: 'booking' } },
      { $unwind: '$booking' },
      { $group: { _id: { vehicleType: '$booking.vehicleType', period: periodExpr('$paidAt', grp) }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
  ]);

  const emptyBreakdown = () => ({ subscription: 0, booking: 0, sessionTransfer: 0, sessionCash: 0, total: 0, transactions: 0 });
  const periodMap = new Map();
  const totals = { motorcycle: emptyBreakdown(), car: emptyBreakdown() };

  const addEntry = (vehicleType, period, source, amount, count) => {
    const vt = vehicleType === 'motorcycle' ? 'motorcycle' : 'car';
    if (!periodMap.has(period)) periodMap.set(period, { period, motorcycle: emptyBreakdown(), car: emptyBreakdown() });
    const p = periodMap.get(period);
    p[vt][source] += amount;
    p[vt].total += amount;
    p[vt].transactions += count;
    totals[vt][source] += amount;
    totals[vt].total += amount;
    totals[vt].transactions += count;
  };

  cashAgg.forEach((r) => addEntry(r._id.vehicleType, r._id.period, 'sessionCash', r.total, r.count));
  sessionTransferAgg.forEach((r) => addEntry(r._id.vehicleType, r._id.period, 'sessionTransfer', r.total, r.count));
  subscriptionAgg.forEach((r) => addEntry(r._id.vehicleType, r._id.period, 'subscription', r.total, r.count));
  bookingAgg.forEach((r) => addEntry(r._id.vehicleType, r._id.period, 'booking', r.total, r.count));

  const periods = [...periodMap.values()].sort((a, b) => a.period.localeCompare(b.period));

  return { from: start, to: end, groupBy: grp, totals, periods };
};

export const getRevenueComparison = async ({ period = 'month' } = {}) => {
  const now = new Date();
  let currentStart, currentEnd, prevStart, prevEnd;

  if (period === 'week') {
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    currentStart = startOfDay(new Date(now.getTime() + diffToMonday * 86400000));
    currentEnd = endOfDay(now);
    prevStart = startOfDay(new Date(currentStart.getTime() - 7 * 86400000));
    prevEnd = endOfDay(new Date(currentStart.getTime() - 86400000));
  } else if (period === 'year') {
    currentStart = startOfDay(new Date(now.getFullYear(), 0, 1));
    currentEnd = endOfDay(now);
    prevStart = startOfDay(new Date(now.getFullYear() - 1, 0, 1));
    prevEnd = endOfDay(new Date(now.getFullYear() - 1, 11, 31));
  } else {
    // month (default)
    currentStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    currentEnd = endOfDay(now);
    prevStart = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    prevEnd = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
  }

  const fetchTotals = async (start, end) => {
    const [sub, booking, sessionTransfer, cash] = await Promise.all([
      sumPayments({ targetType: 'subscription', paidAt: { $gte: start, $lte: end } }),
      sumPayments({ targetType: 'booking', paidAt: { $gte: start, $lte: end } }),
      sumPayments({ targetType: 'session', paidAt: { $gte: start, $lte: end } }),
      sumCashSessions({ exitTime: { $gte: start, $lte: end } }),
    ]);
    return {
      subscription: sub.total,
      booking: booking.total,
      sessionTransfer: sessionTransfer.total,
      sessionCash: cash.total,
      total: sub.total + booking.total + sessionTransfer.total + cash.total,
      transactions: sub.count + booking.count + sessionTransfer.count + cash.count,
    };
  };

  const [current, previous] = await Promise.all([
    fetchTotals(currentStart, currentEnd),
    fetchTotals(prevStart, prevEnd),
  ]);

  const changePct =
    previous.total > 0
      ? Math.round(((current.total - previous.total) / previous.total) * 1000) / 10
      : null;

  return {
    period,
    current: { from: currentStart, to: currentEnd, ...current },
    previous: { from: prevStart, to: prevEnd, ...previous },
    changePercent: changePct,
    trend: changePct === null ? 'no_data' : changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'flat',
  };
};

export const getSessionStats = async ({ from, to } = {}) => {
  const start = from ? startOfDay(new Date(from)) : daysAgo(7);
  const end = to ? endOfDay(new Date(to)) : endOfDay(new Date());

  const [byVehicleType, byCustomerType, byStatus, durationStats, durationDist, daily] = await Promise.all([
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
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    ParkingSession.aggregate([
      {
        $match: {
          status: 'completed',
          exitTime: { $exists: true, $ne: null },
          entryTime: { $gte: start, $lte: end },
        },
      },
      {
        $project: {
          vehicleType: 1,
          fee: 1,
          durationMinutes: { $divide: [{ $subtract: ['$exitTime', '$entryTime'] }, 60000] },
        },
      },
      {
        $group: {
          _id: '$vehicleType',
          count: { $sum: 1 },
          avgDurationMinutes: { $avg: '$durationMinutes' },
          minDurationMinutes: { $min: '$durationMinutes' },
          maxDurationMinutes: { $max: '$durationMinutes' },
          avgFee: { $avg: '$fee' },
          totalFee: { $sum: '$fee' },
        },
      },
    ]),
    ParkingSession.aggregate([
      {
        $match: {
          status: 'completed',
          exitTime: { $exists: true, $ne: null },
          entryTime: { $gte: start, $lte: end },
        },
      },
      {
        $project: {
          durationHours: { $divide: [{ $subtract: ['$exitTime', '$entryTime'] }, 3600000] },
        },
      },
      {
        $bucket: {
          groupBy: '$durationHours',
          boundaries: [0, 1, 2, 4, 8, 24],
          default: 'over_24h',
          output: { count: { $sum: 1 } },
        },
      },
    ]),
    ParkingSession.aggregate([
      { $match: { entryTime: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$entryTime' } },
            vehicleType: '$vehicleType',
          },
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          totalFee: { $sum: '$fee' },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]),
  ]);

  const totalSessions = byVehicleType.reduce((s, x) => s + x.count, 0);

  const bucketBoundaries = [0, 1, 2, 4, 8, 24];
  const durationDistribution = durationDist.map((b) => ({
    range: b._id === 'over_24h' ? 'over_24h' : `${b._id}-${bucketBoundaries[bucketBoundaries.indexOf(b._id) + 1]}h`,
    count: b.count,
  }));

  const dailyMap = new Map();
  for (const r of daily) {
    const { date, vehicleType } = r._id;
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { date, total: 0, motorcycle: 0, car: 0, completed: 0, totalFee: 0 });
    }
    const d = dailyMap.get(date);
    d[vehicleType] = (d[vehicleType] || 0) + r.count;
    d.total += r.count;
    d.completed += r.completed;
    d.totalFee += r.totalFee;
  }

  return {
    from: start,
    to: end,
    totalSessions,
    byVehicleType: Object.fromEntries(byVehicleType.map((x) => [x._id, x.count])),
    byCustomerType: Object.fromEntries(byCustomerType.map((x) => [x._id, x.count])),
    byStatus: Object.fromEntries(byStatus.map((x) => [x._id, x.count])),
    durationStats: Object.fromEntries(
      durationStats.map((x) => [
        x._id,
        {
          count: x.count,
          avgDurationMinutes: Math.round(x.avgDurationMinutes),
          minDurationMinutes: Math.round(x.minDurationMinutes),
          maxDurationMinutes: Math.round(x.maxDurationMinutes),
          avgFee: Math.round(x.avgFee),
          totalFee: x.totalFee,
        },
      ])
    ),
    durationDistribution,
    daily: [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
  };
};

export const getSubscriptionStats = async ({ from, to } = {}) => {
  const start = from ? startOfDay(new Date(from)) : daysAgo(30);
  const end = to ? endOfDay(new Date(to)) : endOfDay(new Date());
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [
    activeByPlan,
    activeByVehicleType,
    newInPeriod,
    cancelledInPeriod,
    expiredInPeriod,
    expiring7,
    expiring30,
    daily,
    revenueByPlan,
  ] = await Promise.all([
    Subscription.aggregate([
      { $match: { status: 'active' } },
      { $lookup: { from: 'plans', localField: 'planId', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
      {
        $group: {
          _id: { code: '$plan.code', name: '$plan.name', vehicleType: '$plan.vehicleType' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.code': 1 } },
    ]),
    Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$vehicleType', count: { $sum: 1 } } },
    ]),
    Subscription.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    Subscription.countDocuments({ updatedAt: { $gte: start, $lte: end }, status: 'cancelled' }),
    Subscription.countDocuments({ updatedAt: { $gte: start, $lte: end }, status: 'expired' }),
    Subscription.countDocuments({ status: 'active', endDate: { $gte: now, $lte: in7Days } }),
    Subscription.countDocuments({ status: 'active', endDate: { $gte: now, $lte: in30Days } }),
    Subscription.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]),
    Payment.aggregate([
      { $match: { status: 'paid', targetType: 'subscription', paidAt: { $gte: start, $lte: end } } },
      { $lookup: { from: 'subscriptions', localField: 'subscriptionId', foreignField: '_id', as: 'sub' } },
      { $unwind: '$sub' },
      { $lookup: { from: 'plans', localField: 'sub.planId', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
      {
        $group: {
          _id: { code: '$plan.code', name: '$plan.name', vehicleType: '$plan.vehicleType' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.code': 1 } },
    ]),
  ]);

  const dailyMap = new Map();
  for (const r of daily) {
    const { date, status } = r._id;
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { date, new: 0, cancelled: 0, expired: 0 });
    }
    const d = dailyMap.get(date);
    if (status === 'active' || status === 'pending') d.new += r.count;
    else if (status === 'cancelled') d.cancelled += r.count;
    else if (status === 'expired') d.expired += r.count;
  }

  const totalActive = activeByVehicleType.reduce((s, x) => s + x.count, 0);

  return {
    from: start,
    to: end,
    active: {
      total: totalActive,
      byVehicleType: Object.fromEntries(activeByVehicleType.map((x) => [x._id, x.count])),
      byPlan: activeByPlan.map((x) => ({
        planCode: x._id.code,
        planName: x._id.name,
        vehicleType: x._id.vehicleType,
        count: x.count,
      })),
    },
    period: {
      newSubscriptions: newInPeriod,
      cancelledSubscriptions: cancelledInPeriod,
      expiredSubscriptions: expiredInPeriod,
    },
    expiring: {
      in7Days: expiring7,
      in30Days: expiring30,
    },
    revenueByPlan: revenueByPlan.map((x) => ({
      planCode: x._id.code,
      planName: x._id.name,
      vehicleType: x._id.vehicleType,
      total: x.total,
      count: x.count,
    })),
    daily: [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
  };
};

export const getBookingStats = async ({ from, to } = {}) => {
  const start = from ? startOfDay(new Date(from)) : daysAgo(30);
  const end = to ? endOfDay(new Date(to)) : endOfDay(new Date());

  const [byStatus, durationAgg, daily] = await Promise.all([
    Booking.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]),
    Booking.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: ['paid', 'used', 'expired'] } } },
      {
        $group: {
          _id: null,
          avgDurationHours: { $avg: '$durationHours' },
          minDurationHours: { $min: '$durationHours' },
          maxDurationHours: { $max: '$durationHours' },
          avgAmount: { $avg: '$amount' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
    Booking.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status',
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]),
  ]);

  const statusMap = {};
  const revenueMap = {};
  for (const r of byStatus) {
    statusMap[r._id] = r.count;
    revenueMap[r._id] = r.totalAmount;
  }

  const totalCreated = Object.values(statusMap).reduce((s, c) => s + c, 0);
  const paidCount = (statusMap.paid || 0) + (statusMap.used || 0) + (statusMap.expired || 0);
  const usedCount = statusMap.used || 0;
  const noShowCount = statusMap.expired || 0;
  const cancelledCount = statusMap.cancelled || 0;

  const dailyMap = new Map();
  for (const r of daily) {
    const { date, status } = r._id;
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { date, created: 0, paid: 0, used: 0, cancelled: 0, expired: 0, revenue: 0 });
    }
    const d = dailyMap.get(date);
    d.created += r.count;
    d[status] = (d[status] || 0) + r.count;
    if (status === 'used' || status === 'paid') d.revenue += r.totalAmount;
  }

  const ds = durationAgg[0] || null;

  return {
    from: start,
    to: end,
    summary: {
      total: totalCreated,
      byStatus: statusMap,
      revenueByStatus: revenueMap,
    },
    funnel: {
      created: totalCreated,
      paid: paidCount,
      used: usedCount,
      noShow: noShowCount,
      cancelled: cancelledCount,
      conversionRate: paidCount > 0 ? Math.round((usedCount / paidCount) * 100) : 0,
      noShowRate: paidCount > 0 ? Math.round((noShowCount / paidCount) * 100) : 0,
    },
    durationStats: ds
      ? {
          avgDurationHours: Math.round(ds.avgDurationHours * 10) / 10,
          minDurationHours: ds.minDurationHours,
          maxDurationHours: ds.maxDurationHours,
          avgAmount: Math.round(ds.avgAmount),
          totalAmount: ds.totalAmount,
        }
      : null,
    daily: [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
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
      { $group: { _id: '$floorId', totalCapacity: { $sum: '$capacity' }, totalOccupied: { $sum: '$occupiedCount' } } },
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
          occupied,
          empty: Math.max(0, f.totalSlots - occupied),
          reserved: 0,
          maintenance: 0,
          utilizationPercent: f.totalSlots > 0 ? Math.round((occupied / f.totalSlots) * 100) : 0,
        };
      }
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
        rowStats.totalCapacity > 0 ? Math.round((rowStats.totalOccupied / rowStats.totalCapacity) * 100) : 0,
    };
  });

  const totalOccupied = floorReport.reduce((s, f) => s + (f.occupied || 0), 0);
  const totalCapacity = floorReport.reduce((s, f) => s + (f.totalCapacity || f.totalSlots || 0), 0);

  return {
    overall: {
      totalCapacity,
      occupied: totalOccupied,
      utilizationPercent: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
    },
    floors: floorReport,
  };
};

export const getOccupancyTrend = async ({ from, to, floorId } = {}) => {
  const start = from ? startOfDay(new Date(from)) : daysAgo(30);
  const end = to ? endOfDay(new Date(to)) : endOfDay(new Date());

  let sessionMatch = { entryTime: { $gte: start, $lte: end } };

  if (floorId) {
    const fId = new mongoose.Types.ObjectId(floorId);
    const [rowIds, slotIds] = await Promise.all([
      ParkingRow.find({ floorId: fId }).distinct('_id'),
      ParkingSlot.find({ floorId: fId }).distinct('_id'),
    ]);
    sessionMatch = {
      entryTime: { $gte: start, $lte: end },
      $or: [
        { floorId: fId },
        ...(rowIds.length ? [{ rowId: { $in: rowIds } }] : []),
        ...(slotIds.length ? [{ slotId: { $in: slotIds } }] : []),
      ],
    };
  }

  const [dailyAgg, floors] = await Promise.all([
    ParkingSession.aggregate([
      { $match: sessionMatch },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$entryTime' } },
            vehicleType: '$vehicleType',
          },
          checkIns: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]),
    Floor.find({ isActive: true, ...(floorId ? { _id: new mongoose.Types.ObjectId(floorId) } : {}) })
      .select('totalSlots'),
  ]);

  const totalCapacity = floors.reduce((s, f) => s + (f.totalSlots || 0), 0);

  const dailyMap = new Map();
  for (const r of dailyAgg) {
    const { date, vehicleType } = r._id;
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { date, motorcycle: 0, car: 0, total: 0, completed: 0 });
    }
    const d = dailyMap.get(date);
    d[vehicleType] = (d[vehicleType] || 0) + r.checkIns;
    d.total += r.checkIns;
    d.completed += r.completed;
  }

  const daily = [...dailyMap.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      ...d,
      utilizationEstimate: totalCapacity > 0 ? Math.round((d.total / totalCapacity) * 100) : 0,
    }));

  const avgDailyCheckIns =
    daily.length > 0 ? Math.round(daily.reduce((s, d) => s + d.total, 0) / daily.length) : 0;

  const peakDay = daily.reduce((max, d) => (d.total > (max?.total || 0) ? d : max), null);

  return {
    from: start,
    to: end,
    totalCapacity,
    avgDailyCheckIns,
    peakDay: peakDay ? { date: peakDay.date, checkIns: peakDay.total } : null,
    daily,
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

  const result = Array.from({ length: 24 }, (_, h) => ({ hour: h, motorcycle: 0, car: 0, total: 0 }));
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

export const getStaffReport = async ({ from, to } = {}) => {
  const start = from ? startOfDay(new Date(from)) : daysAgo(30);
  const end = to ? endOfDay(new Date(to)) : endOfDay(new Date());

  const [checkInStats, checkOutStats, cashStats] = await Promise.all([
    // Check-ins per staff
    ParkingSession.aggregate([
      { $match: { entryTime: { $gte: start, $lte: end }, staffId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$staffId',
          checkIns: { $sum: 1 },
          motorcycleCheckIns: { $sum: { $cond: [{ $eq: ['$vehicleType', 'motorcycle'] }, 1, 0] } },
          carCheckIns: { $sum: { $cond: [{ $eq: ['$vehicleType', 'car'] }, 1, 0] } },
        },
      },
    ]),
    ParkingSession.aggregate([
      {
        $match: {
          exitTime: { $gte: start, $lte: end },
          status: 'completed',
          checkOutStaffId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$checkOutStaffId',
          checkOuts: { $sum: 1 },
          totalRevenue: { $sum: '$fee' },
        },
      },
    ]),
    ParkingSession.aggregate([
      {
        $match: {
          exitTime: { $gte: start, $lte: end },
          status: 'completed',
          paymentMethod: 'cash',
          paymentStatus: 'paid',
          cashCollectedBy: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$cashCollectedBy',
          cashTransactions: { $sum: 1 },
          cashAmount: { $sum: '$fee' },
        },
      },
    ]),
  ]);

  const allIds = new Set([
    ...checkInStats.map((x) => x._id.toString()),
    ...checkOutStats.map((x) => x._id.toString()),
    ...cashStats.map((x) => x._id.toString()),
  ]);

  const staffList = await User.find(
    { _id: { $in: [...allIds] } },
    { fullName: 1, email: 1, role: 1 }
  ).lean();
  const staffInfoMap = new Map(staffList.map((s) => [s._id.toString(), s]));

  const staffData = new Map();
  const getOrCreate = (id) => {
    const key = id.toString();
    if (!staffData.has(key)) {
      const info = staffInfoMap.get(key);
      staffData.set(key, {
        staffId: id,
        fullName: info?.fullName || 'Unknown',
        email: info?.email || '',
        role: info?.role || '',
        checkIns: 0,
        motorcycleCheckIns: 0,
        carCheckIns: 0,
        checkOuts: 0,
        totalRevenue: 0,
        cashTransactions: 0,
        cashAmount: 0,
      });
    }
    return staffData.get(key);
  };

  for (const r of checkInStats) {
    Object.assign(getOrCreate(r._id), {
      checkIns: r.checkIns,
      motorcycleCheckIns: r.motorcycleCheckIns,
      carCheckIns: r.carCheckIns,
    });
  }
  for (const r of checkOutStats) {
    const d = getOrCreate(r._id);
    d.checkOuts = r.checkOuts;
    d.totalRevenue = r.totalRevenue;
  }
  for (const r of cashStats) {
    const d = getOrCreate(r._id);
    d.cashTransactions = r.cashTransactions;
    d.cashAmount = r.cashAmount;
  }

  const staff = [...staffData.values()].sort((a, b) => b.checkIns - a.checkIns);
  const totals = staff.reduce(
    (acc, s) => {
      acc.checkIns += s.checkIns;
      acc.checkOuts += s.checkOuts;
      acc.totalRevenue += s.totalRevenue;
      acc.cashAmount += s.cashAmount;
      return acc;
    },
    { checkIns: 0, checkOuts: 0, totalRevenue: 0, cashAmount: 0 }
  );

  return { from: start, to: end, totals, staff };
};
