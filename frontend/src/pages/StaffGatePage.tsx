import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  StaffGateCheckInForm,
  StaffGateCheckInTicket,
  StaffGateCheckoutPanel,
  StaffGateModeTabs,
  StaffGateSessionActivity,
  StaffGateSummary,
  StaffGateToast,
  type StaffGateMode,
} from '../components/staff'
import { normalizePlate } from '../components/staff/staffGateUtils'
import { managerBuildingsApi, type Floor } from '../services/managerBuildingsApi'
import {
  staffGateApi,
  type GateCheckoutPreview,
  type GateLookupResult,
  type GateRow,
  type GateSession,
  type GateSlot,
  type GateVehicleType,
} from '../services/staffGateApi'
import { userSubscriptionApi } from '../services/userSubscriptionApi'
import { getStaffGateAllocation } from '../utils/staffGateAllocation'
import {
  forgetTicketForSession,
  parseGateQr,
  rememberTicketForSession,
  validateEntryQr,
} from '../utils/staffGateQr'
import { rememberStaffGatePaymentReturn } from '../utils/staffGatePaymentReturn'

export function StaffGatePage() {
  const [searchParams] = useSearchParams()
  const checkoutPlate = searchParams.get('checkout') ?? ''
  const [mode, setMode] = useState<StaffGateMode>(checkoutPlate ? 'checkout' : 'checkin')
  const [activeSessions, setActiveSessions] = useState<GateSession[]>([])
  const [completedSessions, setCompletedSessions] = useState<GateSession[]>([])
  const [rows, setRows] = useState<GateRow[]>([])
  const [slots, setSlots] = useState<GateSlot[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [plate, setPlate] = useState('')
  const [vehicleType, setVehicleType] = useState<GateVehicleType>('motorcycle')
  const [selectedFloorId, setSelectedFloorId] = useState('')
  const [note, setNote] = useState('')
  const [lookupResult, setLookupResult] = useState<GateLookupResult | null>(null)
  const [isLookupLoading, setIsLookupLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [entryQrValue, setEntryQrValue] = useState('')
  const [issuedWalkInQrValue, setIssuedWalkInQrValue] = useState('')

  const [checkoutQuery, setCheckoutQuery] = useState(checkoutPlate)
  const [checkoutPreview, setCheckoutPreview] = useState<GateCheckoutPreview | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [pendingTransferSession, setPendingTransferSession] = useState<GateSession | null>(null)
  const [issuedTicket, setIssuedTicket] = useState<{ session: GateSession; qrValue: string } | null>(null)

  const floorMap = useMemo(() => new Map(floors.map((floor) => [floor._id, floor])), [floors])
  const normalizedPlate = normalizePlate(plate)
  const lookupMatchesPlate = lookupResult?.licensePlate === normalizedPlate
  const checkInCustomerType = lookupMatchesPlate ? lookupResult.customerType : undefined

  const {
    floorOptions,
    autoAssignedRow,
    availableCount,
  } = useMemo(
    () =>
      getStaffGateAllocation({
        rows,
        slots,
        floorMap,
        lookupMatchesPlate,
        customerType: checkInCustomerType,
        vehicleType,
        selectedFloorId,
      }),
    [rows, slots, floorMap, lookupMatchesPlate, checkInCustomerType, vehicleType, selectedFloorId],
  )

  const selectedCheckoutSession = useMemo(() => {
    const query = checkoutQuery.trim().toLowerCase()
    if (!query) return undefined

    return activeSessions.find((session) => {
      return session.licensePlate.toLowerCase().includes(query) || session._id.toLowerCase().includes(query)
    })
  }, [activeSessions, checkoutQuery])

  const canCheckIn =
    lookupMatchesPlate &&
    lookupResult.status !== 'already_active' &&
    normalizedPlate.length >= 4 &&
    Boolean(entryQrValue)

  async function resolveQrTokenForApi(qrValue: string) {
    const payload = parseGateQr(qrValue)
    const subscriptionId = payload?.credential?.subscriptionId ?? payload?.verification?.subscriptionId ?? payload?.subId
    const isShortResidentQr = qrValue.startsWith('PBMS-SUB|') || payload?.type === 'resident-subscription-credential'

    if (!isShortResidentQr || !subscriptionId) return qrValue

    try {
      const qr = await userSubscriptionApi.getSubscriptionQr(subscriptionId)
      if (!qr.qrToken) throw new Error('API không trả về qrToken cho gói cư dân.')
      return qr.qrToken
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không lấy được QR token thật của gói cư dân.'
      throw new Error(`QR cư dân đã khớp, nhưng chưa lấy được token backend để mở cổng: ${message}`)
    }
  }

  async function loadGateData() {
    setIsLoading(true)
    setError(null)

    try {
      const [sessionsResponse, rowsResponse, slotsResponse, floorsResponse] = await Promise.all([
        staffGateApi.getActiveSessions({ limit: 100 }),
        staffGateApi.getRows({ limit: 100 }),
        staffGateApi.getSlots({ vehicleType: 'car', limit: 200, sortBy: 'slotCode', sortOrder: 'asc' }),
        managerBuildingsApi.getFloors({ limit: 200, sort: 'floorNumber', order: 'asc' }),
      ])

      setActiveSessions(sessionsResponse.sessions ?? [])
      setRows(rowsResponse.rows ?? [])
      setSlots(slotsResponse.slots ?? [])
      setFloors(floorsResponse.floors ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu cổng.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadGateData(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (!actionMessage) return
    const showTimeoutId = window.setTimeout(() => setToastMessage(actionMessage), 0)
    const hideTimeoutId = window.setTimeout(() => setToastMessage(null), 6000)

    return () => {
      window.clearTimeout(showTimeoutId)
      window.clearTimeout(hideTimeoutId)
    }
  }, [actionMessage])

  useEffect(() => {
    if (!selectedCheckoutSession) {
      const timeoutId = window.setTimeout(() => setCheckoutPreview(null), 0)
      return () => window.clearTimeout(timeoutId)
    }

    const sessionId = selectedCheckoutSession._id
    let ignore = false

    async function loadPreview() {
      setIsPreviewLoading(true)
      try {
        const preview = await staffGateApi.previewCheckout(sessionId)
        if (!ignore) setCheckoutPreview(preview)
      } catch (err) {
        if (!ignore) {
          setCheckoutPreview(null)
          setActionMessage(err instanceof Error ? err.message : 'Không tính được phí xe ra.')
        }
      } finally {
        if (!ignore) setIsPreviewLoading(false)
      }
    }

    void loadPreview()

    return () => {
      ignore = true
    }
  }, [selectedCheckoutSession])

  useEffect(() => {
    if (!pendingTransferSession) return

    const pendingSession = pendingTransferSession
    let ignore = false
    let attempts = 0

    async function refreshTransferStatus() {
      attempts += 1

      try {
        const response = await staffGateApi.getActiveSessions({
          limit: 100,
          refreshAt: Date.now(),
        })
        if (ignore) return

        const sessions = response.sessions ?? []
        setActiveSessions(sessions)

        if (!sessions.some((session) => session._id === pendingSession._id)) {
          setPendingTransferSession(null)
          setCheckoutQuery('')
          setCheckoutPreview(null)
          setActionMessage(`Đã xác nhận chuyển khoản và ghi nhận xe ra ${pendingSession.licensePlate}.`)
        } else if (attempts >= 72) {
          setPendingTransferSession(null)
          setActionMessage('Chưa nhận được xác nhận thanh toán. Vui lòng kiểm tra lại sau ít phút.')
        }
      } catch {
        if (!ignore && attempts >= 72) {
          setPendingTransferSession(null)
          setActionMessage('Không thể tự kiểm tra thanh toán. Vui lòng tải lại trang để cập nhật trạng thái.')
        }
      }
    }

    void refreshTransferStatus()
    const intervalId = window.setInterval(() => void refreshTransferStatus(), 2500)

    return () => {
      ignore = true
      window.clearInterval(intervalId)
    }
  }, [pendingTransferSession])

  async function handleLookup() {
    const plateToLookup = normalizePlate(plate)
    if (!plateToLookup) return

    setIsLookupLoading(true)
    setActionMessage(null)

    try {
      const result = await staffGateApi.lookup(plateToLookup)
      setLookupResult(result)
      setSelectedFloorId('')
      setEntryQrValue('')
      setIssuedWalkInQrValue('')

      if (result.subscription?.vehicleType) {
        setVehicleType(result.subscription.vehicleType)
      } else if (result.booking) {
        setVehicleType('car')
      }

      if (result.status === 'already_active' && result.activeSession) {
        setCheckoutQuery(result.activeSession.licensePlate)
        setMode('checkout')
      }
    } catch (err) {
      setLookupResult(null)
      setActionMessage(err instanceof Error ? err.message : 'Tra cứu biển số thất bại.')
    } finally {
      setIsLookupLoading(false)
    }
  }

  async function handleCheckIn() {
    setIsSubmitting(true)
    setActionMessage(null)

    try {
      const apiQrToken = await resolveQrTokenForApi(entryQrValue)
      const response = await staffGateApi.checkIn({
        vehicleType,
        licensePlate: normalizedPlate,
        rowId: vehicleType === 'motorcycle' ? autoAssignedRow?._id : undefined,
        note: note.trim() || undefined,
        qrToken: apiQrToken,
      })

      setActiveSessions((current) => [response.session, ...current])
      if (response.session.customerType === 'walk_in') {
        rememberTicketForSession(response.session, entryQrValue)
      }
      setIssuedTicket({ session: response.session, qrValue: entryQrValue })
      resetCheckInForm()
      setActionMessage(`Đã ghi nhận xe vào ${response.session.licensePlate}.`)
      await loadGateData()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Ghi nhận xe vào thất bại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCheckoutCash(session: GateSession, qrValue: string) {
    setIsSubmitting(true)
    setActionMessage(null)

    try {
      const apiQrToken = await resolveQrTokenForApi(qrValue)
      const response = await staffGateApi.checkoutCash(session._id, {
        qrToken: apiQrToken,
        scannedPlate: session.licensePlate,
      })
      forgetTicketForSession(session._id)
      closeSessionLocally(session._id, response.session)
      setActionMessage(`Đã ghi nhận xe ra ${response.session.licensePlate} bằng tiền mặt.`)
      await loadGateData()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Ghi nhận xe ra bằng tiền mặt thất bại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCheckoutTransfer(session: GateSession, qrValue: string) {
    setIsSubmitting(true)
    setActionMessage(null)

    try {
      const apiQrToken = await resolveQrTokenForApi(qrValue)
      const response = await staffGateApi.checkoutTransfer(session._id, {
        qrToken: apiQrToken,
        scannedPlate: session.licensePlate,
      })

      if (response.payment?.checkoutUrl) {
        rememberStaffGatePaymentReturn(response.payment.orderCode, session.licensePlate)
        window.open(response.payment.checkoutUrl, '_blank', 'noopener,noreferrer')
        setPendingTransferSession(session)
        setActionMessage('Đã tạo mã QR PayOS. Đang chờ xác nhận thanh toán...')
      } else {
        forgetTicketForSession(session._id)
        closeSessionLocally(session._id, response.session)
        setActionMessage(response.note ?? `Đã ghi nhận xe ra ${response.session.licensePlate}.`)
        await loadGateData()
      }
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Ghi nhận xe ra bằng chuyển khoản thất bại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function closeSessionLocally(activeSessionId: string, completedSession: GateSession) {
    setActiveSessions((current) => current.filter((item) => item._id !== activeSessionId))
    setCompletedSessions((current) => [completedSession, ...current])
    setCheckoutQuery('')
    setCheckoutPreview(null)
  }

  function resetCheckInForm() {
    setPlate('')
    setSelectedFloorId('')
    setNote('')
    setLookupResult(null)
    setEntryQrValue('')
    setIssuedWalkInQrValue('')
  }

  function handlePlateChange(value: string) {
    setPlate(value)
    setLookupResult(null)
    setSelectedFloorId('')
    setEntryQrValue('')
    setIssuedWalkInQrValue('')
  }

  function handleVehicleTypeChange(value: GateVehicleType) {
    setVehicleType(value)
    setSelectedFloorId('')
  }

  async function handleIssueWalkInQr() {
    if (!normalizedPlate || !lookupResult || lookupResult.customerType !== 'walk_in') return

    try {
      const ticket = await staffGateApi.requestEntryQr(normalizedPlate)
      setIssuedWalkInQrValue(ticket.qrToken)
      setEntryQrValue('')
      setActionMessage(`Đã cấp vé QR vãng lai cho ${normalizedPlate}. Hãy quét lại vé này trong 5 phút để xác nhận xe vào.`)
    } catch (err) {
      setIssuedWalkInQrValue('')
      setEntryQrValue('')
      setActionMessage(err instanceof Error ? err.message : 'Không thể cấp vé QR vãng lai.')
    }
  }

  function handleEntryQrScanned(qrValue: string) {
    if (!lookupResult) return

    if (lookupResult.customerType === 'walk_in' && issuedWalkInQrValue && qrValue !== issuedWalkInQrValue) {
      setEntryQrValue('')
      setActionMessage('QR vừa quét không khớp vé vãng lai vừa cấp cho biển số này.')
      return
    }

    const message = validateEntryQr({
      qrValue,
      lookupResult,
      cameraPlate: normalizedPlate,
    })

    if (message) {
      setEntryQrValue('')
      setActionMessage(message)
      return
    }

    setEntryQrValue(qrValue)
    setActionMessage('QR cổng vào đã khớp biển số camera. Có thể xác nhận cho xe vào.')
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-8 lg:p-10">
      <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-subtle">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
            Cổng đang hoạt động
          </div>
          <h1 className="text-3xl font-black tracking-tight text-fg md:text-4xl">Điều phối xe vào / ra</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Tra cứu nhanh, phân bổ vị trí và hoàn tất thanh toán ngay tại cổng.
          </p>
        </div>

        <StaffGateSummary
          activeCount={activeSessions.length}
          completedCount={completedSessions.length}
          availableCount={Math.max(0, availableCount)}
        />
      </div>

      <StaffGateModeTabs mode={mode} onModeChange={setMode} />

      {actionMessage && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-fg">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">i</span>
          {actionMessage}
        </div>
      )}

      {error && <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-200">{error}</div>}

      {isLoading ? (
        <div className="rounded-lg border border-theme bg-badge p-5 text-sm text-muted">Đang tải dữ liệu cổng...</div>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div>
            {mode === 'checkin' ? (
              <StaffGateCheckInForm
                plate={plate}
                vehicleType={vehicleType}
                note={note}
                lookupResult={lookupResult}
                lookupMatchesPlate={lookupMatchesPlate}
                checkInCustomerType={checkInCustomerType}
                floorOptions={floorOptions}
                selectedFloorId={selectedFloorId}
                isLookupLoading={isLookupLoading}
                isSubmitting={isSubmitting}
                canCheckIn={canCheckIn}
                entryQrValue={entryQrValue}
                issuedWalkInQrValue={issuedWalkInQrValue}
                onPlateChange={handlePlateChange}
                onVehicleTypeChange={handleVehicleTypeChange}
                onFloorChange={setSelectedFloorId}
                onNoteChange={setNote}
                onLookup={handleLookup}
                onIssueWalkInQr={handleIssueWalkInQr}
                onEntryQrScanned={handleEntryQrScanned}
                onCheckIn={handleCheckIn}
              />
            ) : (
              <StaffGateCheckoutPanel
                query={checkoutQuery}
                session={selectedCheckoutSession}
                preview={checkoutPreview}
                isPreviewLoading={isPreviewLoading}
                isSubmitting={isSubmitting}
                floorMap={floorMap}
                onQueryChange={setCheckoutQuery}
                onCheckoutCash={handleCheckoutCash}
                onCheckoutTransfer={handleCheckoutTransfer}
              />
            )}
          </div>

          <aside className="xl:sticky xl:top-6">
            <StaffGateSessionActivity sessions={[...activeSessions, ...completedSessions]} />
          </aside>
        </div>
      )}

      {issuedTicket && (
        <StaffGateCheckInTicket session={issuedTicket.session} qrValue={issuedTicket.qrValue} onClose={() => setIssuedTicket(null)} />
      )}

      {toastMessage && (
        <StaffGateToast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  )
}
