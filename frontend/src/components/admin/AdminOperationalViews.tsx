import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import type { AdminBooking, AdminDashboardReport, AdminSubscription, AdminUser } from '../../services/adminApi'
import type { ManagerPlan, ManagerPlanUpdatePayload } from '../../services/managerPlansApi'
import type { GateSession, GateUser, GateVehicleType, GateCustomerType } from '../../services/staffGateApi'
import { isSubscriptionExpiringSoon } from '../../utils/managerSubscriptionUi'
import { formatSessionSpot } from '../staff/data/staffGateUtils'
import { AdminStatCard } from './AdminStatCard'
import { AdminStatusBadge } from './AdminStatusBadge'
import { formatAdminCurrency } from './adminData'

export type AdminBookingStatusFilter = 'all' | AdminBooking['status']
export type AdminStaffStatusFilter = 'all' | 'active' | 'inactive'
export type AdminGateVehicleFilter = 'all' | GateVehicleType
export type AdminGateCustomerFilter = 'all' | GateCustomerType
export type AdminSubscriptionStatusFilter = AdminSubscription['status'] | 'all' | 'expiring'
export type AdminSubscriptionVehicleFilter = AdminSubscription['vehicleType'] | 'all'
export type AdminPlanVehicleFilter = 'all' | ManagerPlan['vehicleType']
export type AdminPlanStatusFilter = 'all' | 'active' | 'inactive'

const inputClass = 'h-10 min-w-0 rounded-lg border border-theme bg-page px-3 text-sm text-fg outline-none focus:border-btn-primary'

export function AdminBookingFilters({
  query,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
}: {
  query: string
  statusFilter: AdminBookingStatusFilter
  onQueryChange: (value: string) => void
  onStatusFilterChange: (value: AdminBookingStatusFilter) => void
}) {
  return (
    <div className="grid w-full gap-3 rounded-2xl border border-theme bg-page/55 p-3 shadow-sm backdrop-blur-sm sm:grid-cols-2 xl:min-w-[34rem]">
      <Field label="Tìm kiếm"><input className="h-11 min-w-0 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15" value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Biển số, số điện thoại hoặc khách hàng" /></Field>
      <Field label="Trạng thái">
        <select className="h-11 min-w-0 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as AdminBookingStatusFilter)}>
          <option value="all">Tất cả</option><option value="pending">Chờ thanh toán</option><option value="paid">Đã thanh toán</option>
          <option value="used">Đã sử dụng</option><option value="expired">Hết hạn</option><option value="cancelled">Đã hủy</option>
        </select>
      </Field>
    </div>
  )
}

export function AdminBookingStats({ bookings, isLoading }: { bookings: AdminBooking[]; isLoading: boolean }) {
  const pending = bookings.filter((item) => item.status === 'pending').length
  const paid = bookings.filter((item) => item.status === 'paid').length
  const used = bookings.filter((item) => item.status === 'used').length
  const revenue = bookings.filter((item) => item.status === 'paid' || item.status === 'used').reduce((sum, item) => sum + item.amount, 0)
  return <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <AdminStatCard label="Tổng booking" value={isLoading ? '-' : bookings.length} detail="Tất cả trạng thái" tone="violet" />
    <AdminStatCard label="Chờ thanh toán" value={isLoading ? '-' : pending} detail="Chưa hoàn tất giao dịch" tone="amber" />
    <AdminStatCard label="Sẵn sàng sử dụng" value={isLoading ? '-' : paid} detail={`${used} booking đã sử dụng`} tone="emerald" />
    <AdminStatCard label="Doanh thu booking" value={isLoading ? '-' : formatAdminCurrency(revenue)} detail="Đã thanh toán và sử dụng" tone="sky" />
  </div>
}

