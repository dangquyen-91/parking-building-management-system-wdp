import { Building2, CarFront, CircleParking, RefreshCw, RotateCcw } from 'lucide-react'
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
    <div className="mx-auto max-w-375 p-4 md:p-8 lg:p-10">
      <StaffPageHeader
        eyebrow="Sức chứa bãi xe"
        title="Điều phối sức chứa"
        description="Theo dõi công suất theo từng tòa nhà, tầng và khu để hướng dẫn phương tiện vào đúng nơi còn chỗ."
        icon={<Building2 className="size-7" />}
        tone="emerald"
        actions={
          <Button type="button" variant="outline" className="bg-background/80 shadow-sm" onClick={() => void reload()} disabled={isLoading}>
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Đang cập nhật...' : 'Làm mới sức chứa'}
          </Button>
        }
      />

      <section className="mb-6 grid gap-3 md:grid-cols-3">
        <SummaryCard label="Tổng sức chứa" value={totals.total} detail="Tất cả vị trí trong bộ lọc" tone="sky" icon={<CircleParking className="size-5" />} />
        <SummaryCard label="Đang sử dụng" value={totals.occupied} detail={`${totals.total > 0 ? Math.round((totals.occupied / totals.total) * 100) : 0}% công suất`} tone="amber" icon={<CarFront className="size-5" />} />
        <SummaryCard label="Còn có thể nhận" value={totals.available} detail={totals.available > 0 ? 'Sẵn sàng tiếp nhận xe' : 'Các khu phù hợp đã đầy'} tone="emerald" icon={<CircleParking className="size-5" />} />
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

const SUMMARY_TONES = {
  sky: 'border-sky-500/20 from-sky-500/15 to-cyan-500/5 text-sky-700 dark:text-sky-300',
  amber: 'border-amber-500/20 from-amber-500/15 to-orange-500/5 text-amber-700 dark:text-amber-300',
  emerald: 'border-emerald-500/20 from-emerald-500/15 to-teal-500/5 text-emerald-700 dark:text-emerald-300',
}

function SummaryCard({
  label,
  value,
  detail,
  tone,
  icon,
}: {
  label: string
  value: number
  detail: string
  tone: keyof typeof SUMMARY_TONES
  icon: ReactNode
}) {
  return (
    <Card className={`relative overflow-hidden bg-linear-to-br shadow-sm ${SUMMARY_TONES[tone]}`}>
      <div className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-current/5" />
      <CardHeader className="relative flex-row items-center justify-between gap-4">
        <div>
          <CardDescription className="font-semibold text-current/75">{label}</CardDescription>
          <CardTitle className="mt-1 text-3xl text-foreground">{value}</CardTitle>
          <p className="mt-1 text-xs font-medium text-current/75">{detail}</p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-current/15 bg-background/70 shadow-sm">
          {icon}
        </span>
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
  onBuildingFilterChange,
  onFloorFilterChange,
  onSectionFilterChange,
  onVehicleFilterChange,
  onFloorTypeFilterChange,
  onAvailabilityFilterChange,
  onClear,
}: OccupancyFiltersProps) {
  return (
    <Card className="mb-6 gap-0 overflow-hidden border-sky-500/15 bg-linear-to-r from-card via-card to-sky-500/5 py-0 shadow-sm">
      <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[repeat(6,minmax(0,1fr))_auto]">
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
        <Button type="button" variant="outline" className="h-11 self-end md:col-span-2 xl:col-span-1" onClick={onClear}>
          <RotateCcw className="size-4" />
          Xóa lọc
        </Button>
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
    <Label className="grid gap-2 text-xs font-semibold text-muted-foreground">
      {label}
      <NativeSelect
        className="w-full bg-transparent font-medium text-foreground [&_[data-slot=native-select]]:h-11 [&_[data-slot=native-select]]:bg-background/85"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </NativeSelect>
    </Label>
  )
}
