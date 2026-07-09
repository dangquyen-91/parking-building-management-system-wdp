import { useMemo, useState, type ReactNode } from 'react'
import {
  StaffPageHeader,
  StaffParkingOccupancyList,
} from '../../components/staff'
import { useStaffParkingOccupancy } from '../../hooks/useStaffParkingOccupancy'
import { getFloorSection } from '../../utils/floorLabel'

type VehicleFilter = 'all' | 'motorcycle' | 'car'
type FloorTypeFilter = 'all' | 'resident' | 'visitor'
type AvailabilityFilter = 'all' | 'available' | 'full'

export function StaffParkingOccupancyPage() {
  const {
    occupancyItems,
    isLoading,
    error,
    reload,
  } = useStaffParkingOccupancy()
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [floorFilter, setFloorFilter] = useState('all')
  const [sectionFilter, setSectionFilter] = useState('all')
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>('all')
  const [floorTypeFilter, setFloorTypeFilter] = useState<FloorTypeFilter>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all')

  const buildingOptions = useMemo(
    () => Array.from(new Set(occupancyItems.map((item) => item.buildingName))).sort((a, b) => a.localeCompare(b)),
    [occupancyItems],
  )

  const floorOptions = useMemo(
    () => Array.from(new Set(
      occupancyItems
        .filter((item) => buildingFilter === 'all' || item.buildingName === buildingFilter)
        .map((item) => item.floorNumber),
    )).sort((a, b) => a - b),
    [buildingFilter, occupancyItems],
  )

  const sectionOptions = useMemo(
    () => Array.from(new Set(
      occupancyItems
        .filter((item) => buildingFilter === 'all' || item.buildingName === buildingFilter)
        .filter((item) => floorFilter === 'all' || item.floorNumber === Number(floorFilter))
        .map((item) => getFloorSection(item.section)),
    )).sort((a, b) => a.localeCompare(b)),
    [buildingFilter, floorFilter, occupancyItems],
  )

  const filteredItems = useMemo(
    () => occupancyItems.filter((item) => {
      if (buildingFilter !== 'all' && item.buildingName !== buildingFilter) return false
      if (floorFilter !== 'all' && item.floorNumber !== Number(floorFilter)) return false
      if (sectionFilter !== 'all' && getFloorSection(item.section) !== sectionFilter) return false
      if (vehicleFilter !== 'all' && item.vehicleType !== vehicleFilter) return false
      if (floorTypeFilter !== 'all' && item.floorType !== floorTypeFilter) return false
      if (availabilityFilter === 'available' && item.available <= 0) return false
      if (availabilityFilter === 'full' && item.available > 0) return false
      return true
    }),
    [availabilityFilter, buildingFilter, floorFilter, floorTypeFilter, occupancyItems, sectionFilter, vehicleFilter],
  )

  const totals = useMemo(
    () => ({
      total: filteredItems.reduce((sum, item) => sum + item.total, 0),
      occupied: filteredItems.reduce((sum, item) => sum + item.occupied, 0),
      available: filteredItems.reduce((sum, item) => sum + item.available, 0),
    }),
    [filteredItems],
  )

  function clearFilters() {
    setBuildingFilter('all')
    setFloorFilter('all')
    setSectionFilter('all')
    setVehicleFilter('all')
    setFloorTypeFilter('all')
    setAvailabilityFilter('all')
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-8 lg:p-10">
      <StaffPageHeader
        eyebrow="Sức chứa bãi xe"
        title="Tòa nhà, tầng và khu"
        description="Xem nhanh từng khu còn bao nhiêu chỗ, đang chiếm bao nhiêu chỗ để điều phối xe vào/ra rõ ràng hơn."
        actions={
          <button
            type="button"
            onClick={() => void reload()}
            disabled={isLoading}
            className="h-12 rounded-2xl border border-theme bg-page px-5 text-sm font-black text-fg shadow-sm transition-colors hover:bg-ghost disabled:opacity-60"
          >
            {isLoading ? 'Đang cập nhật...' : 'Làm mới sức chứa'}
          </button>
        }
      />

      <section className="mb-6 grid gap-3 md:grid-cols-3">
        <SummaryCard label="Tổng chỗ" value={totals.total} tone="sky" />
        <SummaryCard label="Đang chiếm" value={totals.occupied} tone="amber" />
        <SummaryCard label="Còn trống" value={totals.available} tone="emerald" />
      </section>

      <OccupancyFilters
        buildingOptions={buildingOptions}
        floorOptions={floorOptions}
        sectionOptions={sectionOptions}
        buildingFilter={buildingFilter}
        floorFilter={floorFilter}
        sectionFilter={sectionFilter}
        vehicleFilter={vehicleFilter}
        floorTypeFilter={floorTypeFilter}
        availabilityFilter={availabilityFilter}
        visibleCount={filteredItems.length}
        totalCount={occupancyItems.length}
        onBuildingFilterChange={(value) => {
          setBuildingFilter(value)
          setFloorFilter('all')
          setSectionFilter('all')
        }}
        onFloorFilterChange={(value) => {
          setFloorFilter(value)
          setSectionFilter('all')
        }}
        onSectionFilterChange={setSectionFilter}
        onVehicleFilterChange={setVehicleFilter}
        onFloorTypeFilterChange={setFloorTypeFilter}
        onAvailabilityFilterChange={setAvailabilityFilter}
        onClear={clearFilters}
      />

      <StaffParkingOccupancyList
        items={filteredItems}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: 'sky' | 'amber' | 'emerald' }) {
  const toneClass = {
    sky: 'bg-sky-500/15',
    amber: 'bg-amber-500/15',
    emerald: 'bg-emerald-500/15',
  }[tone]

  return (
    <div className="relative overflow-hidden rounded-3xl border border-theme bg-badge p-5 shadow-sm">
      <div className={`pointer-events-none absolute -right-10 -top-10 size-28 rounded-full ${toneClass} blur-2xl`} />
      <p className="relative text-[10px] font-black uppercase tracking-[0.18em] text-subtle">{label}</p>
      <p className="relative mt-2 text-4xl font-black text-fg">{value}</p>
    </div>
  )
}

