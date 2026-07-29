import {
  Bike,
  Building2,
  CarFront,
  ChevronDown,
  Layers3,
  Search,
} from 'lucide-react'
import { useState } from 'react'
import type { StaffParkingOccupancyItem } from '../../../hooks/useStaffParkingOccupancy'
import { getFloorSection } from '../../../utils/floorLabel'
import { Alert, AlertDescription } from '../../ui/alert'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card'
import { Progress } from '../../ui/progress'
import { Skeleton } from '../../ui/skeleton'
import { formatVehicleType } from '../data/staffGateUtils'

const FLOOR_TYPE_LABELS: Record<string, string> = {
  resident: 'Cư dân',
  visitor: 'Khách vãng lai',
}

type CapacityTone = 'available' | 'busy' | 'warning' | 'full' | 'maintenance'

const CAPACITY_UI: Record<
  CapacityTone,
  {
    panel: string
    icon: string
    badge: string
    text: string
    progress: string
    dot: string
  }
> = {
  available: {
    panel: 'border-emerald-200/80 bg-card dark:border-emerald-900/70',
    icon: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
    badge:
      'border-emerald-300/70 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200',
    text: 'text-emerald-700 dark:text-emerald-300',
    progress: '[&_[data-slot=progress-indicator]]:bg-emerald-500',
    dot: 'bg-emerald-500',
  },
  busy: {
    panel: 'border-sky-300/80 bg-card dark:border-sky-900/70',
    icon: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
    badge:
      'border-sky-300/70 bg-sky-100 text-sky-800 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-200',
    text: 'text-sky-700 dark:text-sky-300',
    progress: '[&_[data-slot=progress-indicator]]:bg-sky-500',
    dot: 'bg-sky-500',
  },
  warning: {
    panel:
      'border-amber-300/90 bg-amber-50/35 dark:border-amber-800 dark:bg-amber-950/15',
    icon: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
    badge:
      'border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200',
    text: 'text-amber-800 dark:text-amber-300',
    progress: '[&_[data-slot=progress-indicator]]:bg-amber-500',
    dot: 'bg-amber-500',
  },
  full: {
    panel:
      'border-rose-300/90 bg-rose-50/40 dark:border-rose-800 dark:bg-rose-950/15',
    icon: 'bg-rose-500/15 text-rose-800 dark:text-rose-300',
    badge:
      'border-rose-300 bg-rose-100 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200',
    text: 'text-rose-800 dark:text-rose-300',
    progress: '[&_[data-slot=progress-indicator]]:bg-rose-500',
    dot: 'bg-rose-500',
  },
  maintenance: {
    panel: 'border-slate-300 bg-muted/30 dark:border-slate-700',
    icon: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
    badge:
      'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
    text: 'text-slate-700 dark:text-slate-300',
    progress: '[&_[data-slot=progress-indicator]]:bg-slate-500',
    dot: 'bg-slate-500',
  },
}

type ResidentSlotStatus =
  StaffParkingOccupancyItem['slotDetails'][number]['status']

const SLOT_UI: Record<
  ResidentSlotStatus,
  { card: string; badge: string; dot: string; label: string }
> = {
  empty: {
    card: 'border-t-4 border-emerald-500 bg-card',
    badge:
      'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Trống',
  },
  occupied: {
    card: 'border-t-4 border-sky-500 bg-card',
    badge:
      'border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-200',
    dot: 'bg-sky-500',
    label: 'Đang đỗ',
  },
  reserved: {
    card: 'border-t-4 border-amber-500 bg-card',
    badge:
      'border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200',
    dot: 'bg-amber-500',
    label: 'Đã giữ',
  },
  maintenance: {
    card: 'border-t-4 border-rose-500 bg-card',
    badge:
      'border-rose-300 bg-rose-100 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200',
    dot: 'bg-rose-500',
    label: 'Bảo trì',
  },
}

type StaffParkingOccupancyListProps = {
  items: StaffParkingOccupancyItem[]
  isLoading: boolean
  error: string | null
}

