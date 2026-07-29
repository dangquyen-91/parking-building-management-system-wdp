import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { useRef, useState, type FormEvent } from 'react'
import { useFocusTrap } from '../../../hooks/useFocusTrap'
import { useLockBodyScroll } from '../../../hooks/useLockBodyScroll'
import type {
  ManagerPlan,
  ManagerPlanCode,
  ManagerPlanCreatePayload,
  ManagerPlanUpdatePayload,
} from '../../../services/managerPlansApi'
import { OverlayBackdrop } from '../../common'

const PLAN_CODE_OPTIONS: Array<{ value: ManagerPlanCode; label: string; vehicleType: ManagerPlan['vehicleType'] }> = [
  { value: 'MOTO_MONTHLY', label: 'Xe máy - Gói tháng', vehicleType: 'motorcycle' },
  { value: 'MOTO_QUARTERLY', label: 'Xe máy - Gói quý', vehicleType: 'motorcycle' },
  { value: 'CAR_MONTHLY', label: 'Ô tô - Gói tháng', vehicleType: 'car' },
  { value: 'CAR_QUARTERLY', label: 'Ô tô - Gói quý', vehicleType: 'car' },
]

type ManagerPlanFormModalProps = {
  open: boolean
  plan: ManagerPlan | null
  availableCodes: ManagerPlanCode[]
  isSubmitting: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (payload: ManagerPlanCreatePayload | ManagerPlanUpdatePayload) => void
}

export function ManagerPlanFormModal({
  open,
  plan,
  availableCodes,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: ManagerPlanFormModalProps) {
  useLockBodyScroll(open)

  if (!open) return null

  return (
    <ManagerPlanForm
      key={plan?._id ?? availableCodes[0] ?? 'create-plan'}
      plan={plan}
      availableCodes={availableCodes}
      isSubmitting={isSubmitting}
      error={error}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}

function ManagerPlanForm({
  plan,
  availableCodes,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: Omit<ManagerPlanFormModalProps, 'open'>) {
  const isEditing = plan !== null
  const initialCode = plan?.code ?? availableCodes[0] ?? 'MOTO_MONTHLY'
  const initialOption = PLAN_CODE_OPTIONS.find((option) => option.value === initialCode) ?? PLAN_CODE_OPTIONS[0]
  const [code, setCode] = useState<ManagerPlanCode>(initialCode)
  const [vehicleType, setVehicleType] = useState<ManagerPlan['vehicleType']>(
    plan?.vehicleType ?? initialOption.vehicleType,
  )
  const [name, setName] = useState(plan?.name ?? '')
  const [price, setPrice] = useState(plan ? String(plan.price) : '')
  const [durationDays, setDurationDays] = useState(plan ? String(plan.durationDays) : '30')
  const [description, setDescription] = useState(plan?.description ?? '')
  const dialogRef = useRef<HTMLDivElement>(null)

  useFocusTrap(true, dialogRef, onClose)

  const parsedPrice = Number(price)
  const parsedDuration = Number(durationDays)
  const isValid =
    name.trim().length >= 2 &&
    price.trim() !== '' &&
    Number.isInteger(parsedPrice) &&
    parsedPrice >= 0 &&
    Number.isInteger(parsedDuration) &&
    parsedDuration >= 1 &&
    description.trim().length <= 500

  function handleCodeChange(nextCode: ManagerPlanCode) {
    const option = PLAN_CODE_OPTIONS.find((item) => item.value === nextCode)
    setCode(nextCode)
    if (option) setVehicleType(option.vehicleType)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValid || isSubmitting) return

    const commonPayload = {
      name: name.trim(),
      price: parsedPrice,
      durationDays: parsedDuration,
      description: description.trim(),
    }

    onSubmit(
      isEditing
        ? commonPayload
        : {
            ...commonPayload,
            code,
            vehicleType,
            isActive: true,
          },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <OverlayBackdrop
        onClose={onClose}
        label={isEditing ? 'Đóng biểu mẫu chỉnh sửa gói' : 'Đóng biểu mẫu tạo gói'}
        className="fixed inset-0 z-40 bg-overlay/80 backdrop-blur-[2px]"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manager-plan-dialog-title"
        className="relative z-50 max-h-[calc(100vh-3rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-background p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Quản lý // Gói gửi xe
            </p>
            <h2 id="manager-plan-dialog-title" className="mt-2 text-xl font-semibold text-foreground">
              {isEditing ? 'Chỉnh sửa gói' : 'Tạo gói mới'}
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              {isEditing ? plan.code : 'Thiết lập gói cư dân mới để mở bán.'}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Đóng
          </Button>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          {!isEditing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Label className="grid gap-2 text-xs text-muted-foreground">
                Mã gói
                <NativeSelect
                  value={code}
                  onChange={(event) => handleCodeChange(event.target.value as ManagerPlanCode)}
                  required
                >
                  {PLAN_CODE_OPTIONS.filter((option) => availableCodes.includes(option.value)).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </NativeSelect>
              </Label>
              <Label className="grid gap-2 text-xs text-muted-foreground">
                Loại xe
                <NativeSelect value={vehicleType} disabled>
                  <option value="motorcycle">Xe máy</option>
                  <option value="car">Ô tô</option>
                </NativeSelect>
              </Label>
            </div>
          )}

          <Label className="grid gap-2 text-xs text-muted-foreground">
            Tên gói
            <Input
              autoFocus
              value={name}
              maxLength={100}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Label>

          <div className="grid gap-4 sm:grid-cols-2">
            <Label className="grid gap-2 text-xs text-muted-foreground">
              Giá (VND)
              <Input
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
              />
            </Label>
            <Label className="grid gap-2 text-xs text-muted-foreground">
              Thời hạn (ngày)
              <Input
                type="number"
                min="1"
                step="1"
                value={durationDays}
                onChange={(event) => setDurationDays(event.target.value)}
                required
              />
            </Label>
          </div>

          <Label className="grid gap-2 text-xs text-muted-foreground">
            Mô tả
            <Textarea
              className="min-h-[96px]"
              value={description}
              maxLength={500}
              onChange={(event) => setDescription(event.target.value)}
            />
            <span className="text-right">{description.length}/500</span>
          </Label>

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-200">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo gói'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
