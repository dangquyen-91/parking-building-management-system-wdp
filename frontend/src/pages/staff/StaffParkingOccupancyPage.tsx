import { RefreshCw, RotateCcw } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import {
  StaffPageHeader,
  StaffParkingOccupancyList,
} from '../../components/staff'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Label } from '../../components/ui/label'
import { NativeSelect } from '../../components/ui/native-select'
import { useStaffParkingOccupancy } from '../../hooks/useStaffParkingOccupancy'
import { getFloorSection } from '../../utils/floorLabel'

type VehicleFilter = 'all' | 'motorcycle' | 'car'
type FloorTypeFilter = 'all' | 'resident' | 'visitor'
type AvailabilityFilter = 'all' | 'available' | 'full'

export function StaffParkingOccupancyPage() {
  const { occupancyItems, isLoading, error, reload } = useStaffParkingOccupancy()
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
          <Button type="button" variant="outline" onClick={() => void reload()} disabled={isLoading}>
            <RefreshCw className="size-4" />
            {isLoading ? 'Đang cập nhật...' : 'Làm mới sức chứa'}
          </Button>
        }
      />

      <section className="mb-6 grid gap-3 md:grid-cols-3">
        <SummaryCard label="Tổng chỗ" value={totals.total} />
        <SummaryCard label="Đang chiếm" value={totals.occupied} />
        <SummaryCard label="Còn trống" value={totals.available} />
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

      <StaffParkingOccupancyList items={filteredItems} isLoading={isLoading} error={error} />
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
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
    <Card className="mb-6">
      <CardHeader className="gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <CardDescription>Bộ lọc sức chứa</CardDescription>
          <CardTitle>{visibleCount}/{totalCount} khu phù hợp</CardTitle>
        </div>
        <Button type="button" variant="outline" onClick={onClear}>
          <RotateCcw className="size-4" />
          Xóa lọc
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
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
      </CardContent>
    </Card>
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
    <Label className="grid gap-2 text-xs text-muted-foreground">
      {label}
      <NativeSelect value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </NativeSelect>
    </Label>
  )
}