export function StaffParkingOccupancyList({
  items,
  isLoading,
  error,
}: StaffParkingOccupancyListProps) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) return <Skeleton className="h-64 rounded-2xl" />

  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Search className="size-5" />
          </span>
          <CardTitle>Chưa có dữ liệu sức chứa</CardTitle>
          <CardDescription>
            Khi tòa nhà, tầng và khu đã được tạo, dữ liệu sẽ hiện ở đây.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <section className="grid gap-5">
      {groupByBuilding(items).map((building) => (
        <BuildingOccupancyCard key={building.name} building={building} />
      ))}
    </section>
  )
}

type BuildingGroup = {
  name: string
  total: number
  occupied: number
  available: number
  floors: Array<{
    floorNumber: number
    total: number
    occupied: number
    available: number
    sections: StaffParkingOccupancyItem[]
  }>
}

function groupByBuilding(items: StaffParkingOccupancyItem[]): BuildingGroup[] {
  const buildingMap = new Map<string, BuildingGroup>()

  items.forEach((item) => {
    const building = buildingMap.get(item.buildingName) ?? {
      name: item.buildingName,
      total: 0,
      occupied: 0,
      available: 0,
      floors: [],
    }

    building.total += item.total
    building.occupied += item.occupied
    building.available += item.available

    let floor = building.floors.find(
      (entry) => entry.floorNumber === item.floorNumber,
    )
    if (!floor) {
      floor = {
        floorNumber: item.floorNumber,
        total: 0,
        occupied: 0,
        available: 0,
        sections: [],
      }
      building.floors.push(floor)
    }

    floor.total += item.total
    floor.occupied += item.occupied
    floor.available += item.available
    floor.sections.push(item)
    buildingMap.set(item.buildingName, building)
  })

  return Array.from(buildingMap.values()).map((building) => ({
    ...building,
    floors: building.floors
      .map((floor) => ({
        ...floor,
        sections: floor.sections.sort(
          (a, b) =>
            getFloorSection(a.section).localeCompare(
              getFloorSection(b.section),
            ) || a.vehicleType.localeCompare(b.vehicleType),
        ),
      }))
      .sort((a, b) => a.floorNumber - b.floorNumber),
  }))
}

