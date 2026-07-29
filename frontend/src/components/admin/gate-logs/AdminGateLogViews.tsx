import type { AdminDashboardReport } from '../../../services/adminApi'
import type {
  GateCustomerType,
  GateSession,
  GateVehicleType,
} from '../../../services/staffGateApi'
import { formatSessionSpot } from '../../staff/data/staffGateUtils'
import { Card, CardContent } from '../../ui/card'
import { Input } from '../../ui/input'
import { NativeSelect, NativeSelectOption } from '../../ui/native-select'
import { TableCell, TableRow } from '../../ui/table'
import { formatAdminCurrency } from '../adminData'
import { AdminStatCard } from '../common/AdminStatCard'
import { AdminStatusBadge } from '../common/AdminStatusBadge'
import { AdminTableShell } from '../common/AdminTableShell'
import {
  formatOperationDateTime,
  getOperationStaffName,
  OperationEmpty,
  OperationField,
} from '../operations/AdminOperationPrimitives'

export type AdminGateVehicleFilter = 'all' | GateVehicleType
export type AdminGateCustomerFilter = 'all' | GateCustomerType
export function AdminGateLogFilters(p: {
  query: string
  vehicleFilter: AdminGateVehicleFilter
  customerFilter: AdminGateCustomerFilter
  onQueryChange: (v: string) => void
  onVehicleFilterChange: (v: AdminGateVehicleFilter) => void
  onCustomerFilterChange: (v: AdminGateCustomerFilter) => void
}) {
  return (
    <Card className="w-full xl:min-w-[46rem]">
      <CardContent className="grid gap-3 p-4 md:grid-cols-3">
        <OperationField label="Tìm biển số">
          <Input
            value={p.query}
            onChange={(e) => p.onQueryChange(e.target.value)}
            placeholder="Ví dụ: 51G-882.14"
          />
        </OperationField>
        <OperationField label="Loại xe">
          <NativeSelect
            value={p.vehicleFilter}
            onChange={(e) =>
              p.onVehicleFilterChange(e.target.value as AdminGateVehicleFilter)
            }
          >
            <NativeSelectOption value="all">Tất cả</NativeSelectOption>
            <NativeSelectOption value="motorcycle">Xe máy</NativeSelectOption>
            <NativeSelectOption value="car">Ô tô</NativeSelectOption>
          </NativeSelect>
        </OperationField>
        <OperationField label="Loại khách">
          <NativeSelect
            value={p.customerFilter}
            onChange={(e) =>
              p.onCustomerFilterChange(
                e.target.value as AdminGateCustomerFilter,
              )
            }
          >
            <NativeSelectOption value="all">Tất cả</NativeSelectOption>
            <NativeSelectOption value="resident">Cư dân</NativeSelectOption>
            <NativeSelectOption value="walk_in">
              Khách vãng lai
            </NativeSelectOption>
          </NativeSelect>
        </OperationField>
      </CardContent>
    </Card>
  )
}
export function AdminGateLogStats({
  dashboard,
  isLoading,
}: {
  dashboard: AdminDashboardReport | null
  isLoading: boolean
}) {
  const a = dashboard?.activity
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        label="Đang trong bãi"
        value={isLoading ? '-' : (a?.activeSessions ?? 0)}
        detail="Phiên đang hoạt động"
        tone="emerald"
      />
      <AdminStatCard
        label="Xe vào hôm nay"
        value={isLoading ? '-' : (a?.checkinsToday ?? 0)}
        detail="Tổng lượt check-in"
        tone="sky"
      />
      <AdminStatCard
        label="Xe ra hôm nay"
        value={isLoading ? '-' : (a?.checkoutsToday ?? 0)}
        detail="Tổng lượt check-out"
        tone="violet"
      />
      <AdminStatCard
        label="Doanh thu hôm nay"
        value={
          isLoading
            ? '-'
            : formatAdminCurrency(dashboard?.revenueToday.total ?? 0)
        }
        detail="Tất cả nguồn thanh toán"
        tone="amber"
      />
    </div>
  )
}
export function AdminGateLogList({
  sessions,
  isLoading,
}: {
  sessions: GateSession[]
  isLoading: boolean
}) {
  if (isLoading) return <OperationEmpty text="Đang tải hoạt động cổng..." />
  if (!sessions.length)
    return <OperationEmpty text="Không có phiên gửi xe phù hợp." />
  return (
    <AdminTableShell
      eyebrow="Giám sát trực tiếp"
      title="Xe đang trong bãi"
      countLabel={`${sessions.length} xe`}
      minWidth="1050px"
      columns={[
        { label: 'Biển số', className: 'w-[16%]' },
        { label: 'Phân loại', className: 'w-[18%]' },
        { label: 'Vị trí', className: 'w-[25%]' },
        { label: 'Nhân viên', className: 'w-[17%]' },
        { label: 'Thời gian vào', className: 'w-[16%]' },
        { label: 'Trạng thái', className: 'w-[12%]' },
      ]}
    >
      {sessions.map((s) => (
        <TableRow key={s._id}>
          <TableCell className="px-4 py-4 font-black tracking-[0.06em]">
            {s.licensePlate}
          </TableCell>
          <TableCell className="px-4 py-4">
            <p className="font-semibold">
              {s.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {s.customerType === 'resident' ? 'Cư dân' : 'Khách vãng lai'}
            </p>
          </TableCell>
          <TableCell className="px-4 py-4">
            <p className="line-clamp-2 whitespace-normal font-medium">
              {formatSessionSpot(s)}
            </p>
          </TableCell>
          <TableCell className="px-4 py-4">
            {getOperationStaffName(s.staffId)}
          </TableCell>
          <TableCell className="px-4 py-4">
            {formatOperationDateTime(s.entryTime)}
          </TableCell>
          <TableCell className="px-4 py-4">
            <AdminStatusBadge status="active" label="Trong bãi" />
          </TableCell>
        </TableRow>
      ))}
    </AdminTableShell>
  )
}
