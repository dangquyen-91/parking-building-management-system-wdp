import type { AdminOccupancyReport } from '../../../services/adminApi'
import { formatFloorLabel } from '../../../utils/floorLabel'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Progress } from '../../ui/progress'

export function AdminOccupancyTable({ report }: { report: AdminOccupancyReport }) {
  const floors = Array.isArray(report.floors) ? report.floors : []

  return (
    <Card>
      <CardHeader><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Công suất hiện tại</p><CardTitle>Tình trạng theo tầng</CardTitle></CardHeader>
      <CardContent>

      {!floors.length ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Chưa có dữ liệu tầng.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border">
          <Table className="min-w-[720px] text-left">
            <TableHeader className="bg-muted/50 text-xs">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-auto px-3 py-3">Tòa nhà / Tầng / Khu</TableHead>
                <TableHead className="h-auto px-3 py-3">Loại xe</TableHead>
                <TableHead className="h-auto px-3 py-3">Đang đỗ</TableHead>
                <TableHead className="h-auto px-3 py-3">Còn trống</TableHead>
                <TableHead className="h-auto px-3 py-3">Khác</TableHead>
                <TableHead className="h-auto px-3 py-3">Sử dụng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {floors.map((floor) => (
                <TableRow key={floor.floorId}>
                  <TableCell className="px-3 py-3 whitespace-normal">
                    <p className="font-bold text-foreground">{floor.building?.name ?? 'Chưa xác định'}</p>
                    <p className="text-xs text-muted-foreground">{formatFloorLabel(floor)}</p>
                  </TableCell>
                  <TableCell className="px-3 py-3 text-muted-foreground">{floor.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}</TableCell>
                  <TableCell className="px-3 py-3 font-bold text-foreground">{floor.occupied}</TableCell>
                  <TableCell className="px-3 py-3 text-muted-foreground">{floor.empty}</TableCell>
                  <TableCell className="px-3 py-3 text-muted-foreground">Đặt {floor.reserved ?? 0} · Bảo trì {floor.maintenance ?? 0}</TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Progress className="w-24" value={Math.min(100, floor.utilizationPercent)} />
                      <span className="font-bold text-foreground">{floor.utilizationPercent}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      </CardContent>
    </Card>
  )
}

