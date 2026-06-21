import { useEffect, useId, useState, type ReactNode } from 'react'
import type { ManagerBuildingSummary } from '../../hooks/useManagerBuildings'
import type { Building, BuildingPayload, Floor, FloorPayload } from '../../services/managerBuildingsApi'
import type { ParkingRow, RowCreatePayload, RowUpdatePayload } from '../../services/managerParkingRowApi'
import type { ParkingSlot, SlotBulkCreatePayload, SlotCreatePayload, SlotStatus, SlotUpdatePayload } from '../../services/managerParkingSlotApi'
import { AdminPageShell } from './AdminPageShell'

const inputClass = 'h-11 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15'

export function AdminBuildingCard({ building, onEdit, onEditFloor }: { building: ManagerBuildingSummary; onEdit: (building: ManagerBuildingSummary) => void; onEditFloor: (floor: ManagerBuildingSummary['floors'][number]) => void }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <article className="liquid-glass-card group rounded-2xl border border-sky-500/10 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-500/25 hover:shadow-xl">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-300">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 20V5.5A1.5 1.5 0 0 1 5.5 4H14l4 4v12H4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M8 9h2M8 13h2M8 17h2M14 13h2M14 17h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-black text-fg">{building.name}</h2>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${building.isActive ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200' : 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-200'}`}>
                {building.isActive ? 'Hoạt động' : 'Tạm dừng'}
              </span>
            </div>
            <p className="mt-1 text-xs text-subtle">{building.address}</p>
            {building.description && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{building.description}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <Metric label="Tầng" value={building.floorCount} tone="sky" />
          <Metric label="Chỗ đỗ" value={building.totalSlots} tone="emerald" />
          <button className="h-11 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 text-sm font-bold text-violet-700 transition hover:bg-violet-500 hover:text-white dark:text-violet-200" onClick={() => onEdit(building)}>Chỉnh sửa</button>
        </div>
      </div>

      <button type="button" className="mt-5 flex w-full items-center justify-between rounded-xl border border-theme bg-page/45 px-4 py-3 text-sm font-bold text-fg transition-colors hover:border-sky-500/25 hover:bg-sky-500/5" aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}>
        <span>{open ? 'Ẩn danh sách tầng' : 'Xem danh sách tầng'}</span>
        <span className="flex items-center gap-2 text-xs text-subtle">
          {building.floors.length} tầng
          <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
        </span>
      </button>

      {open && (
        <div id={id} className="mt-3 grid gap-2 md:grid-cols-2">
          {building.floors.length ? building.floors.map((floor) => (
            <div key={floor.id} className="flex items-center justify-between gap-3 rounded-2xl border border-theme bg-page/40 p-3 transition-colors hover:border-sky-500/20 hover:bg-sky-500/5">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${floor.vehicleType === 'car' ? 'bg-violet-500/15 text-violet-700 dark:text-violet-200' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200'}`}>
                  {floor.floorNumber}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-fg">Tầng {floor.floorNumber}</p>
                  <p className="mt-1 truncate text-xs text-subtle">{floor.floorType === 'resident' ? 'Cư dân' : 'Khách'} · {floor.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'} · {floor.totalSlots} chỗ</p>
                </div>
              </div>
              <button className="h-9 shrink-0 rounded-xl border border-theme px-3 text-xs font-bold text-fg transition hover:bg-ghost" onClick={() => onEditFloor(floor)}>Sửa</button>
            </div>
          )) : <p className="rounded-2xl border border-dashed border-theme p-4 text-sm text-muted">Chưa có tầng.</p>}
        </div>
      )}
    </article>
  )
}

