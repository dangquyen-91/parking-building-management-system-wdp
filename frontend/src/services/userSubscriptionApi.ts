import axios, { AxiosError, AxiosHeaders } from 'axios'
import { API_BASE_URL } from './apiConfig'
import { AUTH_STORAGE_KEYS } from './authApi'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

export type VehicleType = 'motorcycle' | 'car'
export type SubscriptionStatus = 'pending' | 'active' | 'expired' | 'cancelled'

export type Plan = {
  _id: string
  code: string
  name: string
  vehicleType: VehicleType
  durationDays: number
  price: number
  description?: string
  isActive: boolean
}

export type AvailableSubscriptionSlot = {
  _id: string
  slotCode: string
  status: 'empty' | 'occupied' | 'reserved' | 'maintenance'
  available: boolean
}

export type AvailableSubscriptionFloor = {
  floor: {
    _id: string
    floorNumber: number
    description?: string
    totalSlots?: number
    building?: {
      _id: string
      name?: string
      address?: string
    }
  }
  slots: AvailableSubscriptionSlot[]
  availableCount: number
}

export type AvailableCarSubscriptions = {
  vehicleType: 'car'
  floors: AvailableSubscriptionFloor[]
}

export type AvailableMotorcycleSubscriptions = {
  vehicleType: 'motorcycle'
  floors: Array<{
    _id: string
    floorNumber: number
    description?: string
    totalSlots: number
    building?: {
      _id: string
      name?: string
      address?: string
    }
  }>
  totalCapacity: number
  soldCount: number
  availableCount: number
  note?: string
}

export type Subscription = {
  _id: string
  userId?:
    | string
    | {
        _id: string
        fullName?: string
        email?: string
        phone?: string
      }
  planId: Plan
  licensePlate: string
  vehicleType: VehicleType
  status: SubscriptionStatus
  startDate?: string | null
  endDate?: string | null
  slotId?: {
    _id: string
    slotCode: string
    vehicleType: VehicleType
    floorId?: {
      _id: string
      floorNumber?: number
      floorType?: string
      buildingId?: string
    }
  } | null
}

export type SubscriptionPayment = {
  orderCode: number
  amount: number
  checkoutUrl: string
  paymentLinkId?: string
  qrCode?: string
  accountNumber?: string
  accountName?: string
  bin?: string
}

export type SubscriptionCredentialQr = {
  qrToken: string
  qrImage?: string
  licensePlate: string
  subscriptionId: string
}

export type PurchaseSubscriptionPayload = {
  planId: string
  licensePlate: string
  slotId?: string
}

const userSubscriptionHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

userSubscriptionHttp.interceptors.request.use((config) => {
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

export const userSubscriptionApi = {
  async getPlans(params?: { vehicleType?: VehicleType; isActive?: boolean }) {
    try {
      const response = await userSubscriptionHttp.get<ApiEnvelope<{ plans: Plan[] }>>('/plans', { params })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async getAvailableForSubscription(vehicleType: VehicleType) {
    try {
      const response = await userSubscriptionHttp.get<
        ApiEnvelope<AvailableCarSubscriptions | AvailableMotorcycleSubscriptions>
      >('/slots/available-for-subscription', { params: { vehicleType } })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async getMySubscriptions(params?: { status?: SubscriptionStatus }) {
    try {
      const response = await userSubscriptionHttp.get<ApiEnvelope<{ subscriptions: Subscription[] }>>(
        '/subscriptions/me',
        { params },
      )
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async purchaseSubscription(payload: PurchaseSubscriptionPayload) {
    try {
      const response = await userSubscriptionHttp.post<
        ApiEnvelope<{ subscription: Subscription; payment: SubscriptionPayment }>
      >('/subscriptions', payload)
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async cancelSubscription(id: string) {
    try {
      const response = await userSubscriptionHttp.patch<ApiEnvelope<{ subscription: Subscription }>>(
        `/subscriptions/${id}/cancel`,
      )
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async getSubscriptionQr(id: string) {
    try {
      const response = await userSubscriptionHttp.get<ApiEnvelope<SubscriptionCredentialQr>>(
        `/subscriptions/${id}/qr`,
      )
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },
}
