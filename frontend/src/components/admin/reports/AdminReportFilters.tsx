function DateField({ label, value, min, max, onChange }: { label: string; value: string; min?: string; max?: string; onChange: (value: string) => void }) {
  return <label className="text-xs font-medium text-muted">{label}<input type="date" value={value} min={min} max={max} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none focus:border-violet-500" /></label>
}

export function AdminReportFilters({ from, to, peakDays, loading, onFromChange, onToChange, onPeakDaysChange, onApply }: { from: string; to: string; peakDays: number; loading: boolean; onFromChange: (value: string) => void; onToChange: (value: string) => void; onPeakDaysChange: (value: number) => void; onApply: () => void }) {
  return (
    <section className="liquid-glass-card mb-5 rounded-2xl border border-violet-500/15 p-4 shadow-sm">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
        <DateField label="Từ ngày" value={from} max={to} onChange={onFromChange} />
        <DateField label="Đến ngày" value={to} min={from} onChange={onToChange} />
        <label className="text-xs font-medium text-muted">Khoảng giờ cao điểm<select value={peakDays} onChange={(event) => onPeakDaysChange(Number(event.target.value))} className="mt-1.5 h-11 w-full rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none focus:border-amber-500"><option value={7}>7 ngày gần nhất</option><option value={14}>14 ngày gần nhất</option><option value={30}>30 ngày gần nhất</option></select></label>
        <button type="button" disabled={loading || !from || !to || from > to} onClick={onApply} className="h-11 rounded-xl bg-gradient-to-r from-violet-500 to-sky-500 px-5 text-sm font-black text-white shadow-lg shadow-violet-500/20 disabled:opacity-50">{loading ? 'Đang tải...' : 'Áp dụng'}</button>
      </div>
    </section>
  )
}
