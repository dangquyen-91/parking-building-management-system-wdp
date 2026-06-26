import axios, { AxiosError, AxiosHeaders } from 'axios'
import { API_BASE_URL } from './apiConfig'
import { AUTH_STORAGE_KEYS } from './authApi'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

export type RowStatus = 'available' | 'full' | 'maintenance'

export type ParkingRow = {
  _id: string
  floorId:
    | {
        _id: string
        floorNumber?: number
        vehicleType?: string
        totalSlots?: number
        buildingId?: {
          _id: string
          name?: string
          address?: string
        }
      }
    | string
  rowCode: string
  capacity: number
  occupiedCount: number
  status: RowStatus
  note?: string | null
}

export type RowCreatePayload = {
  floorId: string
  rowCode: string
  capacity: number
  note?: string | null
}

export type RowUpdatePayload = {
  rowCode?: string
  capacity?: number
  note?: string | null
}

type PaginatedRowsResponse = {
  rows: ParkingRow[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

const rowHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

rowHttp.interceptors.request.use((config) => {
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

export const parkingRowApi = {
  async getRows(params?: {
    floorId?: string
    buildingId?: string
    status?: RowStatus
    sortBy?: 'rowCode' | 'capacity' | 'occupiedCount' | 'status' | 'createdAt'
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
  }) {
    try {
      const response = await rowHttp.get<ApiEnvelope<PaginatedRowsResponse>>('/parking-rows', { params })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async createRow(payload: RowCreatePayload) {
    try {
      const response = await rowHttp.post<ApiEnvelope<{ row: ParkingRow }>>('/parking-rows', payload)
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async updateRow(id: string, payload: RowUpdatePayload) {
    try {
      const response = await rowHttp.patch<ApiEnvelope<{ row: ParkingRow }>>(`/parking-rows/${id}`, payload)
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },
}