export function AdminBuildingFormModal({ open, mode, initialValues, isSubmitting, error, onClose, onSubmit }: { open: boolean; mode: 'create' | 'edit'; initialValues?: BuildingPayload; isSubmitting: boolean; error?: string | null; onClose: () => void; onSubmit: (payload: BuildingPayload) => void }) {
  const [name, setName] = useState(''); const [address, setAddress] = useState(''); const [description, setDescription] = useState('')
  // Form state is intentionally reset whenever a different modal record is opened.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) { setName(initialValues?.name ?? ''); setAddress(initialValues?.address ?? ''); setDescription(initialValues?.description ?? '') } }, [open, initialValues])
  if (!open) return null
  return <AdminModal title={mode === 'create' ? 'Tạo tòa nhà' : 'Chỉnh sửa tòa nhà'} eyebrow="Admin // Tòa nhà" error={error} onClose={onClose}><form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); onSubmit({ name: name.trim(), address: address.trim(), description: description.trim() || undefined }) }}><Field label="Tên tòa nhà"><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required /></Field><Field label="Địa chỉ"><input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} required /></Field><Field label="Mô tả"><textarea className="min-h-24 rounded-xl border border-theme bg-page p-3 text-sm text-fg outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15" value={description} onChange={(e) => setDescription(e.target.value)} /></Field><ModalActions disabled={!name.trim() || !address.trim() || isSubmitting} loading={isSubmitting} onClose={onClose} /></form></AdminModal>
}

export function AdminFloorFormModal({ open, mode, buildings, floorId, initialValues, isSubmitting, error, onClose, onSubmit }: { open: boolean; mode: 'create' | 'edit'; buildings: ManagerBuildingSummary[]; floorId?: string; initialValues?: FloorPayload; isSubmitting: boolean; error?: string | null; onClose: () => void; onSubmit: (payload: FloorPayload, floorId?: string) => void }) {
  const defaultBuilding = buildings[0]?.id ?? ''; const [buildingId, setBuildingId] = useState(defaultBuilding); const [floorNumber, setFloorNumber] = useState(''); const [vehicleType, setVehicleType] = useState<FloorPayload['vehicleType']>('motorcycle'); const [floorType, setFloorType] = useState<FloorPayload['floorType']>('resident'); const [totalSlots, setTotalSlots] = useState(''); const [description, setDescription] = useState('')
  // Form state is intentionally reset whenever a different modal record is opened.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!open) return; setBuildingId(initialValues?.buildingId ?? defaultBuilding); setFloorNumber(initialValues ? String(initialValues.floorNumber) : ''); setVehicleType(initialValues?.vehicleType ?? 'motorcycle'); setFloorType(initialValues?.floorType ?? 'resident'); setTotalSlots(initialValues ? String(initialValues.totalSlots) : ''); setDescription(initialValues?.description ?? '') }, [open, initialValues, defaultBuilding])
  if (!open) return null
  const valid = buildingId && Number(floorNumber) > 0 && Number(totalSlots) > 0
  return <AdminModal title={mode === 'create' ? 'Tạo tầng' : 'Chỉnh sửa tầng'} eyebrow="Admin // Tầng" error={error} onClose={onClose}><form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); onSubmit({ buildingId, floorNumber: Number(floorNumber), vehicleType, floorType, totalSlots: Number(totalSlots), description: description.trim() || undefined }, floorId) }}><Field label="Tòa nhà"><select className={inputClass} value={buildingId} disabled={mode === 'edit'} onChange={(e) => setBuildingId(e.target.value)}>{buildings.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Số tầng"><input className={inputClass} type="number" min="1" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} /></Field><Field label="Tổng chỗ đỗ"><input className={inputClass} type="number" min="1" value={totalSlots} onChange={(e) => setTotalSlots(e.target.value)} /></Field><Field label="Loại xe"><select className={inputClass} value={vehicleType} onChange={(e) => setVehicleType(e.target.value as FloorPayload['vehicleType'])}><option value="motorcycle">Xe máy</option><option value="car">Ô tô</option></select></Field><Field label="Loại tầng"><select className={inputClass} value={floorType} onChange={(e) => setFloorType(e.target.value as FloorPayload['floorType'])}><option value="resident">Cư dân</option><option value="visitor">Khách</option></select></Field></div><Field label="Mô tả"><textarea className="min-h-20 rounded-xl border border-theme bg-page p-3 text-sm text-fg outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15" value={description} onChange={(e) => setDescription(e.target.value)} /></Field><ModalActions disabled={!valid || isSubmitting} loading={isSubmitting} onClose={onClose} /></form></AdminModal>
}