export function AdminBookingList({ bookings, isLoading }: { bookings: AdminBooking[]; isLoading: boolean }) {
  if (isLoading) return <Empty text="Đang tải danh sách booking..." />
  if (!bookings.length) return <Empty text="Không có booking phù hợp." />
  return (
    <ListShell eyebrow="Danh sách đặt chỗ" title="Booking gần đây" count={`${bookings.length} booking`} tone="booking">
      {bookings.map((booking) => {
        const customer = booking.userId && typeof booking.userId !== 'string' ? booking.userId : null
        return (
          <article key={booking._id} className="group relative overflow-hidden rounded-2xl border border-theme bg-badge p-4 transition-all hover:-translate-y-0.5 hover:border-violet-500/25 hover:bg-violet-500/5 hover:shadow-lg">
            <span className={`absolute inset-y-0 left-0 w-1 ${
              booking.status === 'paid' || booking.status === 'used'
                ? 'bg-emerald-500'
                : booking.status === 'pending'
                  ? 'bg-amber-500'
                  : booking.status === 'cancelled'
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
            }`} />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6 xl:items-center">
              <div className="min-w-0 rounded-xl bg-page/45 p-3">
                <p className="truncate text-lg font-black tracking-[0.06em] text-fg">{booking.licensePlate}</p>
                <p className="mt-1 truncate text-[10px] text-subtle">{booking._id}</p>
              </div>
              <InfoCell label="Khách hàng" value={customer?.fullName ?? customer?.email ?? 'Khách vãng lai'} detail={booking.phoneNumber} />
              <InfoCell label="Thời gian đến" value={formatDateTime(booking.expectedArrivalTime)} />
              <InfoCell label="Thời gian rời" value={formatDateTime(booking.expectedExitTime)} detail={`${booking.durationHours} giờ`} />
              <InfoCell label="Số tiền" value={formatAdminCurrency(booking.amount)} strong />
              <div className="flex min-h-20 items-center rounded-xl bg-page/45 p-3"><AdminStatusBadge status={booking.status} /></div>
            </div>
          </article>
        )
      })}
    </ListShell>
  )
}

export function AdminStaffFilters({
  query, statusFilter, onQueryChange, onStatusFilterChange,
}: {
  query: string; statusFilter: AdminStaffStatusFilter; onQueryChange: (value: string) => void
  onStatusFilterChange: (value: AdminStaffStatusFilter) => void
}) {
  return (
    <div className="grid w-full gap-3 rounded-2xl border border-theme bg-page/55 p-3 shadow-sm backdrop-blur-sm sm:grid-cols-2 xl:min-w-[34rem]">
      <Field label="Tìm nhân viên"><input className="h-11 min-w-0 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Tên, email hoặc số điện thoại" /></Field>
      <Field label="Trạng thái">
        <select className="h-11 min-w-0 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as AdminStaffStatusFilter)}>
          <option value="all">Tất cả</option><option value="active">Đang hoạt động</option><option value="inactive">Đã khóa</option>
        </select>
      </Field>
    </div>
  )
}

export function AdminStaffStats({ staff, sessions, isLoading }: { staff: AdminUser[]; sessions: GateSession[]; isLoading: boolean }) {
  const active = staff.filter((item) => item.isActive).length
  const handlers = new Set(sessions.map((item) => typeof item.staffId === 'string' ? item.staffId : item.staffId?._id).filter(Boolean))
  return <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <AdminStatCard label="Tổng nhân viên" value={isLoading ? '-' : staff.length} detail="Tài khoản vai trò staff" tone="violet" />
    <AdminStatCard label="Đang hoạt động" value={isLoading ? '-' : active} detail={`${staff.length - active} tài khoản đã khóa`} tone="emerald" />
    <AdminStatCard label="Đang phụ trách xe" value={isLoading ? '-' : handlers.size} detail="Có phiên gửi xe hoạt động" tone="sky" />
    <AdminStatCard label="Xe đang theo dõi" value={isLoading ? '-' : sessions.length} detail="Chưa checkout" tone="amber" />
  </div>
}

