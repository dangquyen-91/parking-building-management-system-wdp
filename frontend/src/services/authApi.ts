import axios, { AxiosError } from 'axios'
import { API_BASE_URL } from './apiConfig'

export type AuthRole = 'admin' | 'manager' | 'staff' | 'user'

export type UserVehicle = {
  _id: string
  licensePlate: string
  vehicleType: 'motorcycle' | 'car'
}

export type AuthUser = {
  _id: string
  fullName: string
  email: string
  role: AuthRole
  phone?: string
  vehicles?: UserVehicle[]
  isActive: boolean
}

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message: string
  data: T
}

type LoginResponse = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

type RegisterResponse = {
  user: AuthUser
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  fullName: string
  email: string
  password: string
  phone?: string
}

export const AUTH_STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  user: 'authUser',
} as const

const authHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

authHttp.interceptors.request.use((config) => {
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

export function saveAuthSession(session: LoginResponse) {
  localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, session.accessToken)
  localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, session.refreshToken)
  localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(session.user))
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken)
  localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken)
  localStorage.removeItem(AUTH_STORAGE_KEYS.user)
  localStorage.removeItem('token')
  localStorage.removeItem('parking_access_token')
}

export function getStoredAuthUser() {
  const rawUser = localStorage.getItem(AUTH_STORAGE_KEYS.user)

  if (!rawUser) return undefined

  try {
    return JSON.parse(rawUser) as AuthUser
  } catch {
    clearAuthSession()
    return undefined
  }
}

export function setStoredAuthUser(user: AuthUser) {
  localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user))
  window.dispatchEvent(new Event('auth-user-updated'))
}

export function getDefaultRouteForRole(role?: AuthRole) {
  if (role === 'admin') return '/dashboard'
  if (role === 'manager') return '/manager'
  if (role === 'staff') return '/staff/check-in'

  return '/'
}

export const authApi = {
  async register(payload: RegisterPayload) {
    try {
      const response = await authHttp.post<ApiEnvelope<RegisterResponse>>('/auth/register', payload)

      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async login(payload: LoginPayload) {
    try {
      const response = await authHttp.post<ApiEnvelope<LoginResponse>>('/auth/login', payload)
      saveAuthSession(response.data.data)

      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async logout() {
    try {
      await authHttp.post('/auth/logout')
    } catch (error) {
      throw getApiError(error)
    } finally {
      clearAuthSession()
    }
  },
}
