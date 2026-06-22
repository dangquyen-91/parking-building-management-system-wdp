import type { ManagerOccupancyReport } from '../../../services/managerReportsApi'

export function ManagerOccupancyTable({ report }: { report: ManagerOccupancyReport }) {
  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Công suất hiện tại</p>
        <h2 className="mt-1 text-base font-semibold text-fg">Tình trạng theo tầng</h2>
      </div>

      {report.floors.length === 0 ? (
        <p className="py-8 text-center text-sm text-subtle">Chưa có dữ liệu tầng đỗ xe.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-theme text-xs text-subtle">
              <tr>
                <th className="px-3 py-3 font-medium">Tòa nhà / Tầng</th>
                <th className="px-3 py-3 font-medium">Loại xe</th>
                <th className="px-3 py-3 font-medium">Đang đỗ</th>
                <th className="px-3 py-3 font-medium">Còn trống</th>
                <th className="px-3 py-3 font-medium">Khác</th>
                <th className="px-3 py-3 font-medium">Tỷ lệ sử dụng</th>
              </tr>
            </thead>
            <tbody>
              {report.floors.map((floor) => (
                <tr key={floor.floorId} className="border-b border-theme last:border-0">
                  <td className="px-3 py-3">
                    <p className="font-medium text-fg">{floor.building?.name ?? 'Chưa xác định'}</p>
                    <p className="text-xs text-subtle">Tầng {floor.floorNumber}</p>
                  </td>
                  <td className="px-3 py-3 text-muted">{floor.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}</td>
                  <td className="px-3 py-3 font-semibold text-fg">{floor.occupied}</td>
                  <td className="px-3 py-3 text-muted">{floor.empty}</td>
                  <td className="px-3 py-3 text-muted">
                    Đặt trước {floor.reserved ?? 0} · Bảo trì {floor.maintenance ?? 0}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-badge">
                        <div
                          className="h-full rounded-full bg-btn-primary"
                          style={{ width: `${Math.min(100, floor.utilizationPercent)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-fg">{floor.utilizationPercent}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
