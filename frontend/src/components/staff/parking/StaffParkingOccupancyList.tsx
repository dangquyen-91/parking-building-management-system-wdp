import { Search } from 'lucide-react'
import type { StaffParkingOccupancyItem } from '../../../hooks/useStaffParkingOccupancy'
import { getFloorSection } from '../../../utils/floorLabel'
import { Alert, AlertDescription } from '../../ui/alert'
import { Badge } from '../../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Progress } from '../../ui/progress'
import { Skeleton } from '../../ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import { formatVehicleType } from '../data/staffGateUtils'

const FLOOR_TYPE_LABELS: Record<string, string> = {
  resident: 'Cư dân',
  visitor: 'Khách vãng lai',
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
  return (
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
    </TableRow>
  )
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}
