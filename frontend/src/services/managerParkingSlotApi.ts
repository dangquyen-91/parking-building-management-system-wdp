import axios, { AxiosError, AxiosHeaders } from 'axios'
import { API_BASE_URL } from './apiConfig'
import { AUTH_STORAGE_KEYS } from './authApi'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

export type SlotStatus = 'empty' | 'occupied' | 'reserved' | 'maintenance'

export type ParkingSlot = {
  _id: string
  floorId:
    | {
        _id: string
        floorNumber?: number
        vehicleType?: string
        buildingId?: {
          _id: string
          name?: string
          address?: string
        }
      }
    | string
  slotCode: string
  vehicleType: 'car' | 'motorcycle'
  status: SlotStatus
  note?: string
}

export type SlotCreatePayload = {
  floorId: string
  slotCode: string
  vehicleType: 'car'
  note?: string
}

export type SlotUpdatePayload = {
  slotCode?: string
  vehicleType?: 'car' | 'motorcycle'
  status?: SlotStatus
  note?: string
}

export type SlotBulkCreatePayload = {
  floorId: string
  quantity: number
  prefix?: string
  startFrom?: number
}

type PaginatedSlotsResponse = {
  slots: ParkingSlot[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

const slotHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

slotHttp.interceptors.request.use((config) => {
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

export const parkingSlotApi = {
  async getSlots(params?: {
    floorId?: string
    buildingId?: string
    status?: SlotStatus
    vehicleType?: 'car' | 'motorcycle'
    sortBy?: 'slotCode' | 'vehicleType' | 'status' | 'createdAt'
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
  }) {
    try {
      const response = await slotHttp.get<ApiEnvelope<PaginatedSlotsResponse>>('/slots', { params })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async createSlot(payload: SlotCreatePayload) {
    try {
      const response = await slotHttp.post<ApiEnvelope<{ slot: ParkingSlot }>>('/slots', payload)
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async bulkCreateSlots(payload: SlotBulkCreatePayload) {
    try {
      const response = await slotHttp.post<ApiEnvelope<{ slots: ParkingSlot[] }>>('/slots/bulk', payload)
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async updateSlot(id: string, payload: SlotUpdatePayload) {
    try {
      const response = await slotHttp.patch<ApiEnvelope<{ slot: ParkingSlot }>>(`/slots/${id}`, payload)
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async deleteSlot(id: string) {
    try {
      await slotHttp.delete(`/slots/${id}`)
    } catch (error) {
      throw getApiError(error)
    }
  },
}
