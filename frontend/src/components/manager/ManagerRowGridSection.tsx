import { ManagerStatusBadge } from './ManagerStatusBadge'
import type { ParkingRow } from '../../services/managerParkingRowApi'

type RowBadgeStatus = 'available' | 'reserved' | 'maintenance'

const ROW_STATUS_LABELS: Record<ParkingRow['status'], string> = {
  available: 'Còn chỗ',
  full: 'Đã đầy',
  maintenance: 'Bảo trì',
}

type ManagerRowGridSectionProps = {
  buildingName?: string
  floorNumber?: number
  rows: ParkingRow[]
  onEdit: (row: ParkingRow) => void
}

export function ManagerRowGridSection({
  buildingName,
  floorNumber,
  rows,
  onEdit,
}: ManagerRowGridSectionProps) {
  return (
    <div className="liquid-glass-card rounded-lg border border-theme bg-badge p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-subtle">Tầng xe máy</p>
          <h3 className="mt-2 text-lg font-semibold text-fg">
            {buildingName ? `${buildingName} / ` : ''}Tầng {floorNumber ?? '-'}
          </h3>
        </div>
        <div className="text-xs text-muted">{rows.length} hàng</div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => {
          const badgeStatus: RowBadgeStatus =
            row.status === 'full' ? 'reserved' : row.status
          const availableCount = Math.max(0, row.capacity - row.occupiedCount)

          return (
            <div key={row._id} className="flex flex-col gap-3 rounded-lg border border-theme bg-page/70 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-fg">{row.rowCode}</p>
                  <p className="text-[11px] font-medium text-fg">
                    {row.occupiedCount}/{row.capacity} đang dùng
                  </p>
                </div>
                <ManagerStatusBadge status={badgeStatus} label={ROW_STATUS_LABELS[row.status]} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-muted">
                <span>Còn trống</span>
                <span className="text-right font-semibold text-fg">{availableCount}</span>
                <span>Sức chứa</span>
                <span className="text-right font-semibold text-fg">{row.capacity}</span>
              </div>
              {row.note && <p className="text-[11px] text-muted">{row.note}</p>}
              <div className="mt-auto flex items-center justify-end text-[11px]">
                <button type="button" className="font-semibold text-fg hover:text-fg" onClick={() => onEdit(row)}>
                  Sửa
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
