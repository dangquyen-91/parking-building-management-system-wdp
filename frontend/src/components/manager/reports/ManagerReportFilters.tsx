import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ManagerReportFiltersProps = {
  from: string
  to: string
  loading: boolean
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onApply: () => void
}

export function ManagerReportFilters({
  from,
  to,
  loading,
  onFromChange,
  onToChange,
  onApply,
}: ManagerReportFiltersProps) {
  return (
    <section className="mb-5 rounded-lg bg-card p-4 text-card-foreground ring-1 ring-border">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto] xl:items-end">
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
