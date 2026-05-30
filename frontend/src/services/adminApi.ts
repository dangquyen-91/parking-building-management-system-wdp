import axios, { AxiosError } from 'axios'
import { AUTH_STORAGE_KEYS, type AuthRole } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message: string
  data: T
}

export type ApiList<T, K extends string> = Record<K, T[]> & {
  total: number
  page: number
  limit: number
  totalPages?: number
}

export type AdminUserDto = {
  _id: string
  fullName: string
  email: string
  role: AuthRole
  phone?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type AdminBuildingDto = {
  _id: string
  name: string
  address: string
  description?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type AdminFloorDto = {
  _id: string
  buildingId: AdminBuildingDto | string
  floorNumber: number
  vehicleType: 'motorcycle' | 'car'
  floorType: 'resident' | 'visitor'
  totalSlots: number
  description?: string
  isActive: boolean
  slotStats?: Record<string, number>
  rowStats?: {
    totalRows: number
    totalCapacity: number
    totalOccupied: number
    available: number
    full: number
    maintenance: number
  }
}

export type AdminSlotDto = {
  _id: string
  floorId: AdminFloorDto | string
  slotCode: string
  vehicleType: 'motorcycle' | 'car'
  status: 'empty' | 'occupied' | 'reserved' | 'maintenance'
  note?: string
}

export type AdminRowDto = {
  _id: string
  floorId: AdminFloorDto | string
  rowCode: string
  capacity: number
  occupiedCount: number
  status: 'available' | 'full' | 'maintenance'
  note?: string
}

export type AdminSessionDto = {
  _id: string
  slotId?: AdminSlotDto | null
  rowId?: AdminRowDto | null
  licensePlate: string
  vehicleType: 'motorcycle' | 'car'
  entryTime: string
  exitTime?: string
  fee?: number
  staffId?: Pick<AdminUserDto, '_id' | 'fullName' | 'email'>
  userId?: Pick<AdminUserDto, '_id' | 'fullName' | 'email' | 'phone'> | null
  status: 'active' | 'completed' | 'cancelled'
  note?: string
}

export type QueryParams = Record<string, string | number | boolean | undefined>

const adminHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

adminHttp.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

function getApiError(error: unknown) {
  if (error instanceof AxiosError) {
    return new Error(error.response?.data?.message ?? error.message, { cause: error })
  }

  return error
}

async function getData<T>(path: string, params?: QueryParams) {
  try {
    const response = await adminHttp.get<ApiEnvelope<T>>(path, { params })
    return response.data.data
  } catch (error) {
    throw getApiError(error)
  }
}

async function patchData<T>(path: string, payload: unknown) {
  try {
    const response = await adminHttp.patch<ApiEnvelope<T>>(path, payload)
    return response.data.data
  } catch (error) {
    throw getApiError(error)
  }
}

async function postData<T>(path: string, payload: unknown) {
  try {
    const response = await adminHttp.post<ApiEnvelope<T>>(path, payload)
    return response.data.data
  } catch (error) {
    throw getApiError(error)
  }
}

async function deleteData<T>(path: string) {
  try {
    const response = await adminHttp.delete<ApiEnvelope<T>>(path)
    return response.data.data
  } catch (error) {
    throw getApiError(error)
  }
}

export const adminApi = {
  getUsers(params?: QueryParams) {
    return getData<ApiList<AdminUserDto, 'users'>>('/users', params)
  },
  getBuildings(params?: QueryParams) {
    return getData<ApiList<AdminBuildingDto, 'buildings'>>('/buildings', params)
  },
  createBuilding(payload: Pick<AdminBuildingDto, 'name' | 'address'> & { description?: string }) {
    return postData<{ building: AdminBuildingDto }>('/buildings', payload)
  },
  updateBuilding(id: string, payload: Partial<Pick<AdminBuildingDto, 'name' | 'address' | 'description'>>) {
    return patchData<{ building: AdminBuildingDto }>(`/buildings/${id}`, payload)
  },
  deactivateBuilding(id: string) {
    return deleteData<null>(`/buildings/${id}`)
  },
  getFloors(params?: QueryParams) {
    return getData<ApiList<AdminFloorDto, 'floors'>>('/floors', params)
  },
  createFloor(payload: Pick<AdminFloorDto, 'buildingId' | 'floorNumber' | 'vehicleType' | 'floorType' | 'totalSlots'> & { description?: string }) {
    return postData<{ floor: AdminFloorDto }>('/floors', payload)
  },
  updateFloor(id: string, payload: Partial<Pick<AdminFloorDto, 'floorNumber' | 'vehicleType' | 'floorType' | 'totalSlots' | 'description'>>) {
    return patchData<{ floor: AdminFloorDto }>(`/floors/${id}`, payload)
  },
  deactivateFloor(id: string) {
    return deleteData<null>(`/floors/${id}`)
  },
  getSlots(params?: QueryParams) {
    return getData<ApiList<AdminSlotDto, 'slots'>>('/slots', params)
  },
  createSlot(payload: Pick<AdminSlotDto, 'floorId' | 'slotCode' | 'vehicleType'> & { note?: string }) {
    return postData<{ slot: AdminSlotDto }>('/slots', payload)
  },
  bulkCreateSlots(payload: { floorId: string; quantity: number; prefix?: string; startFrom?: number }) {
    return postData<{ slots: AdminSlotDto[]; count: number }>('/slots/bulk', payload)
  },
  updateSlot(id: string, payload: Partial<Pick<AdminSlotDto, 'slotCode' | 'vehicleType' | 'status' | 'note'>>) {
    return patchData<{ slot: AdminSlotDto }>(`/slots/${id}`, payload)
  },
  deleteSlot(id: string) {
    return deleteData<null>(`/slots/${id}`)
  },
  getRows(params?: QueryParams) {
    return getData<ApiList<AdminRowDto, 'rows'>>('/parking-rows', params)
  },
  getSessions(params?: QueryParams) {
    return getData<ApiList<AdminSessionDto, 'sessions'>>('/sessions', params)
  },
  changeUserRole(id: string, role: AuthRole) {
    return patchData<{ user: AdminUserDto }>(`/users/${id}/role`, { role })
  },
  updateUserStatus(id: string, isActive: boolean) {
    return patchData<{ user: AdminUserDto }>(`/users/${id}/status`, { isActive })
  },
  updateSlotStatus(id: string, status: AdminSlotDto['status']) {
    return patchData<{ slot: AdminSlotDto }>(`/slots/${id}`, { status })
  },
}
