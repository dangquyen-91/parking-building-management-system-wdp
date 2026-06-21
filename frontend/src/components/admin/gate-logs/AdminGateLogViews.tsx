import type { AdminDashboardReport } from '../../../services/adminApi'
import type { GateCustomerType, GateSession, GateVehicleType } from '../../../services/staffGateApi'
import { formatSessionSpot } from '../../staff/data/staffGateUtils'
import { AdminStatCard } from '../common/AdminStatCard'
import { AdminStatusBadge } from '../common/AdminStatusBadge'
import { formatAdminCurrency } from '../adminData'
import { formatOperationDateTime, getOperationStaffName, OperationEmpty, OperationField, OperationInfoCell, OperationListShell } from '../operations/AdminOperationPrimitives'

export type AdminGateVehicleFilter = 'all' | GateVehicleType
export type AdminGateCustomerFilter = 'all' | GateCustomerType

export function AdminGateLogFilters({ query, vehicleFilter, customerFilter, onQueryChange, onVehicleFilterChange, onCustomerFilterChange }: { query: string; vehicleFilter: AdminGateVehicleFilter; customerFilter: AdminGateCustomerFilter; onQueryChange: (value: string) => void; onVehicleFilterChange: (value: AdminGateVehicleFilter) => void; onCustomerFilterChange: (value: AdminGateCustomerFilter) => void }) {
  return <div className="grid w-full gap-3 rounded-2xl border border-theme bg-page/55 p-3 shadow-sm backdrop-blur-sm md:grid-cols-3 xl:min-w-[46rem]"><OperationField label="Tìm biển số"><input className="h-11 min-w-0 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Ví dụ: 51G-882.14" /></OperationField><OperationField label="Loại xe"><select className="h-11 min-w-0 rounded-xl border border-theme bg-page px-3 text-sm text-fg" value={vehicleFilter} onChange={(event) => onVehicleFilterChange(event.target.value as AdminGateVehicleFilter)}><option value="all">Tất cả</option><option value="motorcycle">Xe máy</option><option value="car">Ô tô</option></select></OperationField><OperationField label="Loại khách"><select className="h-11 min-w-0 rounded-xl border border-theme bg-page px-3 text-sm text-fg" value={customerFilter} onChange={(event) => onCustomerFilterChange(event.target.value as AdminGateCustomerFilter)}><option value="all">Tất cả</option><option value="resident">Cư dân</option><option value="walk_in">Khách vãng lai</option></select></OperationField></div>
}

export function AdminGateLogStats({ dashboard, isLoading }: { dashboard: AdminDashboardReport | null; isLoading: boolean }) {
  const activity = dashboard?.activity
  return <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><AdminStatCard label="Đang trong bãi" value={isLoading ? '-' : activity?.activeSessions ?? 0} detail="Phiên đang hoạt động" tone="emerald" /><AdminStatCard label="Xe vào hôm nay" value={isLoading ? '-' : activity?.checkinsToday ?? 0} detail="Tổng lượt check-in" tone="sky" /><AdminStatCard label="Xe ra hôm nay" value={isLoading ? '-' : activity?.checkoutsToday ?? 0} detail="Tổng lượt check-out" tone="violet" /><AdminStatCard label="Doanh thu hôm nay" value={isLoading ? '-' : formatAdminCurrency(dashboard?.revenueToday.total ?? 0)} detail="Tất cả nguồn thanh toán" tone="amber" /></div>
}

export function AdminGateLogList({ sessions, isLoading }: { sessions: GateSession[]; isLoading: boolean }) {
  if (isLoading) return <OperationEmpty text="Đang tải hoạt động cổng..." />
  if (!sessions.length) return <OperationEmpty text="Không có phiên gửi xe phù hợp." />
  return <OperationListShell eyebrow="Giám sát trực tiếp" title="Xe đang trong bãi" count={`${sessions.length} xe`} tone="gate">{sessions.map((session) => <article key={session._id} className="group relative overflow-hidden rounded-2xl border border-theme bg-badge p-3 transition-all hover:-translate-y-0.5 hover:border-emerald-500/25 hover:bg-emerald-500/5 hover:shadow-lg"><span className="absolute inset-y-0 left-0 w-1 bg-emerald-500" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-center"><div className="min-w-0 rounded-xl bg-page/45 p-3"><p className="truncate text-lg font-black tracking-[0.06em] text-fg">{session.licensePlate}</p><p className="mt-1 truncate text-[10px] text-subtle">{session._id}</p></div><OperationInfoCell label="Phân loại" value={session.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'} detail={session.customerType === 'resident' ? 'Cư dân' : 'Khách vãng lai'} /><OperationInfoCell label="Vị trí" value={formatSessionSpot(session)} /><OperationInfoCell label="Nhân viên" value={getOperationStaffName(session.staffId)} /><OperationInfoCell label="Thời gian vào" value={formatOperationDateTime(session.entryTime)} /><div className="flex min-h-20 items-center rounded-xl bg-page/45 p-3"><AdminStatusBadge status="active" label="Trong bãi" /></div></div></article>)}</OperationListShell>
}
