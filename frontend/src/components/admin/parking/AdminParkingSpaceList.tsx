import type { ReactNode } from 'react'
import type { Building, Floor } from '../../../services/managerBuildingsApi'
import type { ParkingRow } from '../../../services/managerParkingRowApi'
import type { ParkingSlot } from '../../../services/managerParkingSlotApi'

export function AdminParkingSpaceList({ isLoading, hasError, filteredSlots, filteredRows, visibleSlotFloors, visibleRowFloors, slotsByFloor, rowsByFloor, buildingMap, onEditSlot, onDeleteSlot, onEditRow }: { isLoading: boolean; hasError: boolean; filteredSlots: ParkingSlot[]; filteredRows: ParkingRow[]; visibleSlotFloors: Floor[]; visibleRowFloors: Floor[]; slotsByFloor: Map<string, ParkingSlot[]>; rowsByFloor: Map<string, ParkingRow[]>; buildingMap: Map<string, Building>; onEditSlot: (slot: ParkingSlot) => void; onDeleteSlot: (slot: ParkingSlot) => void; onEditRow: (row: ParkingRow) => void }) {
  if (hasError) return null
  if (isLoading) return <Empty text="Đang tải dữ liệu chỗ đỗ..." />
  if (!filteredSlots.length && !filteredRows.length) return <Empty text="Không có chỗ đỗ phù hợp." />

  const buildingName = (floor: Floor) => {
    const id = typeof floor.buildingId === 'string' ? floor.buildingId : floor.buildingId?._id
    return id ? buildingMap.get(id)?.name : undefined
  }

  return (
    <section className="grid gap-5">
      {visibleSlotFloors.map((floor) => (
        <InfrastructureSection key={floor._id} eyebrow={`${buildingName(floor) ?? 'Tòa nhà'} // Tầng ${floor.floorNumber}`} title="Ô đỗ ô tô">
          {(slotsByFloor.get(floor._id) ?? []).map((slot) => (
            <article key={slot._id} className="rounded-lg border border-theme bg-badge p-3">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold text-fg">{slot.slotCode}</p><p className="mt-1 text-xs text-subtle">{slot.status}</p></div>
                <div className="flex gap-1">
                  <button className="rounded-lg border border-theme px-2.5 py-1 text-xs text-fg" onClick={() => onEditSlot(slot)}>Sửa</button>
                  <button className="rounded-lg border border-rose-500/30 px-2.5 py-1 text-xs text-rose-400" onClick={() => onDeleteSlot(slot)}>Xóa</button>
                </div>
              </div>
            </article>
          ))}
        </InfrastructureSection>
      ))}
      {visibleRowFloors.map((floor) => (
        <InfrastructureSection key={floor._id} eyebrow={`${buildingName(floor) ?? 'Tòa nhà'} // Tầng ${floor.floorNumber}`} title="Hàng xe máy">
          {(rowsByFloor.get(floor._id) ?? []).map((row) => (
            <article key={row._id} className="rounded-lg border border-theme bg-badge p-3">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold text-fg">{row.rowCode}</p><p className="mt-1 text-xs text-subtle">{row.occupiedCount}/{row.capacity} đang dùng</p></div>
                <button className="rounded-lg border border-theme px-2.5 py-1 text-xs text-fg" onClick={() => onEditRow(row)}>Sửa</button>
              </div>
            </article>
          ))}
        </InfrastructureSection>
      ))}
    </section>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="liquid-glass-card rounded-lg p-5 text-sm text-muted">{text}</div>
}

function InfrastructureSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <section className="liquid-glass-card rounded-lg p-4"><p className="text-[10px] uppercase tracking-[0.18em] text-subtle">{eyebrow}</p><h2 className="mt-1 text-base font-semibold text-fg">{title}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div></section>
}
