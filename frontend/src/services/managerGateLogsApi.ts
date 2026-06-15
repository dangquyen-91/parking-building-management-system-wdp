import axios, { AxiosError, AxiosHeaders } from 'axios'
import { API_BASE_URL } from './apiConfig'
import { AUTH_STORAGE_KEYS } from './authApi'
import type { GateSession, GateVehicleType } from './staffGateApi'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

export type ManagerGateDashboard = {
  date: string
  activity: {
    activeSessions: number
    checkinsToday: number
    checkoutsToday: number
  }
  revenueToday: {
    total: number
  }
}

type ActiveSessionsResponse = {
  sessions: GateSession[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

const managerGateLogsHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

managerGateLogsHttp.interceptors.request.use((config) => {
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

export const managerGateLogsApi = {
  async getActiveSessions(params?: {
    vehicleType?: GateVehicleType
    licensePlate?: string
    page?: number
    limit?: number
  }) {
    try {
      const response = await managerGateLogsHttp.get<ApiEnvelope<ActiveSessionsResponse>>('/sessions', { params })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async getDashboard() {
    try {
      const response = await managerGateLogsHttp.get<ApiEnvelope<ManagerGateDashboard>>('/reports/dashboard')
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },
}
