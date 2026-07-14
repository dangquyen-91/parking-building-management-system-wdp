import { ArrowLeft, ArrowRight, Check, ClipboardCheck, QrCode, ScanLine } from 'lucide-react'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'

export type CheckInStep = 1 | 2 | 3

const CHECK_IN_STEPS: Array<{ value: CheckInStep; title: string; description: string; icon: typeof ScanLine }> = [
  { value: 1, title: 'Biển số', description: 'Camera hoặc nhập tay', icon: ScanLine },
  { value: 2, title: 'Thông tin', description: 'Khách, loại xe, ghi chú', icon: ClipboardCheck },
  { value: 3, title: 'Xác minh QR', description: 'Kiểm tra và mở cổng', icon: QrCode },
]

export function CheckInStepHeader({
  step,
  canOpenStep,
  onStepChange,
}: {
  step: CheckInStep
  canOpenStep: (step: CheckInStep) => boolean
  onStepChange: (step: CheckInStep) => void
}) {
  return (
    <div className="grid gap-2 border-b bg-muted/20 p-3 sm:grid-cols-3">
      {CHECK_IN_STEPS.map((item) => {
        const active = step === item.value
        const done = step > item.value
        const canOpen = canOpenStep(item.value)

        return (
          <Button
            key={item.value}
            type="button"
            variant={active ? 'default' : done ? 'secondary' : 'ghost'}
            disabled={!canOpen}
            onClick={() => onStepChange(item.value)}
            className="h-auto min-h-18 justify-start rounded-xl px-3 py-3 text-left"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background/80 text-xs font-semibold text-foreground shadow-sm">
              {done ? <Check className="size-4" /> : <item.icon className="size-4" />}
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold">{item.title}</span>
              <span className="mt-0.5 block text-[11px] opacity-75">{item.description}</span>
            </span>
          </Button>
        )
      })}
    </div>
  )
}

export function StepIntro({ title, description }: { title: string; description: string }) {
  return (
    <Card size="sm" className="border-sky-500/15 bg-gradient-to-r from-sky-500/10 to-transparent shadow-none">
      <CardHeader className="border-l-4 border-sky-500 py-1">
        <CardTitle className="text-base font-bold">{title}</CardTitle>
        <CardDescription className="leading-5">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

export function CheckInWizardActions({
  step,
  canNext,
  canCheckIn,
  isSubmitting,
  onPrevious,
  onNext,
  onCheckIn,
}: {
  step: CheckInStep
  canNext: boolean
  canCheckIn: boolean
  isSubmitting: boolean
  onPrevious?: () => void
  onNext?: () => void
  onCheckIn: () => void
}) {
  return (
    <Card size="sm" className="bg-muted/30 shadow-none">
      <CardContent className="flex flex-col-reverse gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {onPrevious && (
            <Button type="button" variant="outline" onClick={onPrevious} className="h-11 px-4">
              <ArrowLeft className="size-4" />
              Quay lại
            </Button>
          )}
        </div>

        {step < 3 ? (
          <Button type="button" disabled={!canNext} onClick={onNext} className="h-11 bg-sky-600 px-5 text-white hover:bg-sky-700">
            Tiếp tục
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button type="button" onClick={onCheckIn} disabled={!canCheckIn || isSubmitting} className="h-11 bg-emerald-600 px-5 text-white shadow-lg shadow-emerald-500/15 hover:bg-emerald-700">
            {isSubmitting ? 'Đang ghi nhận...' : 'Xác nhận cho xe vào'}
            {!isSubmitting && <ArrowRight className="size-4" />}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
