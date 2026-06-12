import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  StaffGateCheckInForm,
  StaffGateCheckoutPanel,
  StaffGateModeTabs,
  StaffGateSessionActivity,
  StaffGateSummary,
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
import { getStaffGateAllocation } from '../utils/staffGateAllocation'

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
  const [note, setNote] = useState('')
  const [lookupResult, setLookupResult] = useState<GateLookupResult | null>(null)
  const [isLookupLoading, setIsLookupLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const [checkoutQuery, setCheckoutQuery] = useState(checkoutPlate)
  const [checkoutPreview, setCheckoutPreview] = useState<GateCheckoutPreview | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  const floorMap = useMemo(() => new Map(floors.map((floor) => [floor._id, floor])), [floors])
  const normalizedPlate = normalizePlate(plate)
  const lookupMatchesPlate = lookupResult?.licensePlate === normalizedPlate
  const checkInCustomerType = lookupMatchesPlate ? lookupResult.customerType : undefined

  const {
    autoAssignedRow,
    autoAssignedRowFloorAvailable,
    autoAssignedSlot,
    autoAssignedFloorAvailable,
    availableCount,
  } = useMemo(
    () =>
      getStaffGateAllocation({
        rows,
        slots,
        floorMap,
        lookupMatchesPlate,
        customerType: checkInCustomerType,
      }),
    [rows, slots, floorMap, lookupMatchesPlate, checkInCustomerType],
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
    (vehicleType === 'car' || Boolean(autoAssignedRow)) &&
    (vehicleType === 'motorcycle' || checkInCustomerType === 'resident' || Boolean(autoAssignedSlot))

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

  async function handleLookup() {
    const plateToLookup = normalizePlate(plate)
    if (!plateToLookup) return

    setIsLookupLoading(true)
    setActionMessage(null)

    try {
      const result = await staffGateApi.lookup(plateToLookup)
      setLookupResult(result)

      if (result.subscription?.vehicleType) {
        setVehicleType(result.subscription.vehicleType)
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
      const response = await staffGateApi.checkIn({
        vehicleType,
        licensePlate: normalizedPlate,
        rowId: vehicleType === 'motorcycle' ? autoAssignedRow?._id : undefined,
        slotId: vehicleType === 'car' && checkInCustomerType !== 'resident' ? autoAssignedSlot?._id : undefined,
        note: note.trim() || undefined,
      })

      setActiveSessions((current) => [response.session, ...current])
      resetCheckInForm()
      setCheckoutQuery(response.session.licensePlate)
      setMode('checkout')
      setActionMessage(`Đã ghi nhận xe vào ${response.session.licensePlate}.`)
      await loadGateData()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Ghi nhận xe vào thất bại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCheckoutCash(session: GateSession) {
    setIsSubmitting(true)
    setActionMessage(null)

    try {
      const response = await staffGateApi.checkoutCash(session._id)
      closeSessionLocally(session._id, response.session)
      setActionMessage(`Đã ghi nhận xe ra ${response.session.licensePlate} bằng tiền mặt.`)
      await loadGateData()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Ghi nhận xe ra bằng tiền mặt thất bại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCheckoutTransfer(session: GateSession) {
    setIsSubmitting(true)
    setActionMessage(null)

    try {
      const response = await staffGateApi.checkoutTransfer(session._id)

      if (response.payment?.checkoutUrl) {
        window.open(response.payment.checkoutUrl, '_blank', 'noopener,noreferrer')
        setActionMessage('Đã tạo link chuyển khoản PayOS. Phiên gửi xe sẽ đóng khi webhook thành công.')
      } else {
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
    setNote('')
    setLookupResult(null)
  }

  function handlePlateChange(value: string) {
    setPlate(value)
    setLookupResult(null)
  }

  function handleVehicleTypeChange(value: GateVehicleType) {
    setVehicleType(value)
  }

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-subtle">Nhân viên // Cổng</p>
          <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">Xe vào / Xe ra</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Tra cứu biển số để hệ thống tự nhận diện cư dân hoặc khách vãng lai, sau đó ghi nhận xe vào/ra.
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
        <div className="mb-5 rounded-lg border border-theme bg-badge p-4 text-sm text-fg">{actionMessage}</div>
      )}

      {error && <div className="mb-5 rounded-lg border border-theme bg-badge p-4 text-sm text-rose-100">{error}</div>}

      {isLoading ? (
        <div className="rounded-lg border border-theme bg-badge p-5 text-sm text-muted">Đang tải dữ liệu cổng...</div>
      ) : (
        <div className="grid gap-5">
          {mode === 'checkin' ? (
            <StaffGateCheckInForm
              plate={plate}
              vehicleType={vehicleType}
              note={note}
              lookupResult={lookupResult}
              lookupMatchesPlate={lookupMatchesPlate}
              checkInCustomerType={checkInCustomerType}
              autoAssignedRow={autoAssignedRow}
              autoAssignedRowFloorAvailable={autoAssignedRowFloorAvailable}
              autoAssignedSlot={autoAssignedSlot}
              autoAssignedFloorAvailable={autoAssignedFloorAvailable}
              floorMap={floorMap}
              isLookupLoading={isLookupLoading}
              isSubmitting={isSubmitting}
              canCheckIn={canCheckIn}
              onPlateChange={handlePlateChange}
              onVehicleTypeChange={handleVehicleTypeChange}
              onNoteChange={setNote}
              onLookup={handleLookup}
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

          <StaffGateSessionActivity sessions={[...activeSessions, ...completedSessions]} />
        </div>
      )}
    </div>
  )
}
