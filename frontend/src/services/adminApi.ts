import axios, { AxiosError, AxiosHeaders } from 'axios'
import { API_BASE_URL } from './apiConfig'
import { AUTH_STORAGE_KEYS, type AuthRole } from './authApi'
import type { Building, Floor } from './managerBuildingsApi'
import type { ParkingRow } from './managerParkingRowApi'
import type { ParkingSlot, SlotStatus } from './managerParkingSlotApi'
import type { GateSession, GateVehicleType } from './staffGateApi'
import type { Plan, SubscriptionStatus, VehicleType } from './userSubscriptionApi'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

type Paginated<TName extends string, TItem> = Record<TName, TItem[]> & {
  total: number
  page: number
  limit: number
  totalPages?: number
}

export type AdminUser = {
  _id: string
  fullName: string
  email: string
  role: AuthRole
  phone?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type AdminBookingStatus = 'pending' | 'paid' | 'used' | 'expired' | 'cancelled'

export type AdminBooking = {
  _id: string
  phone?: string
  licensePlate: string
  vehicleType: 'car'
  expectedArrivalTime: string
  expectedExitTime: string
  durationHours: number
  amount: number
  status: AdminBookingStatus
  userId?: Pick<AdminUser, '_id' | 'fullName' | 'email' | 'phone'> | string | null
  sessionId?: Pick<GateSession, '_id' | 'entryTime' | 'exitTime' | 'status'> | string | null
  createdAt?: string
}

export type AdminSubscription = {
  _id: string
  planId: Plan
  userId?: Pick<AdminUser, '_id' | 'fullName' | 'email' | 'phone'> | string | null
  licensePlate: string
  vehicleType: VehicleType
  status: SubscriptionStatus
  startDate?: string | null
  endDate?: string | null
  slotId?: {
    _id: string
    slotCode: string
    vehicleType: VehicleType
    floorId?: {
      _id: string
      floorNumber?: number
      section?: string
      floorType?: string
      buildingId?: string
    }
  } | null
}

export type AdminDashboardReport = {
  date: string
  revenueToday: {
    subscription: number
    booking: number
    sessionTransfer: number
    sessionCash: number
    total: number
  }
  activity: {
    activeSessions: number
    activeSubscriptions: number
    pendingBookings: number
    checkinsToday: number
    checkoutsToday: number
  }
  occupancy: {
    currentVehicles: number
    totalCapacity: number
    utilizationPercent: number
  }
}

export type AdminOccupancyReport = {
  overall: {
    totalCapacity: number
    occupied: number
    utilizationPercent: number
  }
  floors: Array<{
    floorId: string
    floorNumber: number
    section?: string
    floorType: 'resident' | 'visitor'
    vehicleType: VehicleType
    description?: string
    building?: {
      _id: string
      name?: string
    }
    totalSlots?: number
    totalCapacity?: number
    occupied: number
    empty: number
    reserved?: number
    maintenance?: number
    utilizationPercent: number
  }>
}

export type AdminRevenueReport = {
  from: string
  to: string
  groupBy?: 'day' | 'week' | 'month'
  totals: {
    subscription: number
    booking: number
    sessionTransfer: number
    sessionCash: number
    total: number
    transactions: number
  }
  periods: Array<{
    period: string
    subscription: number
    booking: number
    sessionTransfer: number
    sessionCash: number
    total: number
    transactions: number
  }>
  /** Compatibility with older report API responses. */
  daily?: Array<{
    date: string
    subscription: number
    booking: number
    sessionTransfer: number
    sessionCash: number
    total: number
    transactions: number
  }>
}

export type AdminSessionStatsReport = {
  from: string
  to: string
  totalSessions: number
  byVehicleType: Partial<Record<VehicleType, number>>
  byCustomerType: Partial<Record<'resident' | 'walk_in', number>>
  daily: Array<{ date: string; count: number }>
}

export type AdminPeakHoursReport = {
  from: string
  to: string
  days: number
  hourly: Array<{ hour: number; motorcycle: number; car: number; total: number }>
  peakHour: { hour: number; count: number }
}

const adminHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

adminHttp.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)

  if (token) {
    if (config.headers instanceof AxiosHeaders) {
      config.headers.set('Authorization', `Bearer ${token}`)
    } else {
      const headers = AxiosHeaders.from(config.headers ?? {})
      headers.set('Authorization', `Bearer ${token}`)
      config.headers = headers
    }
  }

  return config
})

