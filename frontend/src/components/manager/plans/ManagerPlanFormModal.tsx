import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useRef, useState, type FormEvent } from 'react'
import { useFocusTrap } from '../../../hooks/useFocusTrap'
import { useLockBodyScroll } from '../../../hooks/useLockBodyScroll'
import type { ManagerPlan, ManagerPlanUpdatePayload } from '../../../services/managerPlansApi'
import { OverlayBackdrop } from '../../common'

type ManagerPlanFormModalProps = {
  plan: ManagerPlan | null
  isSubmitting: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (payload: ManagerPlanUpdatePayload) => void
}

export function ManagerPlanFormModal({
  plan,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: ManagerPlanFormModalProps) {
  const open = plan !== null

  useLockBodyScroll(open)

  if (!plan) return null

  return (
    <ManagerPlanForm
      key={plan._id}
      plan={plan}
      isSubmitting={isSubmitting}
      error={error}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}

function ManagerPlanForm({
  plan,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: Omit<ManagerPlanFormModalProps, 'plan'> & { plan: ManagerPlan }) {
  const [name, setName] = useState(plan.name)
  const [price, setPrice] = useState(String(plan.price))
  const [durationDays, setDurationDays] = useState(String(plan.durationDays))
  const [description, setDescription] = useState(plan.description ?? '')
  const dialogRef = useRef<HTMLDivElement>(null)

  useFocusTrap(true, dialogRef, onClose)

  const parsedPrice = Number(price)
  const parsedDuration = Number(durationDays)
  const isValid =
    name.trim().length >= 2 &&
    Number.isInteger(parsedPrice) &&
    parsedPrice >= 0 &&
    Number.isInteger(parsedDuration) &&
    parsedDuration >= 1 &&
    description.trim().length <= 500

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValid || isSubmitting) return

    onSubmit({
      name: name.trim(),
      price: parsedPrice,
      durationDays: parsedDuration,
      description: description.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <OverlayBackdrop
        onClose={onClose}
        label="Đóng biểu mẫu chỉnh sửa gói"
        className="fixed inset-0 z-40 bg-overlay/80 backdrop-blur-[2px]"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manager-plan-dialog-title"
        className="relative z-50 w-full max-w-xl rounded-2xl border border-border bg-background p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Quản lý // Gói gửi xe</p>
            <h2 id="manager-plan-dialog-title" className="mt-2 text-xl font-semibold text-foreground">
              Chỉnh sửa gói
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">{plan.code}</p>
          </div>
          <Button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={onClose}>
            Đóng
          </Button>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <Label className="grid gap-2 text-xs text-muted-foreground">
            Tên gói
            <Input
              autoFocus
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
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
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
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
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                value={durationDays}
                onChange={(event) => setDurationDays(event.target.value)}
                required
              />
            </Label>
          </div>

          <Label className="grid gap-2 text-xs text-muted-foreground">
            Mô tả
            <Textarea
              className="min-h-[96px] rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              value={description}
              maxLength={500}
              onChange={(event) => setDescription(event.target.value)}
            />
            <span className="text-right">{description.length}/500</span>
          </Label>

          {error && <div className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</div>}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" className="h-10 rounded-lg border border-border px-4 text-sm text-muted-foreground hover:text-foreground" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}




