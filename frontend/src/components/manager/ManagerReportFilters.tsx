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
    <section className="liquid-glass-card mb-5 rounded-lg p-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
        <label className="text-xs font-medium text-muted">
          Từ ngày
          <input
            type="date"
            value={from}
            max={to}
            onChange={(event) => onFromChange(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-theme bg-page px-3 py-2.5 text-sm text-fg outline-none focus:border-accent"
          />
        </label>

        <label className="text-xs font-medium text-muted">
          Đến ngày
          <input
            type="date"
            value={to}
            min={from}
            onChange={(event) => onToChange(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-theme bg-page px-3 py-2.5 text-sm text-fg outline-none focus:border-accent"
          />
        </label>

        <label className="text-xs font-medium text-muted">
          Khoảng giờ cao điểm
          <select
            value={peakDays}
            onChange={(event) => onPeakDaysChange(Number(event.target.value))}
            className="mt-1.5 w-full rounded-lg border border-theme bg-page px-3 py-2.5 text-sm text-fg outline-none focus:border-accent"
          >
            <option value={7}>7 ngày gần nhất</option>
            <option value={14}>14 ngày gần nhất</option>
            <option value={30}>30 ngày gần nhất</option>
          </select>
        </label>

        <button
          type="button"
          disabled={loading || !from || !to || from > to}
          onClick={onApply}
          className="rounded-lg bg-btn-primary px-5 py-2.5 text-sm font-semibold text-btn-primary-fg transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Đang tải...' : 'Áp dụng'}
        </button>
      </div>
    </section>
  )
}