function getApiError(error: unknown) {
  if (error instanceof AxiosError) {
    return new Error(error.response?.data?.message ?? error.message, { cause: error })
  }

  return error
}

async function getData<T>(path: string, params?: Record<string, unknown>) {
  try {
    const response = await adminHttp.get<ApiEnvelope<T>>(path, { params })
    return response.data.data
  } catch (error) {
    throw getApiError(error)
  }
}

export const adminApi = {
  getUsers(params?: {
    page?: number
    limit?: number
    role?: AuthRole
    isActive?: boolean
    sort?: 'fullName' | 'email' | 'createdAt' | 'role'
    order?: 'asc' | 'desc'
  }) {
    return getData<Paginated<'users', AdminUser>>('/users', params)
  },

  getBuildings(params?: { page?: number; limit?: number; isActive?: boolean; sort?: 'name' | 'address' | 'createdAt'; order?: 'asc' | 'desc' }) {
    return getData<Paginated<'buildings', Building>>('/buildings', params)
  },

  getFloors(params?: { page?: number; limit?: number; buildingId?: string; vehicleType?: VehicleType; floorType?: 'resident' | 'visitor'; isActive?: boolean; sort?: 'floorNumber' | 'vehicleType' | 'createdAt'; order?: 'asc' | 'desc' }) {
    return getData<Paginated<'floors', Floor>>('/floors', params)
  },

  getSlots(params?: { page?: number; limit?: number; buildingId?: string; floorId?: string; status?: SlotStatus; vehicleType?: VehicleType; sortBy?: 'slotCode' | 'vehicleType' | 'status' | 'createdAt'; sortOrder?: 'asc' | 'desc' }) {
    return getData<Paginated<'slots', ParkingSlot>>('/slots', params)
  },

  getRows(params?: { page?: number; limit?: number; buildingId?: string; floorId?: string; status?: ParkingRow['status']; sortBy?: 'rowCode' | 'capacity' | 'occupiedCount' | 'status' | 'createdAt'; sortOrder?: 'asc' | 'desc' }) {
    return getData<Paginated<'rows', ParkingRow>>('/parking-rows', params)
  },

  getBookings(params?: { page?: number; limit?: number; status?: AdminBookingStatus; licensePlate?: string; phoneNumber?: string }) {
    return getData<Paginated<'bookings', AdminBooking>>('/bookings', params)
  },

  getSubscriptions(params?: { page?: number; limit?: number; status?: SubscriptionStatus; vehicleType?: VehicleType; licensePlate?: string }) {
    return getData<Paginated<'subscriptions', AdminSubscription>>('/subscriptions', params)
  },

  getSessions(params?: { page?: number; limit?: number; vehicleType?: GateVehicleType; licensePlate?: string }) {
    return getData<Paginated<'sessions', GateSession>>('/sessions', params)
  },

  getPlans(params?: { vehicleType?: VehicleType; isActive?: boolean }) {
    return getData<{ plans: Plan[] }>('/plans', params)
  },

  getDashboardReport() {
    return getData<AdminDashboardReport>('/reports/dashboard')
  },

  getOccupancyReport() {
    return getData<AdminOccupancyReport>('/reports/occupancy')
  },

  getRevenueReport(params?: { from?: string; to?: string }) {
    return getData<AdminRevenueReport>('/reports/revenue', params)
  },

  getSessionStatsReport(params?: { from?: string; to?: string }) {
    return getData<AdminSessionStatsReport>('/reports/sessions', params)
  },

  getPeakHoursReport(params?: { days?: number }) {
    return getData<AdminPeakHoursReport>('/reports/peak-hours', params)
  },

  async updateUserStatus(id: string, isActive: boolean) {
    try {
      const response = await adminHttp.patch<ApiEnvelope<{ user: AdminUser }>>(`/users/${id}/status`, { isActive })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },
}
