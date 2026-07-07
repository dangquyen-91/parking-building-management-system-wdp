import type { AdminOccupancyReport } from '../../../services/adminApi'
import { formatFloorLabel } from '../../../utils/floorLabel'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function AdminOccupancyTable({ report }: { report: AdminOccupancyReport }) {
  const floors = Array.isArray(report.floors) ? report.floors : []

  return (
    <section className="liquid-glass-card rounded-2xl border border-sky-500/15 p-4 shadow-sm md:p-5">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 to-emerald-500" />
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">Công suất hiện tại</p>
      <h2 className="mt-1 text-lg font-black text-fg">Tình trạng theo tầng</h2>

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
                      <div className="h-2.5 w-24 overflow-hidden rounded-full bg-page">
                        <div
                          className={`h-full rounded-full ${floor.utilizationPercent >= 90 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-sky-500 to-emerald-500'}`}
                          style={{ width: `${Math.min(100, floor.utilizationPercent)}%` }}
                        />
                      </div>
                      <span className="font-bold text-fg">{floor.utilizationPercent}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}