function BuildingOccupancyCard({ building }: { building: BuildingGroup }) {
  const percent = calculatePercent(building.occupied, building.total)
  const tone = getCapacityTone(percent)
  const ui = CAPACITY_UI[tone]

  return (
    <Card className="gap-0 overflow-hidden border-sky-200/70 py-0 shadow-lg shadow-slate-950/5 dark:border-sky-900/60">
      <CardHeader className="relative overflow-hidden border-b bg-gradient-to-r from-sky-100/90 via-background to-emerald-100/70 p-5 dark:from-sky-950/40 dark:to-emerald-950/30 md:p-6">
        <div className="pointer-events-none absolute -right-12 -top-20 size-52 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-lg shadow-sky-500/25">
              <Building2 className="size-6" />
            </span>
            <div>
              <CardDescription className="font-bold uppercase tracking-[0.16em]">
                Tòa nhà
              </CardDescription>
              <CardTitle className="mt-1 text-2xl md:text-3xl">
                {building.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {building.floors.length} tầng · {building.total} chỗ đỗ
              </CardDescription>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[24rem]">
            <BuildingMetric label="Tổng" value={building.total} tone="sky" />
            <BuildingMetric
              label="Đang chiếm"
              value={building.occupied}
              tone="violet"
            />
            <BuildingMetric
              label="Còn trống"
              value={building.available}
              tone="emerald"
            />
          </div>
        </div>

        <div className="relative mt-5 rounded-xl border border-white/60 bg-background/65 p-3 shadow-sm backdrop-blur dark:border-white/10">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold">
            <span className="text-muted-foreground">
              Công suất toàn tòa nhà
            </span>
            <span className={`flex items-center gap-2 ${ui.text}`}>
              <span className={`size-2 rounded-full ${ui.dot}`} />
              {formatCapacityStatus(tone)} · {formatPercent(percent)}
            </span>
          </div>
          <Progress
            value={percent}
            className={`h-2.5 bg-muted/80 ${ui.progress}`}
          />
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 bg-muted/20 p-4 md:p-5">
        {building.floors.map((floor) => (
          <FloorOccupancyCard key={floor.floorNumber} floor={floor} />
        ))}
      </CardContent>
    </Card>
  )
}

function FloorOccupancyCard({
  floor,
}: {
  floor: BuildingGroup['floors'][number]
}) {
  const percent = calculatePercent(floor.occupied, floor.total)
  const tone = getCapacityTone(percent)
  const ui = CAPACITY_UI[tone]

  return (
    <Card className={`gap-0 overflow-hidden py-0 shadow-sm ${ui.panel}`}>
      <CardHeader className="border-b border-border/70 bg-background/80 p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${ui.icon}`}
            >
              <Layers3 className="size-5" />
            </span>
            <div>
              <CardTitle className="text-xl">
                Tầng {floor.floorNumber}
              </CardTitle>
              <CardDescription className="mt-1">
                {floor.sections.length} khu đang được theo dõi
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <MiniMetric label="Tổng" value={floor.total} />
            <MiniMetric label="Đang chiếm" value={floor.occupied} />
            <MiniMetric label="Còn trống" value={floor.available} emphasis />
            <Badge variant="outline" className={`h-9 px-3 ${ui.badge}`}>
              <span className={`size-2 rounded-full ${ui.dot}`} />
              {formatCapacityStatus(tone)} · {formatPercent(percent)}
            </Badge>
          </div>
        </div>
        <Progress
          value={percent}
          className={`mt-4 h-2 bg-muted ${ui.progress}`}
        />
      </CardHeader>

      <CardContent className="grid gap-3 p-4 xl:grid-cols-2">
        {floor.sections.map((section) => (
          <SectionCard key={section.key} item={section} />
        ))}
      </CardContent>
    </Card>
  )
}

function SectionCard({ item }: { item: StaffParkingOccupancyItem }) {
  const [isOpen, setIsOpen] = useState(false)
  const hasDetails = item.slotDetails.length > 0 || item.rowDetails.length > 0
  const percent = Math.min(100, item.utilizationPercent)
  const tone = getCapacityTone(percent)
  const ui = CAPACITY_UI[tone]
  const VehicleIcon = item.vehicleType === 'car' ? CarFront : Bike

  return (
    <div
      className={`overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md ${ui.panel}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${ui.icon}`}
            >
              <VehicleIcon className="size-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-bold text-foreground">
                  Khu {getFloorSection(item.section)}
                </h4>
                <Badge variant="secondary">
                  {formatVehicleType(item.vehicleType)}
                </Badge>
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {item.floorType
                  ? (FLOOR_TYPE_LABELS[item.floorType] ?? item.floorType)
                  : 'Khu đỗ xe'}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={ui.badge}>
            <span className={`size-1.5 rounded-full ${ui.dot}`} />
            {formatCapacityStatus(tone)}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <SectionMetric label="Tổng" value={item.total} />
          <SectionMetric label="Đang chiếm" value={item.occupied} />
          <SectionMetric
            label="Còn trống"
            value={item.available}
            tone={ui.text}
          />
        </div>

        {item.reserved > 0 ? (
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            Trong đó {item.reserved} chỗ đã đặt trước (đã thanh toán), khách chưa vào bãi
          </p>
        ) : null}

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Mức sử dụng</span>
            <span className={ui.text}>
              {item.occupied}/{item.total} · {formatPercent(percent)}
            </span>
          </div>
          <Progress value={percent} className={`h-2 bg-muted ${ui.progress}`} />
        </div>

        {hasDetails ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 w-full justify-between bg-background/80"
            onClick={() => setIsOpen((current) => !current)}
          >
            {item.vehicleType === 'car'
              ? 'Xem trạng thái ô đỗ'
              : 'Xem sức chứa từng hàng'}
            <ChevronDown
              className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </Button>
        ) : (
          <div className="mt-4 rounded-lg bg-muted/55 px-3 py-2 text-center text-xs font-medium text-muted-foreground">
            Phương tiện được phân bổ tự động theo tầng
          </div>
        )}
      </div>

      {isOpen && hasDetails && (
        <div className="border-t border-border/70 bg-muted/25 p-4">
          {item.slotDetails.length > 0 ? (
            <ResidentSlotDetails slots={item.slotDetails} />
          ) : (
            <MotorcycleRowDetails rows={item.rowDetails} />
          )}
        </div>
      )}
    </div>
  )
}

