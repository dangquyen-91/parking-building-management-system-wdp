import { ChevronDown, Search } from 'lucide-react'
import { Fragment, useState } from 'react'
import type { StaffParkingOccupancyItem } from '../../../hooks/useStaffParkingOccupancy'
import { getFloorSection } from '../../../utils/floorLabel'
import { Alert, AlertDescription } from '../../ui/alert'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Progress } from '../../ui/progress'
import { Skeleton } from '../../ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import { formatVehicleType } from '../data/staffGateUtils'

const FLOOR_TYPE_LABELS: Record<string, string> = {
  resident: 'Cư dân',
  visitor: 'Khách vãng lai',
}

type ResidentSlotStatus = StaffParkingOccupancyItem['slotDetails'][number]['status']

const SLOT_CARD_TONES: Record<ResidentSlotStatus, string> = {
  empty: 'border-emerald-500/30 bg-emerald-500/10',
  occupied: 'border-sky-500/30 bg-sky-500/10',
  reserved: 'border-amber-500/35 bg-amber-500/10',
  maintenance: 'border-rose-500/30 bg-rose-500/10',
}

const SLOT_BADGE_TONES: Record<ResidentSlotStatus, string> = {
  empty: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200',
  occupied: 'border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-200',
  reserved: 'border-amber-500/35 bg-amber-500/15 text-amber-700 dark:text-amber-200',
  maintenance: 'border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-200',
}

const SLOT_STATUS_LABELS: Record<ResidentSlotStatus, string> = {
  empty: 'Trống',
  occupied: 'Đang đỗ',
  reserved: 'Đã giữ',
  maintenance: 'Bảo trì',
}

const SLOT_DOT_TONES: Record<ResidentSlotStatus, string> = {
  empty: 'bg-emerald-500',
  occupied: 'bg-sky-500',
  reserved: 'bg-amber-500',
  maintenance: 'bg-rose-500',
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

  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />
  }

  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
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

  const buildings = groupByBuilding(items)

  return (
    <section className="grid gap-4">
      {buildings.map((building) => (
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

    let floor = building.floors.find((entry) => entry.floorNumber === item.floorNumber)
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
        sections: floor.sections.sort((a, b) =>
          getFloorSection(a.section).localeCompare(getFloorSection(b.section))
          || a.vehicleType.localeCompare(b.vehicleType),
        ),
      }))
      .sort((a, b) => a.floorNumber - b.floorNumber),
  }))
}

