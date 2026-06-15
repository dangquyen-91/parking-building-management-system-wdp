import axios, { AxiosError, AxiosHeaders } from 'axios'
import { AUTH_STORAGE_KEYS } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

export type ManagerPlan = {
  _id: string
  code: string
  name: string
  vehicleType: 'motorcycle' | 'car'
  durationDays: number
  price: number
  description?: string
  isActive: boolean
}

export type ManagerPlanUpdatePayload = {
  name?: string
  price?: number
  durationDays?: number
  description?: string
  isActive?: boolean
}

const managerPlansHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

managerPlansHttp.interceptors.request.use((config) => {
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

export const managerPlansApi = {
  async getPlans(params?: { vehicleType?: ManagerPlan['vehicleType']; isActive?: boolean }) {
    try {
      const response = await managerPlansHttp.get<ApiEnvelope<{ plans: ManagerPlan[] }>>('/plans', { params })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async updatePlan(id: string, payload: ManagerPlanUpdatePayload) {
    try {
      const response = await managerPlansHttp.patch<ApiEnvelope<{ plan: ManagerPlan }>>(`/plans/${id}`, payload)
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },
}