export function AdminStaffList({ staff, sessions, isLoading }: { staff: AdminUser[]; sessions: GateSession[]; isLoading: boolean }) {
  if (isLoading) return <Empty text="Đang tải danh sách nhân viên..." />
  if (!staff.length) return <Empty text="Không có nhân viên phù hợp." />
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {staff.map((user) => {
        const activeSessions = sessions.filter((session) => (typeof session.staffId === 'string' ? session.staffId : session.staffId?._id) === user._id)
        return (
          <article key={user._id} className="liquid-glass-card group rounded-2xl border border-emerald-500/10 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-500/25 hover:shadow-lg">
            <span className={`absolute inset-x-0 top-0 h-1 ${user.isActive ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-gradient-to-r from-amber-500 to-rose-500'}`} />
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-xs font-black text-emerald-700 dark:text-emerald-200">
                  {user.fullName.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toUpperCase()}
                </span>
                <div className="min-w-0"><p className="truncate text-lg font-black text-fg">{user.fullName}</p><p className="mt-1 truncate text-xs text-subtle">{user.email}</p></div>
              </div>
              <AdminStatusBadge status={user.isActive ? 'active' : 'inactive'} />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-theme bg-page/35 p-3"><Value label="Số điện thoại" value={user.phone || 'Chưa cập nhật'} /></div>
              <div className="rounded-xl border border-theme bg-page/35 p-3"><Value label="Xe phụ trách" value={activeSessions.length} /></div>
              <div className="rounded-xl border border-theme bg-page/35 p-3"><Value label="Ô tô" value={activeSessions.filter((item) => item.vehicleType === 'car').length} /></div>
              <div className="rounded-xl border border-theme bg-page/35 p-3"><Value label="Xe máy" value={activeSessions.filter((item) => item.vehicleType === 'motorcycle').length} /></div>
            </dl>
            {!!activeSessions.length && <div className="mt-4 border-t border-theme pt-3"><p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-subtle">Biển số đang phụ trách</p><div className="flex flex-wrap gap-2">{activeSessions.slice(0, 5).map((item) => <span key={item._id} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-200">{item.licensePlate}</span>)}</div></div>}
          </article>
        )
      })}
    </section>
  )
}

export function AdminGateLogFilters({
  query, vehicleFilter, customerFilter, onQueryChange, onVehicleFilterChange, onCustomerFilterChange,
}: {
  query: string; vehicleFilter: AdminGateVehicleFilter; customerFilter: AdminGateCustomerFilter
  onQueryChange: (value: string) => void; onVehicleFilterChange: (value: AdminGateVehicleFilter) => void
  onCustomerFilterChange: (value: AdminGateCustomerFilter) => void
}) {
  return (
    <div className="grid w-full gap-3 rounded-2xl border border-theme bg-page/55 p-3 shadow-sm backdrop-blur-sm md:grid-cols-3 xl:min-w-[46rem]">
      <Field label="Tìm biển số"><input className="h-11 min-w-0 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Ví dụ: 51G-882.14" /></Field>
      <Field label="Loại xe"><select className="h-11 min-w-0 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15" value={vehicleFilter} onChange={(e) => onVehicleFilterChange(e.target.value as AdminGateVehicleFilter)}><option value="all">Tất cả</option><option value="motorcycle">Xe máy</option><option value="car">Ô tô</option></select></Field>
      <Field label="Loại khách"><select className="h-11 min-w-0 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15" value={customerFilter} onChange={(e) => onCustomerFilterChange(e.target.value as AdminGateCustomerFilter)}><option value="all">Tất cả</option><option value="resident">Cư dân</option><option value="walk_in">Khách vãng lai</option></select></Field>
    </div>
  )
}