function BuildingOccupancyCard({ building }: { building: BuildingGroup }) {
  const percent = building.total > 0 ? Math.round((building.occupied / building.total) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardDescription>Tòa nhà</CardDescription>
            <CardTitle className="mt-2 text-2xl">{building.name}</CardTitle>
            <CardDescription>
              {building.floors.length} tầng · {building.total} chỗ · đang dùng {building.occupied}
            </CardDescription>
          </div>
          <div className="grid min-w-[18rem] grid-cols-3 gap-2">
            <Summary label="Tổng" value={building.total} />
            <Summary label="Chiếm" value={building.occupied} />
            <Summary label="Trống" value={building.available} />
          </div>
        </div>
        <Progress value={percent} className="mt-2" />
      </CardHeader>

      <CardContent className="grid gap-3">
        {building.floors.map((floor) => (
          <Card key={floor.floorNumber} size="sm">
            <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Tầng {floor.floorNumber}</CardTitle>
                <CardDescription>
                  {floor.sections.length} khu · {floor.available}/{floor.total} còn trống
                </CardDescription>
              </div>
              <Badge variant="secondary">Đang chiếm {floor.occupied}</Badge>
            </CardHeader>
            <CardContent>
              <Table className="min-w-[680px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Khu / Phân loại</TableHead>
                    <TableHead>Tổng</TableHead>
                    <TableHead>Đang chiếm</TableHead>
                    <TableHead>Còn trống</TableHead>
                    <TableHead>Sử dụng</TableHead>
                    <TableHead className="text-right">Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {floor.sections.map((section) => (
                    <SectionRow key={section.key} item={section} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}

function SectionRow({ item }: { item: StaffParkingOccupancyItem }) {
  const [isOpen, setIsOpen] = useState(false)
  const hasDetails = item.slotDetails.length > 0 || item.rowDetails.length > 0

  return (
    <Fragment>
      <TableRow>
        <TableCell className="whitespace-normal">
          <div className="flex min-w-[17rem] flex-wrap items-center gap-2">
            <Badge>Khu {getFloorSection(item.section)}</Badge>
            <Badge variant="secondary">{formatVehicleType(item.vehicleType)}</Badge>
            {item.floorType && (
              <Badge variant="outline">
                {FLOOR_TYPE_LABELS[item.floorType] ?? item.floorType}
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="font-semibold">{item.total}</TableCell>
        <TableCell className="font-semibold">{item.occupied}</TableCell>
        <TableCell className="font-semibold text-emerald-700 dark:text-emerald-300">{item.available}</TableCell>
        <TableCell>
          <div className="min-w-[9rem]">
            <div className="flex items-center justify-between gap-2 text-xs font-medium">
              <span>{item.occupied}/{item.total}</span>
              <span>{item.utilizationPercent}%</span>
            </div>
            <Progress value={Math.min(100, item.utilizationPercent)} className="mt-2" />
          </div>
        </TableCell>
        <TableCell className="text-right">
          {hasDetails ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen((current) => !current)}>
              {item.vehicleType === 'car' ? 'Xem ô đỗ' : 'Xem hàng'}
              <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">Theo bộ đếm tầng</span>
          )}
        </TableCell>
      </TableRow>

      {isOpen && hasDetails && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={6} className="p-4">
            {item.slotDetails.length > 0
              ? <ResidentSlotDetails slots={item.slotDetails} />
              : <MotorcycleRowDetails rows={item.rowDetails} />}
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  )
}

function ResidentSlotDetails({ slots }: { slots: StaffParkingOccupancyItem['slotDetails'] }) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Ô đỗ cư dân</p>
        <div className="flex flex-wrap gap-2" aria-label="Chú thích trạng thái ô đỗ">
          {(Object.keys(SLOT_STATUS_LABELS) as ResidentSlotStatus[]).map((status) => (
            <Badge key={status} variant="outline" className={SLOT_BADGE_TONES[status]}>
              <span className={`size-1.5 rounded-full ${SLOT_DOT_TONES[status]}`} />
              {SLOT_STATUS_LABELS[status]}
            </Badge>
          ))}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {slots.map((slot) => (
          <div key={slot.id} className={`rounded-lg border p-3 ${SLOT_CARD_TONES[slot.status]}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-foreground">{slot.code}</span>
              <Badge variant="outline" className={SLOT_BADGE_TONES[slot.status]}>
                {formatSlotStatus(slot.status)}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{slot.licensePlate ?? 'Chưa có xe trong ô'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MotorcycleRowDetails({ rows }: { rows: StaffParkingOccupancyItem['rowDetails'] }) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Sức chứa theo hàng xe máy</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => {
          const available = Math.max(0, row.capacity - row.occupied)
          const percent = row.capacity > 0 ? Math.min(100, Math.round((row.occupied / row.capacity) * 100)) : 0
          return (
            <div key={row.id} className="rounded-lg border bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-foreground">Hàng {row.code}</span>
                <Badge variant={available > 0 ? 'secondary' : 'destructive'}>
                  {row.status === 'maintenance' ? 'Bảo trì' : available > 0 ? `Còn ${available}` : 'Đã đầy'}
                </Badge>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
                  <span>Đang dùng {row.occupied}/{row.capacity} chỗ</span>
                  <span className="font-bold text-foreground">{percent}%</span>
                </div>
                <Progress value={percent} className="mt-2 h-2" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatSlotStatus(status: StaffParkingOccupancyItem['slotDetails'][number]['status']) {
  if (status === 'occupied') return 'Đang đỗ'
  if (status === 'reserved') return 'Đã giữ'
  if (status === 'maintenance') return 'Bảo trì'
  return 'Trống'
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}