export function AdminParkingSpaceHeader({ buildings, floors, buildingFilter, floorFilter, onBuildingFilterChange, onFloorFilterChange, onCreateSlot, onCreateRow }: { buildings: Building[]; floors: Floor[]; buildingFilter: string; floorFilter: string; onBuildingFilterChange: (value: string) => void; onFloorFilterChange: (value: string) => void; onCreateSlot: () => void; onCreateRow: () => void }) {
  return <AdminPageShell eyebrow="Admin // Chỗ đỗ" title="Quản lý chỗ đỗ" description="Quản lý ô đỗ ô tô, hàng xe máy, trạng thái và sức chứa." actions={<div className="grid w-full gap-3 lg:min-w-[38rem]"><div className="flex flex-col gap-3 rounded-lg border border-theme bg-badge p-3 sm:flex-row sm:items-end"><div className="grid flex-1 gap-3 sm:grid-cols-2"><Field label="Tòa nhà"><select className={inputClass} value={buildingFilter} onChange={(e) => onBuildingFilterChange(e.target.value)}><option value="all">Tất cả</option>{buildings.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></Field><Field label="Tầng"><select className={inputClass} value={floorFilter} onChange={(e) => onFloorFilterChange(e.target.value)}><option value="all">Tất cả</option>{floors.map((item) => <option key={item._id} value={item._id}>Tầng {item.floorNumber}</option>)}</select></Field></div><div className="flex gap-2"><button className="h-10 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg" onClick={onCreateSlot}>Tạo ô ô tô</button><button className="h-10 rounded-lg border border-theme px-4 text-sm font-semibold text-fg" onClick={onCreateRow}>Tạo hàng xe máy</button></div></div></div>} />
}

export function AdminParkingSpaceList({ isLoading, hasError, filteredSlots, filteredRows, visibleSlotFloors, visibleRowFloors, slotsByFloor, rowsByFloor, buildingMap, onEditSlot, onDeleteSlot, onEditRow }: { isLoading: boolean; hasError: boolean; filteredSlots: ParkingSlot[]; filteredRows: ParkingRow[]; visibleSlotFloors: Floor[]; visibleRowFloors: Floor[]; slotsByFloor: Map<string, ParkingSlot[]>; rowsByFloor: Map<string, ParkingRow[]>; buildingMap: Map<string, Building>; onEditSlot: (slot: ParkingSlot) => void; onDeleteSlot: (slot: ParkingSlot) => void; onEditRow: (row: ParkingRow) => void }) {
  if (hasError) return null; if (isLoading) return <Empty text="Đang tải dữ liệu chỗ đỗ..." />; if (!filteredSlots.length && !filteredRows.length) return <Empty text="Không có chỗ đỗ phù hợp." />
  const buildingName = (floor: Floor) => { const id = typeof floor.buildingId === 'string' ? floor.buildingId : floor.buildingId?._id; return id ? buildingMap.get(id)?.name : undefined }
  return <section className="grid gap-5">{visibleSlotFloors.map((floor) => <InfrastructureSection key={floor._id} eyebrow={`${buildingName(floor) ?? 'Tòa nhà'} // Tầng ${floor.floorNumber}`} title="Ô đỗ ô tô">{(slotsByFloor.get(floor._id) ?? []).map((slot) => <article key={slot._id} className="rounded-lg border border-theme bg-badge p-3"><div className="flex items-center justify-between"><div><p className="font-semibold text-fg">{slot.slotCode}</p><p className="mt-1 text-xs text-subtle">{slot.status}</p></div><div className="flex gap-1"><button className="rounded-lg border border-theme px-2.5 py-1 text-xs text-fg" onClick={() => onEditSlot(slot)}>Sửa</button><button className="rounded-lg border border-rose-500/30 px-2.5 py-1 text-xs text-rose-400" onClick={() => onDeleteSlot(slot)}>Xóa</button></div></div></article>)}</InfrastructureSection>)}{visibleRowFloors.map((floor) => <InfrastructureSection key={floor._id} eyebrow={`${buildingName(floor) ?? 'Tòa nhà'} // Tầng ${floor.floorNumber}`} title="Hàng xe máy">{(rowsByFloor.get(floor._id) ?? []).map((row) => <article key={row._id} className="rounded-lg border border-theme bg-badge p-3"><div className="flex items-center justify-between"><div><p className="font-semibold text-fg">{row.rowCode}</p><p className="mt-1 text-xs text-subtle">{row.occupiedCount}/{row.capacity} đang dùng</p></div><button className="rounded-lg border border-theme px-2.5 py-1 text-xs text-fg" onClick={() => onEditRow(row)}>Sửa</button></div></article>)}</InfrastructureSection>)}</section>
}

export function AdminSlotFormModal({ open, mode, floors, initialValues, isSubmitting, error, onClose, onSubmit }: { open: boolean; mode: 'create' | 'edit'; floors: Floor[]; initialValues?: { floorId: string; slotCode: string; vehicleType: 'car' | 'motorcycle'; status: SlotStatus; note?: string }; isSubmitting: boolean; error?: string | null; onClose: () => void; onSubmit: (payload: SlotCreatePayload | SlotUpdatePayload | SlotBulkCreatePayload) => void }) {
  const defaultFloor = floors[0]?._id ?? ''; const [floorId, setFloorId] = useState(defaultFloor); const [slotCode, setSlotCode] = useState(''); const [status, setStatus] = useState<SlotStatus>('empty'); const [note, setNote] = useState('')
  // Form state is intentionally reset whenever a different modal record is opened.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) { setFloorId(initialValues?.floorId ?? defaultFloor); setSlotCode(initialValues?.slotCode ?? ''); setStatus(initialValues?.status ?? 'empty'); setNote(initialValues?.note ?? '') } }, [open, initialValues, defaultFloor])
  if (!open) return null
  return <AdminModal eyebrow="Admin // Ô đỗ" title={mode === 'create' ? 'Tạo ô đỗ ô tô' : 'Chỉnh sửa ô đỗ'} error={error} onClose={onClose}><form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); onSubmit(mode === 'create' ? { floorId, slotCode: slotCode.trim(), vehicleType: 'car', note: note.trim() || undefined } : { slotCode: slotCode.trim(), vehicleType: 'car', status, note: note.trim() || undefined }) }}><Field label="Tầng"><select className={inputClass} value={floorId} disabled={mode === 'edit'} onChange={(e) => setFloorId(e.target.value)}>{floors.map((floor) => <option key={floor._id} value={floor._id}>Tầng {floor.floorNumber}</option>)}</select></Field><Field label="Mã ô đỗ"><input className={inputClass} value={slotCode} onChange={(e) => setSlotCode(e.target.value)} required /></Field>{mode === 'edit' && <Field label="Trạng thái"><select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as SlotStatus)}><option value="empty">Trống</option><option value="occupied">Đang dùng</option><option value="reserved">Đã đặt</option><option value="maintenance">Bảo trì</option></select></Field>}<Field label="Ghi chú"><textarea className="min-h-20 rounded-lg border border-theme bg-page p-3 text-sm text-fg" value={note} onChange={(e) => setNote(e.target.value)} /></Field><ModalActions disabled={!floorId || !slotCode.trim() || isSubmitting} loading={isSubmitting} onClose={onClose} /></form></AdminModal>
}

