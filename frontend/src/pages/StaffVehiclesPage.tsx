import { useNavigate } from 'react-router-dom'
import {
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
    <div className="mx-auto max-w-[1500px] p-4 md:p-8 lg:p-10">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-subtle">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
            Theo dõi thời gian thực
          </div>
          <h1 className="text-3xl font-black tracking-tight text-fg md:text-4xl">Xe đang gửi trong bãi</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Kiểm tra vị trí, thời gian lưu bãi và chuyển nhanh sang quy trình xe ra.
          </p>
        </div>

          <button
            type="button"
            onClick={() => void reload()}
            disabled={isLoading}
            className="h-12 rounded-xl border border-theme bg-badge px-5 text-sm font-bold text-fg shadow-sm transition-colors hover:bg-ghost disabled:opacity-60"
          >
            {isLoading ? 'Đang cập nhật...' : 'Làm mới danh sách'}
          </button>
      </div>

      <StaffVehicleStats stats={stats} isLoading={isLoading} />

      <section className="liquid-glass-card overflow-hidden rounded-2xl">
        <div className="border-b border-theme bg-gradient-to-r from-sky-500/10 via-transparent to-transparent p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-subtle">Danh sách phương tiện</p>
              <h2 className="mt-1 text-lg font-bold text-fg">
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
