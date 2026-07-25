import axios, { AxiosError, AxiosHeaders } from 'axios'
import { API_BASE_URL } from './apiConfig'
import { AUTH_STORAGE_KEYS } from './authApi'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

export type ManagerPlan = {
  _id: string
  code: ManagerPlanCode
  name: string
  vehicleType: 'motorcycle' | 'car'
  durationDays: number
  price: number
  description?: string
  isActive: boolean
}

export type ManagerPlanCode =
  | 'MOTO_MONTHLY'
  | 'MOTO_QUARTERLY'
  | 'CAR_MONTHLY'
  | 'CAR_QUARTERLY'

export type ManagerPlanCreatePayload = {
  code: ManagerPlanCode
  name: string
  vehicleType: ManagerPlan['vehicleType']
  durationDays: number
  price: number
  description?: string
  isActive?: boolean
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
    const message = error.response?.data?.message ?? error.message
    return new Error(translatePlanApiMessage(message), { cause: error })
  }

  return error
}

function translatePlanApiMessage(message: string) {
  const inUseMatch = message.match(
    /Cannot delete plan:\s*(\d+)\s+pending\/active subscription\(s\) still use it/i,
  )

  if (inUseMatch) {
    const subscriptionCount = Number(inUseMatch[1])
    return `Không thể xóa gói vì đang có ${subscriptionCount} lượt đăng ký chờ thanh toán hoặc đang hiệu lực. Hãy tạm dừng gói thay vì xóa.`
  }

  const duplicateCodeMatch = message.match(/Plan code\s+(.+)\s+already exists/i)
  if (duplicateCodeMatch) {
    return `Mã gói ${duplicateCodeMatch[1]} đã tồn tại.`
  }

  if (/Plan not found/i.test(message)) {
    return 'Không tìm thấy gói gửi xe.'
  }

  return message
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

  async createPlan(payload: ManagerPlanCreatePayload) {
    try {
      const response = await managerPlansHttp.post<ApiEnvelope<{ plan: ManagerPlan }>>('/plans', payload)
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

  async deletePlan(id: string) {
    try {
      await managerPlansHttp.delete<ApiEnvelope<null>>(`/plans/${id}`)
    } catch (error) {
      throw getApiError(error)
    }
  },
}
