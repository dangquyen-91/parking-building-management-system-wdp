import axios, { AxiosError, AxiosHeaders } from 'axios'
import { API_BASE_URL } from './apiConfig'
import { AUTH_STORAGE_KEYS } from './authApi'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

export type ManagerBookingStatus = 'pending' | 'paid' | 'used' | 'expired' | 'cancelled'

export type ManagerBooking = {
  _id: string
  phoneNumber: string
  licensePlate: string
  vehicleType: 'car'
  expectedArrivalTime: string
  expectedExitTime: string
  durationHours: number
  amount: number
  status: ManagerBookingStatus
  userId?: {
    _id: string
    fullName?: string
    email?: string
    phone?: string
  } | string | null
  sessionId?: {
    _id: string
    entryTime?: string
    exitTime?: string
    status?: string
  } | string | null
  usedAt?: string | null
  createdAt?: string
}

type BookingsResponse = {
  bookings: ManagerBooking[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

const managerBookingsHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

managerBookingsHttp.interceptors.request.use((config) => {
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

export const managerBookingsApi = {
  async getBookings(params?: {
    status?: ManagerBookingStatus
    licensePlate?: string
    phoneNumber?: string
    page?: number
    limit?: number
  }) {
    try {
      const response = await managerBookingsHttp.get<ApiEnvelope<BookingsResponse>>('/bookings', { params })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },
}
