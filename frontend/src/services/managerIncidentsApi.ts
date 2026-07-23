import axios, { AxiosError, AxiosHeaders } from 'axios'
import { API_BASE_URL } from './apiConfig'
import { AUTH_STORAGE_KEYS } from './authApi'
import type { GateVehicleType } from './staffGateApi'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

export type ManagerIncidentUser = {
  _id: string
  fullName?: string
  email?: string
}

export type ManagerIncidentSession = {
  _id: string
  licensePlate: string
  vehicleType: GateVehicleType
  entryTime?: string
  exitTime?: string
  fee?: number
}

export type ManagerIncident = {
  _id: string
  type: 'lost_qr'
  sessionId?: ManagerIncidentSession | string | null
  licensePlate: string
  vehicleType?: GateVehicleType
  staffId?: ManagerIncidentUser | string | null
  fineAmount: number
  description?: string
  createdAt: string
  updatedAt?: string
}

type IncidentsResponse = {
  incidents: ManagerIncident[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

const managerIncidentsHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

managerIncidentsHttp.interceptors.request.use((config) => {
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

export const managerIncidentsApi = {
  async getLostTickets(params?: { licensePlate?: string; page?: number; limit?: number }) {
    try {
      const response = await managerIncidentsHttp.get<ApiEnvelope<IncidentsResponse>>('/incidents', {
        params: {
          ...params,
          type: 'lost_qr',
        },
      })

      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },
}