export function AdminGateLogStats({ dashboard, isLoading }: { dashboard: AdminDashboardReport | null; isLoading: boolean }) {
  const activity = dashboard?.activity
  return <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <AdminStatCard label="Đang trong bãi" value={isLoading ? '-' : activity?.activeSessions ?? 0} detail="Phiên đang hoạt động" tone="emerald" />
    <AdminStatCard label="Xe vào hôm nay" value={isLoading ? '-' : activity?.checkinsToday ?? 0} detail="Tổng lượt check-in" tone="sky" />
    <AdminStatCard label="Xe ra hôm nay" value={isLoading ? '-' : activity?.checkoutsToday ?? 0} detail="Tổng lượt check-out" tone="violet" />
    <AdminStatCard label="Doanh thu hôm nay" value={isLoading ? '-' : formatAdminCurrency(dashboard?.revenueToday.total ?? 0)} detail="Tất cả nguồn thanh toán" tone="amber" />
  </div>
}

export function AdminGateLogList({ sessions, isLoading }: { sessions: GateSession[]; isLoading: boolean }) {
  if (isLoading) return <Empty text="Đang tải hoạt động cổng..." />
  if (!sessions.length) return <Empty text="Không có phiên gửi xe phù hợp." />
  return (
    <ListShell eyebrow="Giám sát trực tiếp" title="Xe đang trong bãi" count={`${sessions.length} xe`} tone="gate">
      {sessions.map((session) => (
        <article key={session._id} className="group relative overflow-hidden rounded-2xl border border-theme bg-badge p-3 transition-all hover:-translate-y-0.5 hover:border-emerald-500/25 hover:bg-emerald-500/5 hover:shadow-lg">
          <span className="absolute inset-y-0 left-0 w-1 bg-emerald-500" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-center">
            <div className="min-w-0 rounded-xl bg-page/45 p-3">
              <p className="truncate text-lg font-black tracking-[0.06em] text-fg">{session.licensePlate}</p>
              <p className="mt-1 truncate text-[10px] text-subtle">{session._id}</p>
            </div>
            <InfoCell label="Phân loại" value={session.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'} detail={session.customerType === 'resident' ? 'Cư dân' : 'Khách vãng lai'} />
            <InfoCell label="Vị trí" value={formatSessionSpot(session)} />
            <InfoCell label="Nhân viên" value={getStaffName(session.staffId)} />
            <InfoCell label="Thời gian vào" value={formatDateTime(session.entryTime)} />
            <div className="flex min-h-20 items-center rounded-xl bg-page/45 p-3"><AdminStatusBadge status="active" label="Trong bãi" /></div>
          </div>
        </article>
      ))}
    </ListShell>
  )
}

export function AdminSubscriptionFilters({
  query, status, vehicleType, onQueryChange, onStatusChange, onVehicleTypeChange,
}: {
  query: string; status: AdminSubscriptionStatusFilter; vehicleType: AdminSubscriptionVehicleFilter
  onQueryChange: (value: string) => void; onStatusChange: (value: AdminSubscriptionStatusFilter) => void
  onVehicleTypeChange: (value: AdminSubscriptionVehicleFilter) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <input className="h-11 min-w-0 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" type="search" value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Tên, email, SĐT hoặc biển số" />
      <select className="h-11 min-w-0 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15" value={status} onChange={(e) => onStatusChange(e.target.value as AdminSubscriptionStatusFilter)}><option value="all">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="expiring">Sắp hết hạn</option><option value="pending">Chờ thanh toán</option><option value="expired">Đã hết hạn</option><option value="cancelled">Đã hủy</option></select>
      <select className="h-11 min-w-0 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15" value={vehicleType} onChange={(e) => onVehicleTypeChange(e.target.value as AdminSubscriptionVehicleFilter)}><option value="all">Tất cả loại xe</option><option value="motorcycle">Xe máy</option><option value="car">Ô tô</option></select>
    </div>
  )
}

export function AdminSubscriptionStats({ subscriptions, activePlates, snapshotTime }: { subscriptions: AdminSubscription[]; activePlates: Set<string>; snapshotTime: number }) {
  return <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <AdminStatCard label="Tổng đăng ký" value={subscriptions.length} detail={`${subscriptions.filter((item) => item.status === 'pending').length} chờ thanh toán`} tone="violet" />
    <AdminStatCard label="Gói hoạt động" value={subscriptions.filter((item) => item.status === 'active').length} detail={`${subscriptions.filter((item) => item.status === 'expired').length} đã hết hạn`} tone="emerald" />
    <AdminStatCard label="Sắp hết hạn" value={subscriptions.filter((item) => isSubscriptionExpiringSoon(item, snapshotTime)).length} detail="Còn tối đa 7 ngày" tone="amber" />
    <AdminStatCard label="Xe gói trong bãi" value={subscriptions.filter((item) => activePlates.has(item.licensePlate)).length} detail="Có phiên đang hoạt động" tone="sky" />
  </div>
}

export function AdminSubscriptionList({ subscriptions, activePlates, snapshotTime, loading }: { subscriptions: AdminSubscription[]; activePlates: Set<string>; snapshotTime: number; loading: boolean }) {
  if (loading) return <Empty text="Đang tải người dùng gói..." />
  if (!subscriptions.length) return <Empty text="Không tìm thấy người dùng gói phù hợp." />
  return (
    <ListShell eyebrow="Danh sách" title="Người đã đăng ký gói" count={`${subscriptions.length} gói`} tone="gate">
      {subscriptions.map((item) => {
        const owner = item.userId && typeof item.userId !== 'string' ? item.userId : null
        const plan = item.planId && typeof item.planId !== 'string' ? item.planId : null
        const slot = item.slotId && typeof item.slotId !== 'string' ? item.slotId : null
        const remaining = item.status === 'active' && item.endDate ? Math.max(0, Math.ceil((new Date(item.endDate).getTime() - snapshotTime) / 86_400_000)) : null
        return (
          <article key={item._id} className="group relative overflow-hidden rounded-2xl border border-theme bg-badge p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-500/25 hover:bg-emerald-500/5 hover:shadow-lg">
            <span className={`absolute inset-y-0 left-0 w-1 ${item.status === 'active' ? 'bg-emerald-500' : item.status === 'pending' ? 'bg-amber-500' : 'bg-slate-400'}`} />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1fr_1fr_auto] xl:items-center">
              <div className="rounded-xl bg-page/45 p-3"><p className="text-lg font-black tracking-[0.06em] text-fg">{item.licensePlate}</p><p className="mt-1 text-xs text-muted">{item.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}{slot?.slotCode ? ` · ${slot.slotCode}` : ''}</p></div>
              <InfoCell label="Người mua" value={owner?.fullName ?? 'Không xác định'} detail={owner?.email ?? owner?.phone ?? '-'} />
              <InfoCell label="Gói đăng ký" value={plan?.name ?? plan?.code ?? 'Không xác định'} detail={`${plan?.durationDays ?? 0} ngày sử dụng`} />
              <InfoCell label="Thời hạn" value={`${formatDate(item.startDate)} - ${formatDate(item.endDate)}`} detail={remaining === null ? 'Chưa bắt đầu' : `Còn ${remaining} ngày`} />
              <div className="flex min-h-20 flex-wrap content-center gap-2 rounded-xl bg-page/45 p-3"><AdminStatusBadge status={item.status} />{activePlates.has(item.licensePlate) && <AdminStatusBadge status="active" label="Trong bãi" />}</div>
            </div>
          </article>
        )
      })}
    </ListShell>
  )
}

