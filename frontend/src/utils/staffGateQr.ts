import type { GateLookupResult, GateSession } from '../services/staffGateApi'
import { normalizePlate } from '../components/staff/staffGateUtils'

const WALKIN_TICKET_TTL_MS = 5 * 60 * 1000
const STORAGE_KEY = 'pbms_staff_gate_qr_tickets'

export type StaffGateQrPayload = {
  type?: string
  version?: number
  issuedAt?: number
  expiresAt?: number
  sessionId?: string
  licensePlate?: string
  plate?: string
  subId?: string
  iat?: number
  credential?: {
    subscriptionId?: string
    licensePlate?: string
    vehicleType?: string
    status?: string
    validUntil?: string | null
  }
  verification?: {
    subscriptionId?: string
    licensePlate?: string
  }
}

type StoredGateTicket = {
  sessionId: string
  licensePlate: string
  qrValue: string
  storedAt: number
}

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, StoredGateTicket>
  } catch {
    return {}
  }
}

function writeStore(store: Record<string, StoredGateTicket>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4)
  return atob(normalized + padding)
}

export function createWalkInQrValue(licensePlate: string) {
  const issuedAt = Date.now()

  return JSON.stringify({
    type: 'walkin-ticket',
    version: 1,
    issuedAt,
    expiresAt: issuedAt + WALKIN_TICKET_TTL_MS,
    licensePlate: normalizePlate(licensePlate),
  })
}

export function parseGateQr(rawValue: string): StaffGateQrPayload | null {
  if (rawValue.startsWith('PBMS-SUB|')) {
    const [, subscriptionId, licensePlate, status] = rawValue.split('|')
    return {
      type: 'resident-subscription-credential',
      credential: {
        subscriptionId,
        licensePlate,
        status,
      },
      verification: {
        subscriptionId,
        licensePlate,
      },
    }
  }

  try {
    return JSON.parse(rawValue) as StaffGateQrPayload
  } catch {
    try {
      const [payloadPart] = rawValue.split('.')
      if (!payloadPart) return null
      return JSON.parse(decodeBase64Url(payloadPart)) as StaffGateQrPayload
    } catch {
      return null
    }
  }
}

export function getGateQrPlate(payload: StaffGateQrPayload) {
  return normalizePlate(
    payload.licensePlate
      ?? payload.plate
      ?? payload.credential?.licensePlate
      ?? payload.verification?.licensePlate
      ?? '',
  )
}

function getSubscriptionId(payload: StaffGateQrPayload) {
  return payload.credential?.subscriptionId ?? payload.verification?.subscriptionId ?? payload.subId ?? ''
}

function isResidentQr(payload: StaffGateQrPayload) {
  return payload.type === 'resident-subscription-credential' || payload.type === 'subscription_entry'
}

function isWalkInQr(payload: StaffGateQrPayload) {
  return payload.type === 'walkin-ticket' || payload.type === 'walkin_ticket'
}

function isWalkInExpired(payload: StaffGateQrPayload) {
  if (payload.expiresAt) return Date.now() > payload.expiresAt
  if (payload.iat) return Date.now() - payload.iat > WALKIN_TICKET_TTL_MS
  return false
}

export function validateEntryQr({
  qrValue,
  lookupResult,
  cameraPlate,
}: {
  qrValue: string
  lookupResult: GateLookupResult
  cameraPlate: string
}) {
  const payload = parseGateQr(qrValue)
  if (!payload) return 'QR không đúng định dạng.'

  const normalizedCameraPlate = normalizePlate(cameraPlate)
  const qrPlate = getGateQrPlate(payload)
  if (qrPlate !== normalizedCameraPlate) {
    return `Biển số QR (${qrPlate || 'trống'}) không khớp camera (${normalizedCameraPlate}).`
  }

  if (lookupResult.customerType === 'resident') {
    if (!isResidentQr(payload)) return 'QR này không phải QR gói cư dân.'
    if (payload.credential && payload.credential.status !== 'active') return 'QR gói cư dân chưa active.'
    if (getSubscriptionId(payload) !== lookupResult.subscription?._id) {
      return 'QR không thuộc gói cư dân của biển số này.'
    }
    return null
  }

  if (!isWalkInQr(payload)) return 'QR này không phải vé QR vãng lai.'
  if (isWalkInExpired(payload)) return 'Vé QR vãng lai đã quá 5 phút, hãy cấp vé mới.'

  return null
}

export function validateExitQr({
  qrValue,
  session,
}: {
  qrValue: string
  session: GateSession
}) {
  const payload = parseGateQr(qrValue)
  if (!payload) return 'QR không đúng định dạng.'

  const sessionPlate = normalizePlate(session.licensePlate)
  const qrPlate = getGateQrPlate(payload)
  if (qrPlate !== sessionPlate) {
    return `Biển số QR (${qrPlate || 'trống'}) không khớp camera (${sessionPlate}).`
  }

  if (session.customerType === 'resident') {
    if (!isResidentQr(payload)) return 'Cư dân phải dùng QR gói cư dân để ra.'
    if (payload.credential && payload.credential.status !== 'active') return 'QR gói cư dân chưa active.'
    return null
  }

  if (!isWalkInQr(payload)) return 'Khách vãng lai phải đưa lại vé QR lúc vào.'

  const stored = getStoredTicketForSession(session)
  if (!stored) return 'Không tìm thấy vé QR lúc vào trên trình duyệt staff này.'
  if (stored.qrValue !== qrValue) return 'QR không khớp vé đã cấp lúc xe vào.'

  return null
}

export function rememberTicketForSession(session: GateSession, qrValue: string) {
  const store = readStore()
  store[session._id] = {
    sessionId: session._id,
    licensePlate: normalizePlate(session.licensePlate),
    qrValue,
    storedAt: Date.now(),
  }
  writeStore(store)
}

export function getStoredTicketForSession(session: GateSession) {
  const store = readStore()
  return store[session._id]
    ?? Object.values(store).find((item) => item.licensePlate === normalizePlate(session.licensePlate))
}

export function forgetTicketForSession(sessionId: string) {
  const store = readStore()
  delete store[sessionId]
  writeStore(store)
}
