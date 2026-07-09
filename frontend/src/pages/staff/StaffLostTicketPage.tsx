import { useEffect, useMemo, useState } from 'react'
import {
  StaffGateCheckoutDetails,
  StaffGateLostTicketPanel,
  StaffGateToast,
  StaffPageHeader,
} from '../../components/staff'
import { normalizePlate } from '../../components/staff/data/staffGateUtils'
import { managerBuildingsApi, type Floor } from '../../services/managerBuildingsApi'
import {
  staffGateApi,
  type GateCheckoutPreview,
  type GateSession,
} from '../../services/staffGateApi'
import { rememberStaffGatePaymentReturn } from '../../utils/staffGatePaymentReturn'

export function StaffLostTicketPage() {
  const [query, setQuery] = useState('')
  const [sessions, setSessions] = useState<GateSession[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [selectedSession, setSelectedSession] = useState<GateSession | undefined>()
  const [preview, setPreview] = useState<GateCheckoutPreview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const floorMap = useMemo(() => new Map(floors.map((floor) => [floor._id, floor])), [floors])
  const normalizedQuery = normalizePlate(query)

  useEffect(() => {
    void loadData()
  }, [])

  useEffect(() => {
    if (!message) return
    setToastMessage(message)
    const timeoutId = window.setTimeout(() => setToastMessage(null), 6000)
    return () => window.clearTimeout(timeoutId)
  }, [message])

  useEffect(() => {
    if (!selectedSession) {
      setPreview(null)
      return
    }

    const session = selectedSession
    let ignore = false

    async function loadPreview() {
      setIsPreviewLoading(true)
      try {
        const nextPreview = await staffGateApi.previewCheckout(session._id)
        if (!ignore) setPreview(nextPreview)
      } catch (err) {
        if (!ignore) {
          setPreview(null)
          setMessage(err instanceof Error ? err.message : 'Không tính được phí xe ra.')
        }
      } finally {
        if (!ignore) setIsPreviewLoading(false)
      }
    }

    void loadPreview()

    return () => {
      ignore = true
    }
  }, [selectedSession])

  async function loadData() {
    setIsLoading(true)
    setMessage(null)

    try {
      const [sessionsResponse, floorsResponse] = await Promise.all([
        staffGateApi.getActiveSessions({ limit: 100, refreshAt: Date.now() }),
        managerBuildingsApi.getFloors({ limit: 200, sort: 'floorNumber', order: 'asc' }),
      ])
      setSessions(sessionsResponse.sessions ?? [])
      setFloors(floorsResponse.floors ?? [])
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không tải được dữ liệu xe đang gửi.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleLookup() {
    if (!normalizedQuery) return

    const found = sessions.find((session) => {
      const plate = normalizePlate(session.licensePlate)
      return plate.includes(normalizedQuery) || session._id.toLowerCase().includes(query.trim().toLowerCase())
    })

    if (!found) {
      setSelectedSession(undefined)
      setMessage('Không tìm thấy xe đang gửi khớp với biển số hoặc mã phiên này.')
      return
    }

    if (found.customerType === 'resident') {
      setSelectedSession(undefined)
      setMessage('Xe cư dân dùng QR gói cố định, không xử lý theo luồng mất vé vãng lai.')
      return
    }

    setSelectedSession(found)
    setMessage(`Đã tìm thấy xe ${found.licensePlate}. Vui lòng đối chiếu giấy tờ trước khi xử lý mất vé.`)
  }

  async function handleCheckoutLostTicket(
    session: GateSession,
    method: 'cash' | 'transfer',
    note?: string,
  ) {
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await staffGateApi.checkoutLostQr(session._id, {
        method,
        scannedPlate: session.licensePlate,
        note,
      })

      if (response.payment?.checkoutUrl) {
        rememberStaffGatePaymentReturn(response.payment.orderCode, session.licensePlate)
        window.open(response.payment.checkoutUrl, '_blank', 'noopener,noreferrer')
        setMessage(
          `Đã tạo mã thanh toán mất vé cho ${session.licensePlate}. Tổng cần thu ${response.toCollect.toLocaleString('vi-VN')}đ.`,
        )
      } else {
        setSessions((current) => current.filter((item) => item._id !== session._id))
        setSelectedSession(undefined)
        setPreview(null)
        setQuery('')
        setMessage(
          `Đã xử lý mất vé và ghi nhận xe ra ${response.session.licensePlate}. Phạt ${response.penalty.toLocaleString('vi-VN')}đ.`,
        )
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Xử lý mất vé thất bại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-8 lg:p-10">
      <StaffPageHeader
        eyebrow="Ngoại lệ cổng xe"
        title="Tra cứu mất vé"
        description="Dành cho khách vãng lai làm mất vé QR. Nhân viên tra cứu xe đang gửi, đối chiếu giấy tờ, thu phí và phạt mất vé."
      />

      {message && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-fg">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
            i
          </span>
          {message}
        </div>
      )}

      <div className="grid items-start gap-5">
        <section className="liquid-glass-card overflow-hidden rounded-2xl">
          <div className="border-b border-theme bg-gradient-to-r from-rose-500/15 via-transparent to-transparent p-5 md:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-600 dark:text-rose-300">
              Mất vé / mất QR
            </p>
            <h2 className="mt-1 text-xl font-black text-fg">Tìm xe và xử lý ngoại lệ</h2>
            <p className="mt-1 text-sm text-muted">
              Chỉ áp dụng cho khách vãng lai. Cư dân cần xuất trình lại QR gói đang hiệu lực.
            </p>
          </div>

          <div className="grid gap-5 p-5 md:p-6">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
              <label className="grid gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                  Biển số / mã phiên
                </span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleLookup()
                  }}
                  placeholder="VD: 61K-424.94"
                  className="auth-input h-14 rounded-xl border px-4 text-lg font-bold uppercase tracking-[0.08em] text-fg"
                />
              </label>

              <button
                type="button"
                onClick={handleLookup}
                disabled={isLoading || !normalizedQuery}
                className="self-end h-14 rounded-xl bg-btn-primary px-4 text-sm font-bold text-btn-primary-fg shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Tra cứu
              </button>
            </div>

            <StaffGateCheckoutDetails
              session={selectedSession}
              preview={preview}
              amountToCollect={preview?.toCollect ?? selectedSession?.fee ?? 0}
              isPreviewLoading={isPreviewLoading}
              floorMap={floorMap}
              actions={null}
            />

            <StaffGateLostTicketPanel
              session={selectedSession}
              isSubmitting={isSubmitting}
              onCheckoutLostTicket={handleCheckoutLostTicket}
            />
          </div>
        </section>
      </div>

      {toastMessage && <StaffGateToast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  )
}
