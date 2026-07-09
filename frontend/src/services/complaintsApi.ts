import axios, { AxiosError, AxiosHeaders } from 'axios'
import { API_BASE_URL } from './apiConfig'
import { AUTH_STORAGE_KEYS } from './authApi'

type ApiEnvelope<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

export type ComplaintStatus = 'open' | 'in_progress' | 'resolved'

export type ComplaintUser = {
  _id: string
  fullName?: string
  email?: string
  phone?: string
}

export type ComplaintSlot = {
  _id: string
  slotCode?: string
}

export type Complaint = {
  _id: string
  type: 'wrong_slot'
  complainantUserId?: ComplaintUser | string
  slotId?: ComplaintSlot | string
  offendingPlate: string
  offendingUserId?: ComplaintUser | string | null
  offendingPhone?: string | null
  offendingSlotCode?: string | null
  description?: string
  status: ComplaintStatus
  handledByStaffId?: ComplaintUser | string | null
  resolutionNote?: string
  alertSentTo?: string | null
  resolvedAt?: string | null
  createdAt: string
  updatedAt?: string
}

export type ComplaintCreateResult = {
  complaint: Complaint
  callNow: {
    name?: string
    phone?: string | null
    correctSlot?: string | null
    emailAlerted: boolean
  } | null
  note?: string
}

const complaintsHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

complaintsHttp.interceptors.request.use((config) => {
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

export const complaintsApi = {
  async create(payload: { slotId: string; offendingPlate: string; description?: string }) {
    try {
      const response = await complaintsHttp.post<ApiEnvelope<ComplaintCreateResult>>('/complaints', payload)
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async getMine(params?: { status?: ComplaintStatus }) {
    try {
      const response = await complaintsHttp.get<ApiEnvelope<{ complaints: Complaint[] }>>('/complaints/me', {
        params,
      })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async getAll(params?: { status?: ComplaintStatus; page?: number; limit?: number }) {
    try {
      const response = await complaintsHttp.get<
        ApiEnvelope<{ complaints: Complaint[]; total: number; page: number; limit: number; totalPages?: number }>
      >('/complaints', { params })
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },

  async updateStatus(id: string, payload: { status: ComplaintStatus; resolutionNote?: string }) {
    try {
      const response = await complaintsHttp.patch<ApiEnvelope<{ complaint: Complaint }>>(
        `/complaints/${id}/status`,
        payload,
      )
      return response.data.data
    } catch (error) {
      throw getApiError(error)
    }
  },
}
