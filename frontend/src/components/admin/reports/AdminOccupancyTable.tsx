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
        <p className="py-8 text-center text-sm text-subtle">Chưa có dữ liệu tầng.</p>
      ) : (
        <div className="mt-4">
          <Table className="min-w-[720px] text-left">
            <TableHeader className="border-y border-theme bg-page/35 text-xs text-subtle">
              <TableRow className="border-theme hover:bg-transparent">
                <TableHead className="h-auto px-3 py-3 text-subtle">Tòa nhà / Tầng / Khu</TableHead>
                <TableHead className="h-auto px-3 py-3 text-subtle">Loại xe</TableHead>
                <TableHead className="h-auto px-3 py-3 text-subtle">Đang đỗ</TableHead>
                <TableHead className="h-auto px-3 py-3 text-subtle">Còn trống</TableHead>
                <TableHead className="h-auto px-3 py-3 text-subtle">Khác</TableHead>
                <TableHead className="h-auto px-3 py-3 text-subtle">Sử dụng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {floors.map((floor) => (
                <TableRow key={floor.floorId} className="border-theme hover:bg-sky-500/5">
                  <TableCell className="px-3 py-3 whitespace-normal">
                    <p className="font-bold text-fg">{floor.building?.name ?? 'Chưa xác định'}</p>
                    <p className="text-xs text-subtle">{formatFloorLabel(floor)}</p>
                  </TableCell>
                  <TableCell className="px-3 py-3 text-muted">{floor.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}</TableCell>
                  <TableCell className="px-3 py-3 font-bold text-fg">{floor.occupied}</TableCell>
                  <TableCell className="px-3 py-3 text-muted">{floor.empty}</TableCell>
                  <TableCell className="px-3 py-3 text-muted">Đặt {floor.reserved ?? 0} · Bảo trì {floor.maintenance ?? 0}</TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Progress className="w-24" value={Math.min(100, floor.utilizationPercent)} />
                      <span className="font-bold text-fg">{floor.utilizationPercent}%</span>
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
