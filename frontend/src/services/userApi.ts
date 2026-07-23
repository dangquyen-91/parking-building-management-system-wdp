import axios, { AxiosError, AxiosHeaders } from 'axios'
import { API_BASE_URL } from './apiConfig'
import { AUTH_STORAGE_KEYS, setStoredAuthUser, type AuthUser } from './authApi'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

export type UpdateProfilePayload = {
  fullName: string
  phone?: string
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

export type AddVehiclePayload = {
  licensePlate: string
  vehicleType: 'motorcycle' | 'car'
}

const userHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

userHttp.interceptors.request.use((config) => {
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

export const userApi = {
  async getMe() {
    try {
      const response = await userHttp.get<ApiEnvelope<{ user: AuthUser }>>('/users/me')
      setStoredAuthUser(response.data.data.user)

      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async updateMe(payload: UpdateProfilePayload) {
    try {
      const response = await userHttp.patch<ApiEnvelope<{ user: AuthUser }>>('/users/me', payload)
      setStoredAuthUser(response.data.data.user)

      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async changePassword(payload: ChangePasswordPayload) {
    try {
      const response = await userHttp.patch<ApiEnvelope<{ user: AuthUser }>>('/users/me/password', payload)

      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async addVehicle(payload: AddVehiclePayload) {
    try {
      const response = await userHttp.post<ApiEnvelope<{ user: AuthUser }>>('/users/me/vehicles', payload)
      setStoredAuthUser(response.data.data.user)

      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async removeVehicle(vehicleId: string) {
    try {
      const response = await userHttp.delete<ApiEnvelope<{ user: AuthUser }>>(`/users/me/vehicles/${vehicleId}`)
      setStoredAuthUser(response.data.data.user)

      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },
}
