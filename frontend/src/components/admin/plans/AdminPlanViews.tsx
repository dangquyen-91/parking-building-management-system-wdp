import { useEffect, useState, type FormEvent } from 'react'
import type { ManagerPlan, ManagerPlanUpdatePayload } from '../../../services/managerPlansApi'
import { AdminStatCard } from '../common/AdminStatCard'
import { AdminStatusBadge } from '../common/AdminStatusBadge'
import { formatAdminCurrency } from '../adminData'
import { OperationEmpty, OperationField } from '../operations/AdminOperationPrimitives'
import { Button } from '../../ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog'
import { Input } from '../../ui/input'
import { NativeSelect, NativeSelectOption } from '../../ui/native-select'
import { Textarea } from '../../ui/textarea'

export type AdminPlanVehicleFilter = 'all' | ManagerPlan['vehicleType']
export type AdminPlanStatusFilter = 'all' | 'active' | 'inactive'

export function AdminPlanFilters({ vehicleFilter, statusFilter, onVehicleFilterChange, onStatusFilterChange }: { vehicleFilter: AdminPlanVehicleFilter; statusFilter: AdminPlanStatusFilter; onVehicleFilterChange: (value: AdminPlanVehicleFilter) => void; onStatusFilterChange: (value: AdminPlanStatusFilter) => void }) {
  return <Card className="w-full xl:min-w-[30rem]"><CardContent className="grid gap-3 p-4 sm:grid-cols-2"><OperationField label="Loại xe"><NativeSelect value={vehicleFilter} onChange={(e) => onVehicleFilterChange(e.target.value as AdminPlanVehicleFilter)}><NativeSelectOption value="all">Tất cả</NativeSelectOption><NativeSelectOption value="motorcycle">Xe máy</NativeSelectOption><NativeSelectOption value="car">Ô tô</NativeSelectOption></NativeSelect></OperationField><OperationField label="Trạng thái"><NativeSelect value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as AdminPlanStatusFilter)}><NativeSelectOption value="all">Tất cả</NativeSelectOption><NativeSelectOption value="active">Đang hoạt động</NativeSelectOption><NativeSelectOption value="inactive">Đã tắt</NativeSelectOption></NativeSelect></OperationField></CardContent></Card>
}

export function AdminPlanStats({ plans, isLoading }: { plans: ManagerPlan[]; isLoading: boolean }) {
  return <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><AdminStatCard label="Tổng gói" value={isLoading ? '-' : plans.length} detail="Tất cả loại xe" tone="violet" /><AdminStatCard label="Đang hoạt động" value={isLoading ? '-' : plans.filter((item) => item.isActive).length} detail="Có thể đăng ký" tone="emerald" /><AdminStatCard label="Gói xe máy" value={isLoading ? '-' : plans.filter((item) => item.vehicleType === 'motorcycle').length} detail="Dùng sức chứa chung" tone="sky" /><AdminStatCard label="Gói ô tô" value={isLoading ? '-' : plans.filter((item) => item.vehicleType === 'car').length} detail="Chọn ô cố định" tone="amber" /></div>
}

export function AdminPlanList({ plans, isLoading, updatingId, onEdit, onToggle }: { plans: ManagerPlan[]; isLoading: boolean; updatingId: string | null; onEdit: (plan: ManagerPlan) => void; onToggle: (plan: ManagerPlan) => void }) {
  if (isLoading) return <OperationEmpty text="Đang tải danh sách gói..." />
  if (!plans.length) return <OperationEmpty text="Không có gói phù hợp." />
  return <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{plans.map((plan) => <Card key={plan._id} className="transition-shadow hover:shadow-md"><CardHeader className="flex-row items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{plan.code}</p><CardTitle className="mt-2">{plan.name}</CardTitle></div><AdminStatusBadge status={plan.isActive ? 'active' : 'inactive'} /></CardHeader><CardContent><p className="text-3xl font-bold">{formatAdminCurrency(plan.price)}</p><p className="mt-1 text-xs text-muted-foreground">{plan.durationDays} ngày · {plan.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}</p><p className="mt-4 min-h-12 text-sm leading-6 text-muted-foreground">{plan.description || 'Không có mô tả.'}</p></CardContent><CardFooter className="gap-2"><Button className="flex-1" variant="outline" onClick={() => onEdit(plan)}>Chỉnh sửa</Button><Button className="flex-1" variant={plan.isActive ? 'destructive' : 'default'} disabled={updatingId === plan._id} onClick={() => onToggle(plan)}>{updatingId === plan._id ? 'Đang lưu...' : plan.isActive ? 'Tạm dừng' : 'Kích hoạt'}</Button></CardFooter></Card>)}</section>
}

export function AdminPlanFormModal({ plan, isSubmitting, error, onClose, onSubmit }: { plan: ManagerPlan | null; isSubmitting: boolean; error: string | null; onClose: () => void; onSubmit: (payload: ManagerPlanUpdatePayload) => void }) {
  const [name, setName] = useState(''); const [price, setPrice] = useState(''); const [durationDays, setDurationDays] = useState(''); const [description, setDescription] = useState('')
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (plan) { setName(plan.name); setPrice(String(plan.price)); setDurationDays(String(plan.durationDays)); setDescription(plan.description ?? '') } }, [plan])
  function submit(event: FormEvent) { event.preventDefault(); onSubmit({ name: name.trim(), price: Number(price), durationDays: Number(durationDays), description: description.trim() }) }
  return <Dialog open={Boolean(plan)} onOpenChange={(open) => !open && onClose()}><DialogContent><form onSubmit={submit}><DialogHeader><DialogDescription>Admin // Gói gửi xe</DialogDescription><DialogTitle>Chỉnh sửa gói</DialogTitle></DialogHeader><div className="grid gap-4 py-5"><OperationField label="Tên gói"><Input value={name} onChange={(e) => setName(e.target.value)} required /></OperationField><div className="grid gap-4 sm:grid-cols-2"><OperationField label="Giá"><Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required /></OperationField><OperationField label="Thời hạn (ngày)"><Input type="number" min="1" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} required /></OperationField></div><OperationField label="Mô tả"><Textarea className="min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} /></OperationField>{error && <p className="text-sm text-destructive">{error}</p>}</div><DialogFooter><Button type="button" variant="outline" onClick={onClose}>Hủy</Button><Button disabled={isSubmitting}>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</Button></DialogFooter></form></DialogContent></Dialog>
}
