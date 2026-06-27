import { useNavigate } from 'react-router-dom'
import {
  StaffPageHeader,
  StaffVehicleFilters,
  StaffVehicleList,
  StaffVehicleStats,
} from '../../components/staff'
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
          <button
            type="button"
            onClick={() => void reload()}
            disabled={isLoading}
            className="h-12 rounded-2xl border border-theme bg-page px-5 text-sm font-black text-fg shadow-sm transition-colors hover:bg-ghost disabled:opacity-60"
          >
            {isLoading ? 'Đang cập nhật...' : 'Làm mới danh sách'}
          </button>
        }
      />

      <StaffVehicleStats stats={stats} isLoading={isLoading} />

      <section className="overflow-hidden rounded-[1.75rem] border border-theme bg-badge shadow-sm">
        <div className="border-b border-theme bg-gradient-to-r from-sky-500/10 via-transparent to-transparent p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-subtle">Danh sách phương tiện</p>
              <h2 className="mt-1 text-xl font-black text-fg">
                {isLoading ? 'Đang tải...' : `${filteredSessions.length} xe phù hợp`}
              </h2>
            </div>
          </div>
          <StaffVehicleFilters
            query={query}
            vehicleFilter={vehicleFilter}
            customerFilter={customerFilter}
            onQueryChange={setQuery}
            onVehicleFilterChange={setVehicleFilter}
            onCustomerFilterChange={setCustomerFilter}
          />
        </div>

        <div className="p-4 md:p-5">
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
