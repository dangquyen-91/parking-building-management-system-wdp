import type { ParkingSlot, SlotStatus } from '../../../services/managerParkingSlotApi'
import { AdminStatusBadge } from '../common/AdminStatusBadge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../ui/alert-dialog'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../ui/card'

const LABELS: Record<SlotStatus, string> = { empty: 'Còn trống', occupied: 'Đã có xe', reserved: 'Đã đặt trước', maintenance: 'Bảo trì' }

export function AdminParkingSlotDiagram({ slots, onEdit, onDelete }: { slots: ParkingSlot[]; onEdit: (slot: ParkingSlot) => void; onDelete: (slot: ParkingSlot) => void }) {
  return <div className="grid gap-4"><div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-3">{slots.map((slot) => <Card key={slot._id} className="shadow-none"><CardHeader className="p-3 pb-2"><CardTitle className="text-sm">{slot.slotCode}</CardTitle><AdminStatusBadge status={slot.status} label={LABELS[slot.status]} /></CardHeader><CardFooter className="gap-1.5 p-3 pt-2"><Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(slot)}>Sửa</Button><AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="destructive" className="flex-1">Xóa</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Xóa ô đỗ {slot.slotCode}?</AlertDialogTitle><AlertDialogDescription>Ô đỗ sẽ bị xóa khỏi sơ đồ. Thao tác này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(slot)}>Xóa</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></CardFooter></Card>)}</div><Card className="shadow-none"><CardContent className="flex flex-wrap gap-2 p-3">{(Object.keys(LABELS) as SlotStatus[]).map((status) => <Badge key={status} variant="outline">{LABELS[status]} ({slots.filter((slot) => slot.status === status).length})</Badge>)}</CardContent></Card></div>
}