export function AdminRowFormModal({ open, mode, floors, initialValues, isSubmitting, error, onClose, onSubmit }: { open: boolean; mode: 'create' | 'edit'; floors: Floor[]; initialValues?: { floorId: string; rowCode: string; capacity: number; note?: string | null }; isSubmitting: boolean; error?: string | null; onClose: () => void; onSubmit: (payload: RowCreatePayload | RowUpdatePayload) => void }) {
  const defaultFloor = floors[0]?._id ?? ''; const [floorId, setFloorId] = useState(defaultFloor); const [rowCode, setRowCode] = useState(''); const [capacity, setCapacity] = useState(''); const [note, setNote] = useState('')
  // Form state is intentionally reset whenever a different modal record is opened.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) { setFloorId(initialValues?.floorId ?? defaultFloor); setRowCode(initialValues?.rowCode ?? ''); setCapacity(initialValues ? String(initialValues.capacity) : ''); setNote(initialValues?.note ?? '') } }, [open, initialValues, defaultFloor])
  if (!open) return null
  return <AdminModal eyebrow="Admin // Hàng xe máy" title={mode === 'create' ? 'Tạo hàng xe máy' : 'Chỉnh sửa hàng xe máy'} error={error} onClose={onClose}><form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); const base = { rowCode: rowCode.trim(), capacity: Number(capacity), note: note.trim() || null }; onSubmit(mode === 'create' ? { floorId, ...base } : base) }}><Field label="Tầng"><select className={inputClass} value={floorId} disabled={mode === 'edit'} onChange={(e) => setFloorId(e.target.value)}>{floors.map((floor) => <option key={floor._id} value={floor._id}>Tầng {floor.floorNumber}</option>)}</select></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Mã hàng"><input className={inputClass} value={rowCode} onChange={(e) => setRowCode(e.target.value)} /></Field><Field label="Sức chứa"><input className={inputClass} type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></Field></div><Field label="Ghi chú"><textarea className="min-h-20 rounded-lg border border-theme bg-page p-3 text-sm text-fg" value={note} onChange={(e) => setNote(e.target.value)} /></Field><ModalActions disabled={!floorId || !rowCode.trim() || Number(capacity) < 1 || isSubmitting} loading={isSubmitting} onClose={onClose} /></form></AdminModal>
}

