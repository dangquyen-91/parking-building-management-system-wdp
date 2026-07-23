import { RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  StaffPageHeader,
  StaffVehicleFilters,
  StaffVehicleList,
  StaffVehicleStats,
} from '../../components/staff'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useStaffVehicles } from '../../hooks/useStaffVehicles'
import type { GateSession } from '../../services/staffGateApi'

export function StaffVehiclesPage() {
  const navigate = useNavigate()
  const {
    filteredSessions,
    stats,
    floorMap,
    query,
    vehicleFilter,
    customerFilter,
    isLoading,
    error,
    setQuery,
    setVehicleFilter,
    setCustomerFilter,
    reload,
  } = useStaffVehicles()

  function handleCheckout(session: GateSession) {
    navigate(`/staff/check-out?checkout=${encodeURIComponent(session.licensePlate)}`)
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-8 lg:p-10">
      <StaffPageHeader
        eyebrow="Theo dõi thời gian thực"
        title="Xe đang gửi trong bãi"
        description="Kiểm tra vị trí, thời gian lưu bãi và chuyển nhanh sang quy trình xe ra."
        actions={
          <Button type="button" variant="outline" onClick={() => void reload()} disabled={isLoading}>
            <RefreshCw className="size-4" />
            {isLoading ? 'Đang cập nhật...' : 'Làm mới danh sách'}
          </Button>
        }
      />

      <StaffVehicleStats stats={stats} isLoading={isLoading} />

      <Card>
        <CardHeader>
          <CardDescription>Danh sách phương tiện</CardDescription>
          <CardTitle>{isLoading ? 'Đang tải...' : `${filteredSessions.length} xe phù hợp`}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <StaffVehicleFilters
            query={query}
            vehicleFilter={vehicleFilter}
            customerFilter={customerFilter}
            onQueryChange={setQuery}
            onVehicleFilterChange={setVehicleFilter}
            onCustomerFilterChange={setCustomerFilter}
          />
          <StaffVehicleList
            sessions={filteredSessions}
            floorMap={floorMap}
            isLoading={isLoading}
            error={error}
            onCheckout={handleCheckout}
          />
        </CardContent>
      </Card>
    </div>
  )
}
