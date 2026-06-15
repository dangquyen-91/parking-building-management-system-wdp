import { Link } from 'react-router-dom'
import type { ManagerBooking } from '../../services/managerBookingsApi'
import type { ManagerOccupancyFloor } from '../../services/managerReportsApi'
import type { GateSession } from '../../services/staffGateApi'
import { ManagerStatusBadge } from './ManagerStatusBadge'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(value))
}

function vehicleLabel(value: 'car' | 'motorcycle') {
  return value === 'car' ? 'Ô tô' : 'Xe máy'
}

export function ManagerOverviewCapacity({ floors }: { floors: ManagerOccupancyFloor[] }) {
  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Công suất</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Tình trạng từng tầng</h2>
        </div>
        <Link to="/manager/slots" className="text-xs font-semibold text-muted hover:text-fg">
          Quản lý chỗ đỗ
        </Link>
      </div>

      {floors.length === 0 ? (
        <p className="py-8 text-center text-sm text-subtle">Chưa có dữ liệu tầng đỗ xe.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {floors.slice(0, 6).map((floor) => (
            <article key={floor.floorId} className="rounded-lg border border-theme bg-badge p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-fg">
                    {floor.building?.name ?? 'Chưa xác định'} · Tầng {floor.floorNumber}
                  </p>
                  <p className="mt-1 text-xs text-subtle">{vehicleLabel(floor.vehicleType)}</p>
                </div>
                <ManagerStatusBadge
                  status={floor.utilizationPercent >= 90 ? 'occupied' : 'available'}
                  label={`${floor.utilizationPercent}%`}
                />
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-page">
                <div
                  className="h-full rounded-full bg-btn-primary"
                  style={{ width: `${Math.min(100, floor.utilizationPercent)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted">
                Đang đỗ {floor.occupied} · Còn trống {floor.empty} · Bảo trì {floor.maintenance ?? 0}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export function ManagerOverviewActivity({ sessions }: { sessions: GateSession[] }) {
  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Hoạt động cổng</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Xe vừa vào bãi</h2>
        </div>
        <Link to="/manager/gate-logs" className="text-xs font-semibold text-muted hover:text-fg">
          Xem tất cả
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="py-8 text-center text-sm text-subtle">Hiện không có xe trong bãi.</p>
      ) : (
        <div className="space-y-2">
          {sessions.slice(0, 5).map((session) => (
            <article key={session._id} className="flex items-center justify-between gap-3 rounded-lg border border-theme bg-badge p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-fg">{session.licensePlate}</p>
                <p className="mt-1 text-xs text-subtle">
                  {vehicleLabel(session.vehicleType)} · Vào {formatDateTime(session.entryTime)}
                </p>
              </div>
              <ManagerStatusBadge status="active" label="Trong bãi" />
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export function ManagerOverviewBookings({ bookings }: { bookings: ManagerBooking[] }) {
  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Booking sắp đến</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Đã thanh toán, chưa sử dụng</h2>
        </div>
        <Link to="/manager/bookings" className="text-xs font-semibold text-muted hover:text-fg">
          Quản lý booking
        </Link>
      </div>

      {bookings.length === 0 ? (
        <p className="py-8 text-center text-sm text-subtle">Không có booking đang chờ sử dụng.</p>
      ) : (
        <div className="space-y-2">
          {bookings.slice(0, 5).map((booking) => (
            <article key={booking._id} className="flex items-center justify-between gap-3 rounded-lg border border-theme bg-badge p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-fg">{booking.licensePlate}</p>
                <p className="mt-1 text-xs text-subtle">Dự kiến đến {formatDateTime(booking.expectedArrivalTime)}</p>
              </div>
              <ManagerStatusBadge status="confirmed" label="Đã thanh toán" />
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export type ManagerOverviewAlert = {
  id: string
  title: string
  detail: string
  to: string
  tone: 'pending' | 'maintenance' | 'occupied'
}

export function ManagerOverviewAlerts({ alerts }: { alerts: ManagerOverviewAlert[] }) {
  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Cần chú ý</p>
        <h2 className="mt-1 text-base font-semibold text-fg">Cảnh báo vận hành</h2>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-200">
          Chưa phát hiện vấn đề cần xử lý.
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.slice(0, 6).map((alert) => (
            <Link key={alert.id} to={alert.to} className="block rounded-lg border border-theme bg-badge p-3 hover:bg-ghost">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-fg">{alert.title}</p>
                  <p className="mt-1 text-xs text-muted">{alert.detail}</p>
                </div>
                <ManagerStatusBadge status={alert.tone} label="Kiểm tra" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

const QUICK_LINKS = [
  { to: '/manager/gate-logs', label: 'Hoạt động cổng', detail: 'Theo dõi xe đang trong bãi' },
  { to: '/manager/bookings', label: 'Booking', detail: 'Xử lý booking đang chờ' },
  { to: '/manager/slots', label: 'Chỗ đỗ', detail: 'Kiểm tra công suất và bảo trì' },
  { to: '/manager/reports', label: 'Báo cáo', detail: 'Xem doanh thu và vận hành' },
]

export function ManagerOverviewQuickLinks() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {QUICK_LINKS.map((item) => (
        <Link key={item.to} to={item.to} className="rounded-lg border border-theme bg-badge p-4 transition-colors hover:bg-ghost">
          <p className="text-sm font-semibold text-fg">{item.label}</p>
          <p className="mt-1 text-xs text-muted">{item.detail}</p>
        </Link>
      ))}
    </section>
  )
}