type OccupancyFiltersProps = {
  buildingOptions: string[]
  floorOptions: number[]
  sectionOptions: string[]
  buildingFilter: string
  floorFilter: string
  sectionFilter: string
  vehicleFilter: VehicleFilter
  floorTypeFilter: FloorTypeFilter
  availabilityFilter: AvailabilityFilter
  visibleCount: number
  totalCount: number
  onBuildingFilterChange: (value: string) => void
  onFloorFilterChange: (value: string) => void
  onSectionFilterChange: (value: string) => void
  onVehicleFilterChange: (value: VehicleFilter) => void
  onFloorTypeFilterChange: (value: FloorTypeFilter) => void
  onAvailabilityFilterChange: (value: AvailabilityFilter) => void
  onClear: () => void
}

const selectClass =
  'h-11 w-full rounded-xl border border-theme bg-page px-3 text-sm font-bold text-fg outline-none transition focus:border-btn-primary'

function OccupancyFilters({
  buildingOptions,
  floorOptions,
  sectionOptions,
  buildingFilter,
  floorFilter,
  sectionFilter,
  vehicleFilter,
  floorTypeFilter,
  availabilityFilter,
  visibleCount,
  totalCount,
  onBuildingFilterChange,
  onFloorFilterChange,
  onSectionFilterChange,
  onVehicleFilterChange,
  onFloorTypeFilterChange,
  onAvailabilityFilterChange,
  onClear,
}: OccupancyFiltersProps) {
  return (
    <section className="mb-6 overflow-hidden rounded-[1.75rem] border border-theme bg-badge shadow-sm">
      <div className="border-b border-theme bg-gradient-to-r from-sky-500/10 via-transparent to-emerald-500/10 p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-subtle">Bộ lọc sức chứa</p>
            <h2 className="mt-1 text-xl font-black text-fg">{visibleCount}/{totalCount} khu phù hợp</h2>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="h-10 rounded-xl border border-theme bg-page px-4 text-sm font-bold text-fg transition hover:bg-ghost"
          >
            Xóa lọc
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-6">
        <FilterSelect label="Tòa nhà" value={buildingFilter} onChange={onBuildingFilterChange}>
          <option value="all">Tất cả tòa nhà</option>
          {buildingOptions.map((building) => (
            <option key={building} value={building}>{building}</option>
          ))}
        </FilterSelect>

        <FilterSelect label="Tầng" value={floorFilter} onChange={onFloorFilterChange}>
          <option value="all">Tất cả tầng</option>
          {floorOptions.map((floor) => (
            <option key={floor} value={String(floor)}>Tầng {floor}</option>
          ))}
        </FilterSelect>

        <FilterSelect label="Khu" value={sectionFilter} onChange={onSectionFilterChange}>
          <option value="all">Tất cả khu</option>
          {sectionOptions.map((section) => (
            <option key={section} value={section}>Khu {section}</option>
          ))}
        </FilterSelect>

        <FilterSelect label="Loại xe" value={vehicleFilter} onChange={(value) => onVehicleFilterChange(value as VehicleFilter)}>
          <option value="all">Tất cả</option>
          <option value="motorcycle">Xe máy</option>
          <option value="car">Ô tô</option>
        </FilterSelect>

        <FilterSelect label="Loại khu" value={floorTypeFilter} onChange={(value) => onFloorTypeFilterChange(value as FloorTypeFilter)}>
          <option value="all">Tất cả</option>
          <option value="resident">Cư dân</option>
          <option value="visitor">Khách vãng lai</option>
        </FilterSelect>

        <FilterSelect label="Trạng thái" value={availabilityFilter} onChange={(value) => onAvailabilityFilterChange(value as AvailabilityFilter)}>
          <option value="all">Tất cả</option>
          <option value="available">Còn chỗ</option>
          <option value="full">Đã đầy</option>
        </FilterSelect>
      </div>
    </section>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <label className="grid gap-1.5 text-xs font-black text-subtle">
      {label}
      <select className={selectClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  )
}
