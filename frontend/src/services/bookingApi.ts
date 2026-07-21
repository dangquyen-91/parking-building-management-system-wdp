import axios, { AxiosError, AxiosHeaders } from 'axios'
import { API_BASE_URL } from './apiConfig'
import { AUTH_STORAGE_KEYS } from './authApi'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

export type BookingStatus = 'pending' | 'paid' | 'used' | 'expired' | 'cancelled'

export type Booking = {
  _id: string
  email: string
  phoneNumber?: string
  licensePlate: string
  vehicleType: 'car'
  expectedArrivalTime: string
  expectedExitTime: string
  durationHours: number
  amount: number
  status: BookingStatus
  paymentId?: string | null
  userId?: string | null
  sessionId?: string | null
  usedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type BookingPayment = {
  orderCode: number
  amount: number
  checkoutUrl: string
  paymentLinkId?: string
  qrCode?: string
  accountNumber?: string
  accountName?: string
  bin?: string
}

export type CreateBookingPayload = {
  email: string
  phone: string
  licensePlate: string
  expectedArrivalTime: string
  expectedExitTime: string
}

export type GetMyBookingsParams = {
  status?: BookingStatus
}

const bookingHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

bookingHttp.interceptors.request.use((config) => {
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

export const bookingApi = {
  async createBooking(payload: CreateBookingPayload) {
    try {
      const response = await bookingHttp.post<ApiEnvelope<{ booking: Booking; payment: BookingPayment }>>(
        '/bookings',
        payload,
      )

      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async getMyBookings(params?: GetMyBookingsParams) {
    try {
      const response = await bookingHttp.get<ApiEnvelope<{ bookings: Booking[] }>>('/bookings/me', { params })

      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },
}
