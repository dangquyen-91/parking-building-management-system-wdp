import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  StaffGateCheckoutDetails,
  StaffGateLostTicketPanel,
  StaffGateToast,
  StaffPageHeader,
} from '../../components/staff'
import { normalizePlate } from '../../components/staff/data/staffGateUtils'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
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

  const floorMap = useMemo(() => new Map(floors.map((floor) => [floor._id, floor])), [floors])
  const normalizedQuery = normalizePlate(query)

  const loadData = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    if (!selectedSession) return undefined

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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadData(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadData])

  useEffect(() => {
    if (!message) return undefined
    const timeoutId = window.setTimeout(() => setMessage(null), 6000)
    return () => window.clearTimeout(timeoutId)
  }, [message])

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

  async function handleCheckoutLostTicket(session: GateSession, method: 'cash' | 'transfer', note?: string) {
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
    <div className="mx-auto max-w-375 p-4 md:p-8 lg:p-10">
      <StaffPageHeader
        eyebrow="Ngoại lệ cổng xe"
        title="Tra cứu mất vé"
        description="Dành cho khách vãng lai làm mất vé QR. Nhân viên tra cứu xe đang gửi, đối chiếu giấy tờ, thu phí và phạt mất vé."
      />

      {message && (
        <Alert className="mb-5">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card className="border-amber-500/20 bg-linear-to-br from-background via-background to-amber-500/5">
        <CardHeader>
          <CardDescription>Mất vé / mất QR</CardDescription>
          <CardTitle>Tìm xe và xử lý ngoại lệ</CardTitle>
          <CardDescription>
            Chỉ áp dụng cho khách vãng lai. Cư dân cần xuất trình lại QR gói đang hiệu lực.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <Label className="grid gap-2 text-xs text-muted-foreground">
              Biển số / mã phiên
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleLookup()
                }}
                placeholder="VD: 61K-424.94"
                className="h-14 text-lg font-bold uppercase tracking-[0.08em]"
              />
            </Label>
            <Button
              type="button"
              onClick={handleLookup}
              disabled={isLoading || !normalizedQuery}
              className="self-end"
              size="lg"
            >
              Tra cứu
            </Button>
          </div>

          <StaffGateCheckoutDetails
            session={selectedSession}
            preview={selectedSession ? preview : null}
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
        </CardContent>
      </Card>

      {message && <StaffGateToast message={message} onClose={() => setMessage(null)} />}
    </div>
  )
}
