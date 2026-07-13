import { Button } from '@/components/ui/button'
import { ManagerStatusBadge } from '../common/ManagerStatusBadge'
import type { Floor } from '../../../services/managerBuildingsApi'
import type { ParkingRow } from '../../../services/managerParkingRowApi'
import { getFloorSection } from '../../../utils/floorLabel'

const ROW_STATUS_LABELS: Record<ParkingRow['status'], string> = {
  available: 'Còn chỗ',
  full: 'Đã đầy',
  maintenance: 'Bảo trì',
}

const ROW_STATUS_DETAILS: Record<ParkingRow['status'], string> = {
  available: 'Có thể nhận thêm xe',
  full: 'Không còn chỗ trống',
  maintenance: 'Tạm ngưng sử dụng',
}

const FLOOR_TYPE_LABELS: Record<Floor['floorType'], string> = {
  resident: 'Cư dân',
  visitor: 'Khách vãng lai',
}

type ManagerRowGridSectionProps = {
  buildingName?: string
  floorNumber?: number
  section?: string
  floorType: Floor['floorType']
  rows: ParkingRow[]
  onEdit: (row: ParkingRow) => void
}

export function ManagerRowGridSection({
  buildingName,
  floorNumber,
  section,
  floorType,
  rows,
  onEdit,
}: ManagerRowGridSectionProps) {
  const capacity = rows.reduce((total, row) => total + row.capacity, 0)
  const occupied = rows.reduce((total, row) => total + row.occupiedCount, 0)
  const available = Math.max(0, capacity - occupied)

  return (
    <div className="bg-card text-card-foreground ring-1 ring-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Khu xe máy</p>
            <h3 className="mt-2 text-xl font-black text-foreground">
              {buildingName ? `${buildingName} / ` : ''}Tầng {floorNumber ?? '-'} · Khu {getFloorSection(section)}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-border bg-background/60 px-3 py-1 font-bold text-foreground">Xe máy</span>
              <span className="rounded-full border border-border bg-background/60 px-3 py-1 font-bold text-foreground">
                {FLOOR_TYPE_LABELS[floorType]}
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-black text-emerald-700 dark:text-emerald-200">
                Còn {available}/{capacity} chỗ
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background/50 px-4 py-3 text-right">
            <p className="text-2xl font-black text-foreground">{rows.length}</p>
            <p className="text-xs text-muted-foreground">Hàng xe máy</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {rows.map((row) => {
          const availableCount = Math.max(0, row.capacity - row.occupiedCount)
          const percent = row.capacity > 0 ? Math.min(100, Math.round((row.occupiedCount / row.capacity) * 100)) : 0

          return (
            <article
              key={row._id}
              className="group flex min-h-44 flex-col rounded-xl border border-border bg-background/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-foreground">{row.rowCode}</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {row.occupiedCount}/{row.capacity} đang dùng
                  </p>
                </div>
                <ManagerStatusBadge status={row.status} label={ROW_STATUS_LABELS[row.status]} />
              </div>

              <div className="mt-4">
                <div className="h-3 overflow-hidden rounded-full bg-card">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-2 text-[11px] font-semibold text-muted-foreground">{ROW_STATUS_DETAILS[row.status]}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Còn trống</span>
                <span className="text-right font-black text-foreground">{availableCount}</span>
                <span>Sức chứa</span>
                <span className="text-right font-black text-foreground">{row.capacity}</span>
              </div>

              {row.note && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{row.note}</p>}

              <div className="mt-auto flex items-center justify-end border-t border-border pt-3 text-xs">
                <Button type="button" variant="outline" size="sm" onClick={() => onEdit(row)}>
                  Sửa
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}