function AdminModal({ eyebrow, title, error, onClose, children }: { eyebrow: string; title: string; error?: string | null; onClose: () => void; children: ReactNode }) { return <div className="fixed inset-0 z-[80] grid place-items-center bg-overlay p-4 backdrop-blur-sm" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="liquid-glass-card max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-sky-500/15 p-5 shadow-2xl md:p-6"><span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500" /><div className="mb-5 flex justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">{eyebrow}</p><h2 className="mt-2 text-2xl font-black text-fg">{title}</h2></div><button type="button" className="flex size-10 items-center justify-center rounded-xl border border-theme text-muted transition hover:bg-ghost hover:text-fg" onClick={onClose} aria-label="Đóng">✕</button></div>{error && <p className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">{error}</p>}{children}</div></div> }
function ModalActions({ disabled, loading, onClose }: { disabled: boolean; loading: boolean; onClose: () => void }) { return <div className="flex flex-col-reverse justify-end gap-2 pt-2 sm:flex-row"><button type="button" className="h-11 rounded-xl border border-theme px-4 text-sm font-bold text-fg transition hover:bg-ghost" onClick={onClose}>Hủy</button><button className="h-11 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 text-sm font-black text-white shadow-lg shadow-sky-500/20 transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0" disabled={disabled}>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</button></div> }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="grid gap-1 text-xs font-medium text-subtle">{label}{children}</label> }
function Metric({ label, value, tone }: { label: string; value: number; tone: 'sky' | 'emerald' }) { return <div className={`min-w-20 rounded-xl border p-2.5 text-center ${tone === 'sky' ? 'border-sky-500/15 bg-sky-500/10' : 'border-emerald-500/15 bg-emerald-500/10'}`}><p className="text-[10px] font-bold uppercase tracking-wide text-subtle">{label}</p><p className="mt-1 text-lg font-black text-fg">{value}</p></div> }
function Empty({ text }: { text: string }) { return <div className="liquid-glass-card rounded-lg p-5 text-sm text-muted">{text}</div> }
function InfrastructureSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) { return <section className="liquid-glass-card rounded-lg p-4"><p className="text-[10px] uppercase tracking-[0.18em] text-subtle">{eyebrow}</p><h2 className="mt-1 text-base font-semibold text-fg">{title}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div></section> }
