import axios, { AxiosError, AxiosHeaders } from 'axios'
import { AUTH_STORAGE_KEYS } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

export type RevenueSummary = {
  subscription: number
  booking: number
  sessionTransfer: number
  sessionCash: number
  total: number
  transactions: number
}

export type ManagerRevenueReport = {
  from: string
  to: string
  totals: RevenueSummary
  daily: Array<RevenueSummary & { date: string }>
}

export type ManagerSessionReport = {
  from: string
  to: string
  totalSessions: number
  byVehicleType: Record<string, number>
  byCustomerType: Record<string, number>
  daily: Array<{ date: string; count: number }>
}

export type ManagerOccupancyFloor = {
  floorId: string
  floorNumber: string | number
  floorType?: string
  vehicleType: 'car' | 'motorcycle'
  description?: string
  building?: { _id: string; name?: string } | null
  totalSlots?: number
  currentSlots?: number
  totalCapacity?: number
  occupied: number
  empty: number
  reserved?: number
  maintenance?: number
  utilizationPercent: number
}

export type ManagerOccupancyReport = {
  overall: {
    totalCapacity: number
    occupied: number
    utilizationPercent: number
  }
  floors: ManagerOccupancyFloor[]
}

export type ManagerPeakHoursReport = {
  from: string
  to: string
  days: number
  hourly: Array<{ hour: number; motorcycle: number; car: number; total: number }>
  peakHour: { hour: number; count: number }
}

export type ManagerDashboardReport = {
  date: string
  revenueToday: Omit<RevenueSummary, 'transactions'>
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

const managerReportsHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

managerReportsHttp.interceptors.request.use((config) => {
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

async function getReport<T>(path: string, params?: Record<string, string | number>) {
  try {
    const response = await managerReportsHttp.get<ApiEnvelope<T>>(path, { params })
    return response.data.data
  } catch (error) {
    throw getApiError(error)
  }
}

export const managerReportsApi = {
  getDashboard: () => getReport<ManagerDashboardReport>('/reports/dashboard'),
  getRevenue: (params: { from: string; to: string }) =>
    getReport<ManagerRevenueReport>('/reports/revenue', params),
  getSessions: (params: { from: string; to: string }) =>
    getReport<ManagerSessionReport>('/reports/sessions', params),
  getOccupancy: () => getReport<ManagerOccupancyReport>('/reports/occupancy'),
  getPeakHours: (days: number) =>
    getReport<ManagerPeakHoursReport>('/reports/peak-hours', { days }),
}
