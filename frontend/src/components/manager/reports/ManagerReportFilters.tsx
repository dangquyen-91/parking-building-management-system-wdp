import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
type ManagerReportFiltersProps = {
  from: string
  to: string
  peakDays: number
  loading: boolean
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onPeakDaysChange: (value: number) => void
  onApply: () => void
}

export function ManagerReportFilters({
  from,
  to,
  peakDays,
  loading,
  onFromChange,
  onToChange,
  onPeakDaysChange,
  onApply,
}: ManagerReportFiltersProps) {
  return (
    <section className="bg-card text-card-foreground ring-1 ring-border mb-5 rounded-lg p-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
        <Label className="text-xs font-medium text-muted-foreground">
          Từ ngày
          <Input
            type="date"
            value={from}
            max={to}
            onChange={(event) => onFromChange(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </Label>

        <Label className="text-xs font-medium text-muted-foreground">
          Đến ngày
          <Input
            type="date"
            value={to}
            min={from}
            onChange={(event) => onToChange(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </Label>

        <Label className="text-xs font-medium text-muted-foreground">
          Khoảng giờ cao điểm
          <NativeSelect
            value={peakDays}
            onChange={(event) => onPeakDaysChange(Number(event.target.value))}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value={7}>7 ngày gần nhất</option>
            <option value={14}>14 ngày gần nhất</option>
            <option value={30}>30 ngày gần nhất</option>
          </NativeSelect>
        </Label>

        <Button
          type="button"
          disabled={loading || !from || !to || from > to}
          onClick={onApply}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Đang tải...' : 'Áp dụng'}
        </Button>
      </div>
    </section>
  )
}




