import axios, { AxiosError, AxiosHeaders } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1'
const ACCESS_TOKEN_KEY = 'accessToken'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

export type Building = {
  _id: string
  name: string
  address: string
  description?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export type Floor = {
  _id: string
  buildingId: {
    _id: string
    name?: string
    address?: string
  } | string
  floorNumber: number
  vehicleType: 'motorcycle' | 'car'
  floorType: 'resident' | 'visitor'
  totalSlots: number
  description?: string
  isActive?: boolean
}

export type BuildingPayload = {
  name: string
  address: string
  description?: string
}

export type FloorPayload = {
  buildingId: string
  floorNumber: number
  vehicleType: 'motorcycle' | 'car'
  floorType: 'resident' | 'visitor'
  totalSlots: number
  description?: string
}

export type FloorUpdatePayload = Omit<FloorPayload, 'buildingId'>

type PaginatedBuildingsResponse = {
  buildings: Building[]
  total: number
  page: number
  limit: number
}

type PaginatedFloorsResponse = {
  floors: Floor[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

const managerHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

managerHttp.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)

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

export const managerBuildingsApi = {
  async getBuildings(params?: {
    page?: number
    limit?: number
    isActive?: boolean
    sort?: 'name' | 'address' | 'createdAt'
    order?: 'asc' | 'desc'
  }) {
    try {
      const response = await managerHttp.get<ApiEnvelope<PaginatedBuildingsResponse>>('/buildings', { params })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async getFloors(params?: {
    buildingId?: string
    vehicleType?: 'motorcycle' | 'car'
    floorType?: 'resident' | 'visitor'
    isActive?: boolean
    sort?: 'floorNumber' | 'vehicleType' | 'createdAt'
    order?: 'asc' | 'desc'
    page?: number
    limit?: number
  }) {
    try {
      const response = await managerHttp.get<ApiEnvelope<PaginatedFloorsResponse>>('/floors', { params })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async createBuilding(payload: BuildingPayload) {
    try {
      const response = await managerHttp.post<ApiEnvelope<{ building: Building }>>('/buildings', payload)
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async updateBuilding(id: string, payload: BuildingPayload) {
    try {
      const response = await managerHttp.patch<ApiEnvelope<{ building: Building }>>(`/buildings/${id}`, payload)
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async createFloor(payload: FloorPayload) {
    try {
      const response = await managerHttp.post<ApiEnvelope<{ floor: Floor }>>('/floors', payload)
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async updateFloor(id: string, payload: FloorUpdatePayload) {
    try {
      const response = await managerHttp.patch<ApiEnvelope<{ floor: Floor }>>(`/floors/${id}`, payload)
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },
}
