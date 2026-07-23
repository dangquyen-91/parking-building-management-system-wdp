import { RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  StaffPageHeader,
  StaffShiftCheckoutList,
  StaffShiftHandoverPanel,
  StaffShiftStatCard,
  formatStaffCurrency,
  getSessionStaffName,
  isShiftSessionToday,
  type ShiftStat,
} from '../../components/staff'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Button } from '../../components/ui/button'
import { staffGateApi, type GateSession } from '../../services/staffGateApi'

export function StaffShiftPage() {
  const [activeSessions, setActiveSessions] = useState<GateSession[]>([])
  const [completedSessions, setCompletedSessions] = useState<GateSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadShiftData() {
    setIsLoading(true)
    setError(null)

    try {
      const [activeResponse, completedResponse] = await Promise.all([
        staffGateApi.getActiveSessions({ status: 'active', limit: 100, refreshAt: Date.now() }),
        staffGateApi.getActiveSessions({ status: 'completed', limit: 100, refreshAt: Date.now() }),
      ])

      setActiveSessions(activeResponse.sessions ?? [])
      setCompletedSessions(completedResponse.sessions ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu tổng kết ca.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadShiftData(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  const todayCompletedSessions = useMemo(
    () => completedSessions.filter((session) => isShiftSessionToday(session.exitTime)),
    [completedSessions],
  )

  const todayCheckins = useMemo(
    () => [...activeSessions, ...completedSessions].filter((session) => isShiftSessionToday(session.entryTime)),
    [activeSessions, completedSessions],
  )

  const revenue = todayCompletedSessions.reduce((total, session) => total + (session.fee || 0), 0)
  const cashRevenue = todayCompletedSessions
    .filter((session) => session.paymentMethod === 'cash')
    .reduce((total, session) => total + (session.fee || 0), 0)
  const transferRevenue = todayCompletedSessions
    .filter((session) => session.paymentMethod === 'transfer')
    .reduce((total, session) => total + (session.fee || 0), 0)

  const stats: ShiftStat[] = [
    {
      label: 'Xe vào hôm nay',
      value: isLoading ? '-' : todayCheckins.length,
      detail: 'Tổng lượt check-in trong ngày',
      tone: 'sky',
    },
    {
      label: 'Xe ra hôm nay',
      value: isLoading ? '-' : todayCompletedSessions.length,
      detail: 'Phiên đã hoàn tất checkout',
      tone: 'emerald',
    },
    {
      label: 'Xe còn trong bãi',
      value: isLoading ? '-' : activeSessions.length,
      detail: 'Cần bàn giao cho ca tiếp theo',
      tone: 'amber',
    },
    {
      label: 'Doanh thu ca',
      value: isLoading ? '-' : formatStaffCurrency(revenue),
      detail: `Tiền mặt ${formatStaffCurrency(cashRevenue)} · CK ${formatStaffCurrency(transferRevenue)}`,
      tone: 'violet',
    },
  ]

  const lastStaffName = todayCompletedSessions[0]
    ? getSessionStaffName(todayCompletedSessions[0])
    : 'Nhân viên hiện tại'

  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-8 lg:p-10">
      <StaffPageHeader
        eyebrow="Bàn giao ca trực"
        title="Tổng kết ca"
        description="Đối soát lượt xe, doanh thu và ghi chú trước khi bàn giao cho ca tiếp theo."
        actions={
          <Button type="button" variant="outline" onClick={() => void loadShiftData()} disabled={isLoading}>
            <RefreshCw className="size-4" />
            {isLoading ? 'Đang cập nhật...' : 'Làm mới dữ liệu'}
          </Button>
        }
      />

      {error && (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StaffShiftStatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <StaffShiftCheckoutList sessions={todayCompletedSessions} isLoading={isLoading} />
        <StaffShiftHandoverPanel
          lastStaffName={lastStaffName}
          cashRevenue={cashRevenue}
          transferRevenue={transferRevenue}
          activeCount={activeSessions.length}
        />
      </div>
    </div>
  )
}
