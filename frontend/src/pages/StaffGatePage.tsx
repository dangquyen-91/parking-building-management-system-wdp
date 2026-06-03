import { useEffect, useMemo, useState } from 'react'
import {
  StaffGateActiveSessions,
  StaffGateCheckInForm,
  StaffGateCheckoutPanel,
  StaffGateModeTabs,
  StaffGateSessionActivity,
  StaffGateSummary,
  type StaffGateMode,
} from '../components/staff'
import { getFloorId, normalizePlate } from '../components/staff/staffGateUtils'
import { managerBuildingsApi, type Floor } from '../services/managerBuildingsApi'
import {
  staffGateApi,
  type GateCheckoutPreview,
  type GateCustomerType,
  type GateLookupResult,
  type GateRow,
  type GateSession,
  type GateSlot,
  type GateVehicleType,
} from '../services/staffGateApi'

export function StaffGatePage() {
  const [mode, setMode] = useState<StaffGateMode>('checkin')
  const [activeSessions, setActiveSessions] = useState<GateSession[]>([])
  const [completedSessions, setCompletedSessions] = useState<GateSession[]>([])
  const [rows, setRows] = useState<GateRow[]>([])
  const [slots, setSlots] = useState<GateSlot[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [plate, setPlate] = useState('')
  const [vehicleType, setVehicleType] = useState<GateVehicleType>('motorcycle')
  const [rowId, setRowId] = useState('')
  const [slotId, setSlotId] = useState('')
  const [note, setNote] = useState('')
  const [lookupResult, setLookupResult] = useState<GateLookupResult | null>(null)
  const [isLookupLoading, setIsLookupLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const [checkoutQuery, setCheckoutQuery] = useState('')
  const [checkoutPreview, setCheckoutPreview] = useState<GateCheckoutPreview | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  const floorMap = useMemo(() => new Map(floors.map((floor) => [floor._id, floor])), [floors])
  const normalizedPlate = normalizePlate(plate)
  const lookupMatchesPlate = lookupResult?.licensePlate === normalizedPlate
  const checkInCustomerType = lookupMatchesPlate ? lookupResult.customerType : undefined

  const rowOptions = useMemo(() => {
    return rows.filter((row) => {
      const floor = floorMap.get(getFloorId(row))
      if (!floor || floor.vehicleType !== 'motorcycle') return false
      if (lookupMatchesPlate && floor.floorType !== getTargetFloorType(checkInCustomerType)) return false
      return row.status === 'available' && row.occupiedCount < row.capacity
    })
  }, [rows, floorMap, lookupMatchesPlate, checkInCustomerType])

  const slotOptions = useMemo(() => {
    return slots.filter((slot) => {
      const floor = floorMap.get(getFloorId(slot))
      if (!floor || floor.vehicleType !== 'car') return false
      if (lookupMatchesPlate && floor.floorType !== 'visitor') return false
      return slot.status === 'empty'
    })
  }, [slots, floorMap, lookupMatchesPlate])

  const selectedCheckoutSession = useMemo(() => {
    const query = checkoutQuery.trim().toLowerCase()
    if (!query) return undefined

    return activeSessions.find((session) => {
      return session.licensePlate.toLowerCase().includes(query) || session._id.toLowerCase().includes(query)
    })
  }, [activeSessions, checkoutQuery])

  const availableCount =
    rowOptions.reduce((total, row) => total + Math.max(0, row.capacity - row.occupiedCount), 0) +
    slotOptions.length

  const canCheckIn =
    lookupMatchesPlate &&
    lookupResult.status !== 'already_active' &&
    normalizedPlate.length >= 4 &&
    (vehicleType === 'car' || Boolean(rowId)) &&
    (vehicleType === 'motorcycle' || checkInCustomerType === 'resident' || Boolean(slotId))

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
      setError(err instanceof Error ? err.message : 'Khong tai duoc du lieu cong.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadGateData()
  }, [])

  useEffect(() => {
    if (!selectedCheckoutSession) {
      setCheckoutPreview(null)
      return
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
          setActionMessage(err instanceof Error ? err.message : 'Khong tinh duoc phi checkout.')
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
      setActionMessage(err instanceof Error ? err.message : 'Tra cuu bien so that bai.')
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
        rowId: vehicleType === 'motorcycle' ? rowId : undefined,
        slotId: vehicleType === 'car' && checkInCustomerType !== 'resident' ? slotId : undefined,
        note: note.trim() || undefined,
      })

      setActiveSessions((current) => [response.session, ...current])
      resetCheckInForm()
      setCheckoutQuery(response.session.licensePlate)
      setMode('checkout')
      setActionMessage(`Da check-in ${response.session.licensePlate}.`)
      await loadGateData()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Check-in that bai.')
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
      setActionMessage(`Da checkout ${response.session.licensePlate} bang tien mat.`)
      await loadGateData()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Checkout tien mat that bai.')
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
        setActionMessage('Da tao link chuyen khoan PayOS. Checkout se dong khi webhook thanh cong.')
      } else {
        closeSessionLocally(session._id, response.session)
        setActionMessage(response.note ?? `Da checkout ${response.session.licensePlate}.`)
        await loadGateData()
      }
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Checkout chuyen khoan that bai.')
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
    setRowId('')
    setSlotId('')
    setNote('')
    setLookupResult(null)
  }

  function handlePlateChange(value: string) {
    setPlate(value)
    setLookupResult(null)
    setRowId('')
    setSlotId('')
  }

  function handleVehicleTypeChange(value: GateVehicleType) {
    setVehicleType(value)
    setRowId('')
    setSlotId('')
  }

  function handleActiveSessionSelect(session: GateSession) {
    setCheckoutQuery(session.licensePlate)
    setMode('checkout')
  }

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-subtle">Staff // Gate</p>
          <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">Check-in / Checkout</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Tra cuu bien so de backend tu nhan dien cu dan hay khach vang lai, sau do ghi nhan xe vao/ra.
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
        <div className="rounded-lg border border-theme bg-badge p-5 text-sm text-muted">Dang tai du lieu cong...</div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="grid gap-5">
            {mode === 'checkin' ? (
              <StaffGateCheckInForm
                plate={plate}
                vehicleType={vehicleType}
                rowId={rowId}
                slotId={slotId}
                note={note}
                lookupResult={lookupResult}
                lookupMatchesPlate={lookupMatchesPlate}
                checkInCustomerType={checkInCustomerType}
                rowOptions={rowOptions}
                slotOptions={slotOptions}
                floorMap={floorMap}
                isLookupLoading={isLookupLoading}
                isSubmitting={isSubmitting}
                canCheckIn={canCheckIn}
                onPlateChange={handlePlateChange}
                onVehicleTypeChange={handleVehicleTypeChange}
                onRowChange={setRowId}
                onSlotChange={setSlotId}
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
                onQueryChange={setCheckoutQuery}
                onCheckoutCash={handleCheckoutCash}
                onCheckoutTransfer={handleCheckoutTransfer}
              />
            )}

            <StaffGateSessionActivity sessions={[...activeSessions, ...completedSessions]} />
          </div>

          <StaffGateActiveSessions
            sessions={activeSessions}
            selectedSessionId={selectedCheckoutSession?._id}
            onSelectSession={handleActiveSessionSelect}
          />
        </div>
      )}
    </div>
  )
}

function getTargetFloorType(customerType?: GateCustomerType) {
  return customerType === 'resident' ? 'resident' : 'visitor'
}
