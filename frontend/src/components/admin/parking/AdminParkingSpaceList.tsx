import type { ReactNode } from 'react'
import type { Building, Floor } from '../../../services/managerBuildingsApi'
import type { ParkingRow } from '../../../services/managerParkingRowApi'
import type { ParkingSlot } from '../../../services/managerParkingSlotApi'
import { AdminParkingSlotDiagram } from './AdminParkingSlotDiagram'

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
        <section key={floor._id} className="liquid-glass-card rounded-[1.75rem] border border-sky-500/15 p-4 shadow-sm md:p-5">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">
                {buildingName(floor) ?? 'Tòa nhà'} // Tầng {floor.floorNumber}
              </p>
              <h2 className="mt-1 text-lg font-black text-fg">Sơ đồ ô đỗ ô tô</h2>
            </div>
            <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-200">
              {(slotsByFloor.get(floor._id) ?? []).length} ô
            </span>
          </div>
          <AdminParkingSlotDiagram
            slots={slotsByFloor.get(floor._id) ?? []}
            onEdit={onEditSlot}
            onDelete={onDeleteSlot}
          />
        </section>
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