export function AdminPlanFilters({ vehicleFilter, statusFilter, onVehicleFilterChange, onStatusFilterChange }: { vehicleFilter: AdminPlanVehicleFilter; statusFilter: AdminPlanStatusFilter; onVehicleFilterChange: (value: AdminPlanVehicleFilter) => void; onStatusFilterChange: (value: AdminPlanStatusFilter) => void }) {
  return <div className="grid w-full gap-3 rounded-2xl border border-theme bg-page/55 p-3 shadow-sm backdrop-blur-sm sm:grid-cols-2 xl:min-w-[30rem]"><Field label="Loại xe"><select className="h-11 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15" value={vehicleFilter} onChange={(e) => onVehicleFilterChange(e.target.value as AdminPlanVehicleFilter)}><option value="all">Tất cả</option><option value="motorcycle">Xe máy</option><option value="car">Ô tô</option></select></Field><Field label="Trạng thái"><select className="h-11 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as AdminPlanStatusFilter)}><option value="all">Tất cả</option><option value="active">Đang hoạt động</option><option value="inactive">Đã tắt</option></select></Field></div>
}

export function AdminPlanStats({ plans, isLoading }: { plans: ManagerPlan[]; isLoading: boolean }) {
  return <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <AdminStatCard label="Tổng gói" value={isLoading ? '-' : plans.length} detail="Tất cả loại xe" tone="violet" />
    <AdminStatCard label="Đang hoạt động" value={isLoading ? '-' : plans.filter((item) => item.isActive).length} detail="Có thể đăng ký" tone="emerald" />
    <AdminStatCard label="Gói xe máy" value={isLoading ? '-' : plans.filter((item) => item.vehicleType === 'motorcycle').length} detail="Dùng sức chứa chung" tone="sky" />
    <AdminStatCard label="Gói ô tô" value={isLoading ? '-' : plans.filter((item) => item.vehicleType === 'car').length} detail="Chọn ô cố định" tone="amber" />
  </div>
}

