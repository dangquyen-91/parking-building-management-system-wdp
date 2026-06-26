import axios, { AxiosError, AxiosHeaders } from 'axios'
import { API_BASE_URL } from './apiConfig'
import { AUTH_STORAGE_KEYS } from './authApi'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

export type GateVehicleType = 'motorcycle' | 'car'
export type GateCustomerType = 'resident' | 'walk_in'
export type GateSessionStatus = 'active' | 'completed' | 'cancelled'
export type GatePaymentStatus = 'unpaid' | 'pending' | 'paid'

export type GateBuildingRef = {
  _id: string
  name?: string
  address?: string
}

export type GateFloorRef = {
  _id: string
  floorNumber?: number
  vehicleType?: GateVehicleType
  floorType?: 'resident' | 'visitor'
  totalSlots?: number
  buildingId?: GateBuildingRef | string
}

export type GateSlot = {
  _id: string
  floorId: GateFloorRef | string
  slotCode: string
  vehicleType: GateVehicleType
  status: 'empty' | 'occupied' | 'reserved' | 'maintenance'
  note?: string
}

export type GateRow = {
  _id: string
  floorId: GateFloorRef | string
  rowCode: string
  capacity: number
  occupiedCount: number
  status: 'available' | 'full' | 'maintenance'
  note?: string
}

export type GateUser = {
  _id: string
  fullName?: string
  phone?: string
  email?: string
}

export type GateBooking = {
  _id: string
  expectedArrivalTime: string
  expectedExitTime: string
  durationHours: number
  amount: number
  status: 'paid'
}

export type GateSession = {
  _id: string
  slotId: GateSlot | string | null
  rowId: GateRow | string | null
  licensePlate: string
  vehicleType: GateVehicleType
  customerType: GateCustomerType
  entryTime: string
  exitTime?: string
  fee: number
  paymentStatus: GatePaymentStatus
  status: GateSessionStatus
  userId?: GateUser | string | null
  staffId?: GateUser | string | null
  checkOutStaffId?: GateUser | string | null
  paymentMethod?: 'cash' | 'transfer' | null
  note?: string
}

export type GateLookupResult = {
  licensePlate: string
  status: 'already_active' | 'available'
  customerType: GateCustomerType
  activeSession: GateSession | null
  subscription: {
    _id: string
    owner?: GateUser
    vehicleType: GateVehicleType
    startDate: string
    endDate: string
    plan?: {
      code?: string
      name?: string
      price?: number
      durationDays?: number
    }
  } | null
  booking: GateBooking | null
  hint: {
    lastVisit: {
      vehicleType: GateVehicleType
      entryTime: string
      exitTime?: string
      fee?: number
    } | null
  }
  availableSlots: {
    motorcycle: number
    car: number
  }
}

export type GateCheckoutPreview = {
  sessionId: string
  customerType: GateCustomerType
  bookingId?: string | null
  entryTime: string
  exitTime: string
  fee: number
  toCollect: number
  prepaidAmount: number
  overtimeHours: number
  overtimeFee: number
  note?: string
  breakdown?: {
    durationMs?: number
    blocks?: number
    blockHours?: number
    blockFee?: number
    detail?: string
    hours?: number
    turns?: number
    nights?: number
    prepaidAmount?: number
    fullStayFee?: number
  } | null
  pricing?: {
    vehicleType: GateVehicleType
    mode: 'time_block' | 'fixed_block'
    blockHours?: number | null
    blockFee?: number | null
    timeBlocks?: Array<{
      startHour: number
      endHour: number
      fee: number
      label?: string
    }>
  } | null
}

type ActiveSessionsResponse = {
  sessions: GateSession[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

type RowsResponse = {
  rows: GateRow[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

type SlotsResponse = {
  slots: GateSlot[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

export type GateEntryQr = {
  qrToken: string
  qrImage?: string
  licensePlate: string
  expiresInSeconds?: number
}

const staffHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

staffHttp.interceptors.request.use((config) => {
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

export const staffGateApi = {
  async lookup(licensePlate: string) {
    try {
      const response = await staffHttp.get<ApiEnvelope<GateLookupResult>>('/sessions/lookup', {
        params: { licensePlate },
      })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async getActiveSessions(params?: {
    vehicleType?: GateVehicleType
    licensePlate?: string
    status?: GateSessionStatus
    page?: number
    limit?: number
    refreshAt?: number
  }) {
    try {
      const response = await staffHttp.get<ApiEnvelope<ActiveSessionsResponse>>('/sessions', { params })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async checkIn(payload: {
    vehicleType: GateVehicleType
    licensePlate: string
    slotId?: string
    rowId?: string
    note?: string
    qrToken?: string
  }) {
    try {
      const response = await staffHttp.post<ApiEnvelope<{ session: GateSession }>>('/sessions/check-in', payload)
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async requestEntryQr(licensePlate: string) {
    try {
      const response = await staffHttp.post<ApiEnvelope<GateEntryQr>>('/sessions/entry-qr', {
        licensePlate,
      })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async previewCheckout(sessionId: string) {
    try {
      const response = await staffHttp.get<ApiEnvelope<GateCheckoutPreview>>(
        `/sessions/${sessionId}/checkout/preview`,
      )
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async checkoutCash(sessionId: string, payload?: { qrToken: string; scannedPlate: string }) {
    try {
      const response = await staffHttp.post<ApiEnvelope<{ session: GateSession }>>(
        `/sessions/${sessionId}/checkout/cash`,
        payload,
      )
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async checkoutTransfer(sessionId: string, payload?: { qrToken: string; scannedPlate: string }) {
    try {
      const response = await staffHttp.post<
        ApiEnvelope<{
          session: GateSession
          payment: {
            orderCode?: number
            amount: number
            checkoutUrl?: string
            qrCode?: string
          } | null
          note?: string
          fee?: number
        }>
      >(`/sessions/${sessionId}/checkout/transfer`, payload)
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async getRows(params?: { status?: GateRow['status']; page?: number; limit?: number }) {
    try {
      const response = await staffHttp.get<ApiEnvelope<RowsResponse>>('/parking-rows', { params })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async getSlots(params?: {
    vehicleType?: GateVehicleType
    status?: GateSlot['status']
    page?: number
    limit?: number
    sortBy?: 'slotCode' | 'vehicleType' | 'status' | 'createdAt'
    sortOrder?: 'asc' | 'desc'
  }) {
    try {
      const response = await staffHttp.get<ApiEnvelope<SlotsResponse>>('/slots', { params })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },
}
