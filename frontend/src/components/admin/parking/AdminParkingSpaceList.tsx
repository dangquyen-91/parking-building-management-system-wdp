import { useState } from 'react'
import type { Building, Floor } from '../../../services/managerBuildingsApi'
import type { ParkingRow } from '../../../services/managerParkingRowApi'
import type { ParkingSlot } from '../../../services/managerParkingSlotApi'
import { getFloorSection } from '../../../utils/floorLabel'
import { AdminParkingSlotDiagram } from './AdminParkingSlotDiagram'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Skeleton } from '../../ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs'

type Props = { isLoading: boolean; hasError: boolean; filteredSlots: ParkingSlot[]; filteredRows: ParkingRow[]; visibleSlotFloors: Floor[]; visibleRowFloors: Floor[]; slotsByFloor: Map<string, ParkingSlot[]>; rowsByFloor: Map<string, ParkingRow[]>; buildingMap: Map<string, Building>; onEditSlot: (slot: ParkingSlot) => void; onDeleteSlot: (slot: ParkingSlot) => void; onEditRow: (row: ParkingRow) => void }
type FloorGroup = { key: string; buildingName?: string; floorNumber: number | string; floors: Floor[] }

export function AdminParkingSpaceList(props: Props) {
  if (props.hasError) return null
  if (props.isLoading) return <div className="grid gap-4">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}</div>
  if (!props.filteredSlots.length && !props.filteredRows.length) return <Card className="border-dashed"><CardContent className="p-8 text-center text-sm text-muted-foreground">Không có chỗ đỗ phù hợp.</CardContent></Card>
  return <section className="grid gap-5">{groupFloors(props.visibleSlotFloors, props.buildingMap).map((group) => <SlotGroup key={group.key} group={group} slotsByFloor={props.slotsByFloor} onEdit={props.onEditSlot} onDelete={props.onDeleteSlot} />)}{groupFloors(props.visibleRowFloors, props.buildingMap).map((group) => <RowGroup key={group.key} group={group} rowsByFloor={props.rowsByFloor} onEdit={props.onEditRow} />)}</section>
}

function SlotGroup({ group, slotsByFloor, onEdit, onDelete }: { group: FloorGroup; slotsByFloor: Map<string, ParkingSlot[]>; onEdit: (slot: ParkingSlot) => void; onDelete: (slot: ParkingSlot) => void }) {
  const [floorId, setFloorId] = useState(group.floors[0]?._id ?? ''); const floor = group.floors.find((f) => f._id === floorId) ?? group.floors[0]; const slots = floor ? slotsByFloor.get(floor._id) ?? [] : []
  return <Card><CardHeader className="flex-row items-end justify-between"><div><p className="text-xs text-muted-foreground">{group.buildingName ?? 'Tòa nhà'} · Tầng {group.floorNumber}</p><CardTitle className="mt-1">Sơ đồ ô đỗ ô tô</CardTitle></div><Badge variant="secondary">{slots.length} ô</Badge></CardHeader><CardContent><FloorTabs floors={group.floors} value={floor?._id ?? ''} counts={slotsByFloor} onChange={setFloorId} /><div className="mt-4 max-h-[38rem] overflow-y-auto pr-1"><AdminParkingSlotDiagram slots={slots} onEdit={onEdit} onDelete={onDelete} /></div></CardContent></Card>
}

function RowGroup({ group, rowsByFloor, onEdit }: { group: FloorGroup; rowsByFloor: Map<string, ParkingRow[]>; onEdit: (row: ParkingRow) => void }) {
  const [floorId, setFloorId] = useState(group.floors[0]?._id ?? ''); const floor = group.floors.find((f) => f._id === floorId) ?? group.floors[0]; const rows = floor ? rowsByFloor.get(floor._id) ?? [] : []
  return <Card><CardHeader className="flex-row items-end justify-between"><div><p className="text-xs text-muted-foreground">{group.buildingName ?? 'Tòa nhà'} · Tầng {group.floorNumber}</p><CardTitle className="mt-1">Hàng xe máy</CardTitle></div><Badge variant="secondary">{rows.length} hàng</Badge></CardHeader><CardContent><FloorTabs floors={group.floors} value={floor?._id ?? ''} counts={rowsByFloor} onChange={setFloorId} /><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{rows.map((row) => <Card key={row._id} className="min-h-28 shadow-none"><CardContent className="flex h-full items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="truncate font-medium">{row.rowCode}</p><p className="text-xs text-muted-foreground">{row.occupiedCount}/{row.capacity} đang dùng</p></div><Button size="sm" variant="outline" onClick={() => onEdit(row)}>Sửa</Button></CardContent></Card>)}</div></CardContent></Card>
}

function FloorTabs<T>({ floors, value, counts, onChange }: { floors: Floor[]; value: string; counts: Map<string, T[]>; onChange: (id: string) => void }) {
  return <Tabs value={value} onValueChange={onChange}><TabsList className="h-auto max-w-full justify-start overflow-x-auto p-1">{floors.map((floor) => <TabsTrigger key={floor._id} value={floor._id} className="shrink-0">Khu {getFloorSection(floor.section)} ({counts.get(floor._id)?.length ?? 0})</TabsTrigger>)}</TabsList></Tabs>
}

function groupFloors(floors: Floor[], buildings: Map<string, Building>) { const groups = new Map<string, FloorGroup>(); floors.forEach((floor) => { const buildingId = typeof floor.buildingId === 'string' ? floor.buildingId : floor.buildingId?._id; const key = `${buildingId || 'unknown'}-${floor.floorNumber ?? '-'}`; const current = groups.get(key); if (current) current.floors.push(floor); else groups.set(key, { key, buildingName: buildingId ? buildings.get(buildingId)?.name : undefined, floorNumber: floor.floorNumber ?? '-', floors: [floor] }) }); return [...groups.values()].sort((a, b) => (a.buildingName ?? '').localeCompare(b.buildingName ?? '') || Number(a.floorNumber) - Number(b.floorNumber)) }

