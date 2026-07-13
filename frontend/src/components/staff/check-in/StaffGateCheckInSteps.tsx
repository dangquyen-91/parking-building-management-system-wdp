import { Check } from 'lucide-react'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'

export type CheckInStep = 1 | 2 | 3 | 4

const CHECK_IN_STEPS: Array<{ value: CheckInStep; title: string; description: string }> = [
  { value: 1, title: 'Biển số', description: 'Camera hoặc nhập tay' },
  { value: 2, title: 'Thông tin', description: 'Loại khách và hồ sơ' },
  { value: 3, title: 'QR', description: 'Xác minh đúng xe' },
  { value: 4, title: 'Vị trí', description: 'Loại xe, tầng, ghi chú' },
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
    <div className="grid gap-2 border-b p-3 sm:grid-cols-4">
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
            className="h-auto min-h-16 justify-start px-3 py-3 text-left"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-background/20 text-xs font-semibold">
              {done ? <Check className="size-4" /> : item.value}
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
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
    <Card size="sm">
      <CardContent className="flex flex-col-reverse gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {onPrevious && (
            <Button type="button" variant="outline" onClick={onPrevious}>
              Quay lại
            </Button>
          )}
        </div>

        {step < 4 ? (
          <Button type="button" disabled={!canNext} onClick={onNext}>
            Tiếp tục
          </Button>
        ) : (
          <Button type="button" onClick={onCheckIn} disabled={!canCheckIn || isSubmitting}>
            {isSubmitting ? 'Đang ghi nhận...' : 'Xác nhận cho xe vào'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
