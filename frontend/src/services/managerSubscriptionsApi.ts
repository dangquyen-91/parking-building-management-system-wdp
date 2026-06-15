import axios, { AxiosError, AxiosHeaders } from 'axios'
import { API_BASE_URL } from './apiConfig'
import { AUTH_STORAGE_KEYS } from './authApi'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

export type ManagerSubscriptionStatus = 'pending' | 'active' | 'expired' | 'cancelled'
export type ManagerSubscriptionVehicleType = 'motorcycle' | 'car'

export type ManagerSubscription = {
  _id: string
  licensePlate: string
  vehicleType: ManagerSubscriptionVehicleType
  status: ManagerSubscriptionStatus
  startDate?: string | null
  endDate?: string | null
  createdAt?: string
  note?: string
  userId?: {
    _id: string
    fullName?: string
    email?: string
    phone?: string
  } | string | null
  planId?: {
    _id: string
    code?: string
    name?: string
    durationDays?: number
    price?: number
  } | string | null
  slotId?: {
    _id: string
    slotCode?: string
  } | string | null
}

type SubscriptionsResponse = {
  subscriptions: ManagerSubscription[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

const managerSubscriptionsHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

managerSubscriptionsHttp.interceptors.request.use((config) => {
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

export const managerSubscriptionsApi = {
  async getSubscriptions(params?: {
    status?: ManagerSubscriptionStatus
    vehicleType?: ManagerSubscriptionVehicleType
    licensePlate?: string
    page?: number
    limit?: number
  }) {
    try {
      const response = await managerSubscriptionsHttp.get<ApiEnvelope<SubscriptionsResponse>>('/subscriptions', {
        params,
      })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },
}