function ResidentSlotDetails({
  slots,
}: {
  slots: StaffParkingOccupancyItem['slotDetails']
}) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Trạng thái ô đỗ
        </p>
        <div
          className="flex flex-wrap gap-1.5"
          aria-label="Chú thích trạng thái ô đỗ"
        >
          {(Object.keys(SLOT_UI) as ResidentSlotStatus[]).map((status) => (
            <Badge
              key={status}
              variant="outline"
              className={SLOT_UI[status].badge}
            >
              <span
                className={`size-1.5 rounded-full ${SLOT_UI[status].dot}`}
              />
              {SLOT_UI[status].label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {slots.map((slot) => {
          const statusUi = SLOT_UI[slot.status]
          return (
            <div
              key={slot.id}
              className={`rounded-xl border p-3 shadow-sm ${statusUi.card}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-foreground">{slot.code}</span>
                <Badge variant="outline" className={statusUi.badge}>
                  {statusUi.label}
                </Badge>
              </div>
              <p className="mt-2 min-h-8 break-words text-xs leading-5 text-muted-foreground">
                {slot.licensePlate ?? 'Chưa có xe trong ô'}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MotorcycleRowDetails({
  rows,
}: {
  rows: StaffParkingOccupancyItem['rowDetails']
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Sức chứa từng hàng xe máy
      </p>
      <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
        {rows.map((row) => {
          const available = Math.max(0, row.capacity - row.occupied)
          const percent = calculatePercent(row.occupied, row.capacity)
          const tone =
            row.status === 'maintenance'
              ? 'maintenance'
              : getCapacityTone(percent)
          const ui = CAPACITY_UI[tone]

          return (
            <div
              key={row.id}
              className={`rounded-xl border p-3 shadow-sm ${ui.panel}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-foreground">
                  Hàng {row.code}
                </span>
                <Badge variant="outline" className={ui.badge}>
                  {formatCapacityStatus(tone, available)}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-medium">
                <span className="text-muted-foreground">
                  Đang dùng {row.occupied}/{row.capacity}
                </span>
                <span className={ui.text}>{formatPercent(percent)}</span>
              </div>
              <Progress
                value={percent}
                className={`mt-2 h-2 bg-muted ${ui.progress}`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BuildingMetric({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'sky' | 'violet' | 'emerald'
}) {
  const tones = {
    sky: 'border-sky-200 bg-sky-50/90 text-sky-800 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-200',
    violet:
      'border-violet-200 bg-violet-50/90 text-violet-800 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-200',
    emerald:
      'border-emerald-200 bg-emerald-50/90 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200',
  }

  return (
    <div
      className={`rounded-xl border px-3 py-2 text-center shadow-sm ${tones[tone]}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-75">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-black">{value}</p>
    </div>
  )
}

function MiniMetric({
  label,
  value,
  emphasis = false,
}: {
  label: string
  value: number
  emphasis?: boolean
}) {
  return (
    <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5">
      <span className="text-[10px] font-semibold uppercase text-muted-foreground">
        {label}{' '}
      </span>
      <strong
        className={
          emphasis
            ? 'text-emerald-700 dark:text-emerald-300'
            : 'text-foreground'
        }
      >
        {value}
      </strong>
    </div>
  )
}

function SectionMetric({
  label,
  value,
  tone = 'text-foreground',
}: {
  label: string
  value: number
  tone?: string
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/25 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-lg font-black ${tone}`}>{value}</p>
    </div>
  )
}

function calculatePercent(occupied: number, total: number) {
  return total > 0
    ? Math.min(100, Math.round((occupied / total) * 1000) / 10)
    : 0
}

function formatPercent(percent: number) {
  return `${percent.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`
}

function getCapacityTone(
  percent: number,
): Exclude<CapacityTone, 'maintenance'> {
  if (percent >= 100) return 'full'
  if (percent >= 80) return 'warning'
  if (percent >= 60) return 'busy'
  return 'available'
}

function formatCapacityStatus(tone: CapacityTone, available?: number) {
  if (tone === 'maintenance') return 'Bảo trì'
  if (tone === 'full') return 'Đã đầy'
  if (tone === 'warning')
    return available === undefined ? 'Sắp đầy' : `Sắp đầy · còn ${available}`
  if (tone === 'busy')
    return available === undefined
      ? 'Đang đông'
      : `Đang đông · còn ${available}`
  return available === undefined ? 'Còn nhiều chỗ' : `Còn ${available}`
}
