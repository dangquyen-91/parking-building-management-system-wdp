import axios, { AxiosError, AxiosHeaders } from 'axios'
import { AUTH_STORAGE_KEYS } from './authApi'
import type { GateSession } from './staffGateApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

export type ManagerStaffUser = {
  _id: string
  fullName: string
  email: string
  phone?: string
  role: 'staff'
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

type StaffResponse = {
  users: ManagerStaffUser[]
  total: number
  page: number
  limit: number
}

type SessionsResponse = {
  sessions: GateSession[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

const managerStaffHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

managerStaffHttp.interceptors.request.use((config) => {
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

export const managerStaffApi = {
  async getStaff() {
    try {
      const response = await managerStaffHttp.get<ApiEnvelope<StaffResponse>>('/users', {
        params: { role: 'staff', limit: 100, sort: 'fullName', order: 'asc' },
      })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async getActiveSessions() {
    try {
      const response = await managerStaffHttp.get<ApiEnvelope<SessionsResponse>>('/sessions', {
        params: { limit: 100 },
      })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },
}
