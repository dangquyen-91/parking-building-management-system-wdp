import { useNavigate } from 'react-router-dom'
import {
  StaffPageHeader,
  StaffVehicleFilters,
  StaffVehicleList,
  StaffVehicleStats,
} from '../components/staff'
import { useStaffVehicles } from '../hooks/useStaffVehicles'
import type { GateSession } from '../services/staffGateApi'

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
    navigate(`/staff?checkout=${encodeURIComponent(session.licensePlate)}`)
  }

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <StaffPageHeader
        eyebrow="Nhân viên // Trong bãi"
        title="Xe đang gửi"
        description="Theo dõi xe đang ở trong bãi và chuyển nhanh sang xử lý xe ra."
        actions={
          <button
            type="button"
            onClick={() => void reload()}
            disabled={isLoading}
            className="h-11 rounded-lg border border-theme bg-badge px-4 text-sm font-semibold text-fg hover:bg-ghost disabled:opacity-60"
          >
            {isLoading ? 'Đang tải...' : 'Làm mới'}
          </button>
        }
      />

      <StaffVehicleStats stats={stats} isLoading={isLoading} />

      <section className="liquid-glass-card rounded-lg p-4 md:p-5">
        <StaffVehicleFilters
          query={query}
          vehicleFilter={vehicleFilter}
          customerFilter={customerFilter}
          onQueryChange={setQuery}
          onVehicleFilterChange={setVehicleFilter}
          onCustomerFilterChange={setCustomerFilter}
        />

        <div className="mt-5 border-t border-theme pt-5">
          <StaffVehicleList
            sessions={filteredSessions}
            floorMap={floorMap}
            isLoading={isLoading}
            error={error}
            onCheckout={handleCheckout}
          />
        </div>
      </section>
    </div>
  )
}