export function AdminPlanList({ plans, isLoading, updatingId, onEdit, onToggle }: { plans: ManagerPlan[]; isLoading: boolean; updatingId: string | null; onEdit: (plan: ManagerPlan) => void; onToggle: (plan: ManagerPlan) => void }) {
  if (isLoading) return <Empty text="Đang tải danh sách gói..." />
  if (!plans.length) return <Empty text="Không có gói phù hợp." />
  return <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{plans.map((plan) => <article key={plan._id} className="liquid-glass-card group rounded-2xl border border-violet-500/10 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-500/25 hover:shadow-xl"><span className={`absolute inset-x-0 top-0 h-1 ${plan.vehicleType === 'car' ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-gradient-to-r from-sky-500 to-emerald-500'}`} /><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">{plan.code}</p><h2 className="mt-2 text-xl font-black text-fg">{plan.name}</h2></div><AdminStatusBadge status={plan.isActive ? 'active' : 'inactive'} /></div><p className="mt-5 text-3xl font-black tracking-tight text-fg">{formatAdminCurrency(plan.price)}</p><p className="mt-1 text-xs font-medium text-muted">{plan.durationDays} ngày · {plan.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}</p><p className="mt-4 min-h-12 text-sm leading-6 text-muted">{plan.description || 'Không có mô tả.'}</p><div className="mt-5 flex gap-2 border-t border-theme pt-4"><button className="h-11 flex-1 rounded-xl border border-violet-500/25 bg-violet-500/10 text-sm font-bold text-violet-700 transition hover:bg-violet-500 hover:text-white dark:text-violet-200" onClick={() => onEdit(plan)}>Chỉnh sửa</button><button className={`h-11 flex-1 rounded-xl text-sm font-bold text-white disabled:opacity-50 ${plan.isActive ? 'bg-amber-500' : 'bg-emerald-500'}`} disabled={updatingId === plan._id} onClick={() => onToggle(plan)}>{updatingId === plan._id ? 'Đang lưu...' : plan.isActive ? 'Tạm dừng' : 'Kích hoạt'}</button></div></article>)}</section>
}

export function AdminPlanFormModal({ plan, isSubmitting, error, onClose, onSubmit }: { plan: ManagerPlan | null; isSubmitting: boolean; error: string | null; onClose: () => void; onSubmit: (payload: ManagerPlanUpdatePayload) => void }) {
  const [name, setName] = useState(''); const [price, setPrice] = useState(''); const [durationDays, setDurationDays] = useState(''); const [description, setDescription] = useState('')
  // Form state is intentionally reset whenever a different plan is opened.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (plan) { setName(plan.name); setPrice(String(plan.price)); setDurationDays(String(plan.durationDays)); setDescription(plan.description ?? '') } }, [plan])
  if (!plan) return null
  function submit(event: FormEvent) { event.preventDefault(); onSubmit({ name: name.trim(), price: Number(price), durationDays: Number(durationDays), description: description.trim() }) }
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-overlay p-4" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><form className="liquid-glass-card w-full max-w-lg rounded-2xl p-5" onSubmit={submit}><div className="flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Admin // Gói gửi xe</p><h2 className="mt-2 text-xl font-semibold text-fg">Chỉnh sửa gói</h2></div><button type="button" className="text-muted" onClick={onClose}>✕</button></div><div className="mt-5 grid gap-4"><Field label="Tên gói"><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Giá"><input className={inputClass} type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required /></Field><Field label="Thời hạn (ngày)"><input className={inputClass} type="number" min="1" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} required /></Field></div><Field label="Mô tả"><textarea className="min-h-24 rounded-lg border border-theme bg-page p-3 text-sm text-fg" value={description} onChange={(e) => setDescription(e.target.value)} /></Field>{error && <p className="text-sm text-rose-300">{error}</p>}</div><div className="mt-5 flex justify-end gap-2"><button type="button" className="h-10 rounded-lg border border-theme px-4 text-sm text-fg" onClick={onClose}>Hủy</button><button className="h-10 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg disabled:opacity-50" disabled={isSubmitting}>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</button></div></form></div>
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="grid gap-1 text-xs font-medium text-subtle">{label}{children}</label> }
function Empty({ text }: { text: string }) { return <div className="liquid-glass-card rounded-2xl border border-dashed border-theme p-8 text-center text-sm text-muted">{text}</div> }
function ListShell({ eyebrow, title, count, children, tone = 'default' }: { eyebrow: string; title: string; count: string; children: ReactNode; tone?: 'default' | 'booking' | 'gate' }) {
  const accent = tone === 'booking'
    ? 'from-violet-500 via-fuchsia-500 to-amber-400'
    : tone === 'gate'
      ? 'from-emerald-500 via-cyan-400 to-sky-500'
      : 'from-violet-500 via-sky-500 to-emerald-500'
  const label = tone === 'gate' ? 'text-emerald-600 dark:text-emerald-300' : tone === 'booking' ? 'text-violet-600 dark:text-violet-300' : 'text-subtle'
  return <section className="liquid-glass-card rounded-2xl border border-theme p-4 shadow-sm md:p-5"><span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} /><div className="mb-4 flex items-center justify-between gap-3"><div><p className={`text-[10px] font-black uppercase tracking-[0.18em] ${label}`}>{eyebrow}</p><h2 className="mt-1 text-lg font-black text-fg">{title}</h2></div><span className="rounded-full border border-theme bg-page/40 px-3 py-1 text-xs font-bold text-subtle">{count}</span></div><div className="grid gap-3">{children}</div></section>
}
function InfoCell({ label, value, detail, strong = false }: { label: string; value: string | number; detail?: string; strong?: boolean }) { return <div className="flex min-h-20 min-w-0 flex-col justify-center rounded-xl bg-page/45 p-3"><p className="text-xs text-subtle">{label}</p><p className={`mt-1 truncate text-fg ${strong ? 'font-black' : 'font-semibold'}`}>{value}</p>{detail && <p className="mt-1 truncate text-xs text-muted">{detail}</p>}</div> }
function Value({ label, value, detail, strong = false }: { label: string; value: string | number; detail?: string; strong?: boolean }) { return <div className="min-w-0"><dt className="text-xs text-subtle">{label}</dt><dd className={`mt-1 truncate text-fg ${strong ? 'text-lg font-semibold' : 'font-medium'}`}>{value}</dd>{detail && <p className="mt-1 truncate text-xs text-muted">{detail}</p>}</div> }
function formatDateTime(value: string) { return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value)) }
function formatDate(value?: string | null) { return value ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value)) : '-' }
function getStaffName(staff?: GateUser | string | null) { return !staff ? 'Không xác định' : typeof staff === 'string' ? staff : staff.fullName || staff.email || 'Không xác định' }
