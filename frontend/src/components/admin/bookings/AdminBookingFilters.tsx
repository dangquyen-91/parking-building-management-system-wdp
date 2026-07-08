import { Search } from 'lucide-react'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { NativeSelect, NativeSelectOption } from '../../ui/native-select'
import { Card, CardContent } from '../../ui/card'

export type AdminBookingStatusFilter = 'all' | 'pending' | 'paid' | 'used' | 'expired' | 'cancelled'
type Props = { query: string; statusFilter: AdminBookingStatusFilter; onQueryChange: (value: string) => void; onStatusFilterChange: (value: AdminBookingStatusFilter) => void }

export function AdminBookingFilters({ query, statusFilter, onQueryChange, onStatusFilterChange }: Props) {
  return <Card className="w-full xl:min-w-[34rem]"><CardContent className="grid gap-3 p-4 sm:grid-cols-2">
    <Label className="grid gap-2"><span>Tìm kiếm</span><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Biển số, số điện thoại hoặc khách hàng" /></div></Label>
    <Label className="grid gap-2"><span>Trạng thái</span><NativeSelect value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as AdminBookingStatusFilter)}><NativeSelectOption value="all">Tất cả</NativeSelectOption><NativeSelectOption value="pending">Chờ thanh toán</NativeSelectOption><NativeSelectOption value="paid">Đã thanh toán</NativeSelectOption><NativeSelectOption value="used">Đã sử dụng</NativeSelectOption><NativeSelectOption value="expired">Hết hạn</NativeSelectOption><NativeSelectOption value="cancelled">Đã hủy</NativeSelectOption></NativeSelect></Label>
  </CardContent></Card>
}
