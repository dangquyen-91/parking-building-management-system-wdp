import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ReactNode } from 'react'
import type { AdminOccupancyReport, AdminPeakHoursReport, AdminRevenueReport, AdminSessionStatsReport } from '../../services/adminApi'
import { formatAdminCurrency } from './adminData'

const colors = { primary: '#8b5cf6', secondary: '#10b981', tertiary: '#f59e0b', quaternary: '#0ea5e9' }
const axisStyle = { fontSize: 11, fill: 'var(--fg-subtle)' }
const tooltipStyle = { backgroundColor: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: '1rem', color: 'var(--fg)', fontSize: '0.75rem' }

export function AdminReportFilters({ from, to, peakDays, loading, onFromChange, onToChange, onPeakDaysChange, onApply }: { from: string; to: string; peakDays: number; loading: boolean; onFromChange: (value: string) => void; onToChange: (value: string) => void; onPeakDaysChange: (value: number) => void; onApply: () => void }) {
  return (
    <section className="liquid-glass-card mb-5 rounded-2xl border border-violet-500/15 p-4 shadow-sm">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
        <DateField label="Từ ngày" value={from} max={to} onChange={onFromChange} />
        <DateField label="Đến ngày" value={to} min={from} onChange={onToChange} />
        <label className="text-xs font-medium text-muted">
          Khoảng giờ cao điểm
          <select value={peakDays} onChange={(event) => onPeakDaysChange(Number(event.target.value))} className="mt-1.5 h-11 w-full rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none focus:border-amber-500">
            <option value={7}>7 ngày gần nhất</option>
            <option value={14}>14 ngày gần nhất</option>
            <option value={30}>30 ngày gần nhất</option>
          </select>
        </label>
        <button type="button" disabled={loading || !from || !to || from > to} onClick={onApply} className="h-11 rounded-xl bg-gradient-to-r from-violet-500 to-sky-500 px-5 text-sm font-black text-white shadow-lg shadow-violet-500/20 disabled:opacity-50">
          {loading ? 'Đang tải...' : 'Áp dụng'}
        </button>
      </div>
    </section>
  )
}

export function AdminRevenueChart({ report }: { report: AdminRevenueReport }) {
  const rows = report.daily.slice(-14).map((row) => ({ ...row, label: shortDate(row.date) }))
  return (
    <ChartShell eyebrow="Doanh thu" title="Doanh thu theo ngày" description="Tối đa 14 ngày gần nhất theo từng nguồn." tone="violet">
      {rows.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={rows}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} /><YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={compactCurrency} width={42} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => formatAdminCurrency(Number(value))} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="subscription" name="Gói gửi xe" stackId="r" fill={colors.primary} /><Bar dataKey="booking" name="Booking" stackId="r" fill={colors.secondary} /><Bar dataKey="sessionTransfer" name="Chuyển khoản" stackId="r" fill={colors.tertiary} /><Bar dataKey="sessionCash" name="Tiền mặt" stackId="r" fill={colors.quaternary} /></BarChart></ResponsiveContainer> : <Empty />}
    </ChartShell>
  )
}

export function AdminSessionChart({ report }: { report: AdminSessionStatsReport }) {
  const rows = report.daily.slice(-14).map((row) => ({ ...row, label: shortDate(row.date) }))
  return (
    <ChartShell eyebrow="Lượt xe" title="Lượt xe vào theo ngày" description={`Xe máy: ${report.byVehicleType.motorcycle ?? 0} · Ô tô: ${report.byVehicleType.car ?? 0}`} tone="emerald">
      {rows.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={rows}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} width={32} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => `${Number(value)} lượt`} /><Line type="monotone" dataKey="count" stroke={colors.secondary} strokeWidth={3} dot={{ fill: colors.secondary, r: 3 }} /></LineChart></ResponsiveContainer> : <Empty />}
    </ChartShell>
  )
}

export function AdminPeakHoursChart({ report }: { report: AdminPeakHoursReport }) {
  const rows = report.hourly.map((row) => ({ ...row, label: `${String(row.hour).padStart(2, '0')}:00` }))
  return (
    <ChartShell eyebrow="Vận hành" title="Giờ xe vào cao điểm" description={`Cao nhất lúc ${String(report.peakHour.hour).padStart(2, '0')}:00 với ${report.peakHour.count} lượt.`} tone="amber">
      <ResponsiveContainer width="100%" height="100%"><BarChart data={rows}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" interval={2} tick={axisStyle} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} width={32} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => `${Number(value)} lượt`} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="motorcycle" name="Xe máy" stackId="v" fill={colors.quaternary} /><Bar dataKey="car" name="Ô tô" stackId="v" fill={colors.tertiary} /></BarChart></ResponsiveContainer>
    </ChartShell>
  )
}

export function AdminOccupancyTable({ report }: { report: AdminOccupancyReport }) {
  return (
    <section className="liquid-glass-card rounded-2xl border border-sky-500/15 p-4 shadow-sm md:p-5">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 to-emerald-500" />
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">Công suất hiện tại</p>
      <h2 className="mt-1 text-lg font-black text-fg">Tình trạng theo tầng</h2>
      {!report.floors.length ? <p className="py-8 text-center text-sm text-subtle">Chưa có dữ liệu tầng.</p> : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-y border-theme bg-page/35 text-xs text-subtle"><tr><th className="px-3 py-3">Tòa nhà / Tầng</th><th className="px-3 py-3">Loại xe</th><th className="px-3 py-3">Đang đỗ</th><th className="px-3 py-3">Còn trống</th><th className="px-3 py-3">Khác</th><th className="px-3 py-3">Sử dụng</th></tr></thead>
            <tbody>{report.floors.map((floor) => <tr key={floor.floorId} className="border-b border-theme transition-colors last:border-0 hover:bg-sky-500/5"><td className="px-3 py-3"><p className="font-bold text-fg">{floor.building?.name ?? 'Chưa xác định'}</p><p className="text-xs text-subtle">Tầng {floor.floorNumber}</p></td><td className="px-3 py-3 text-muted">{floor.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}</td><td className="px-3 py-3 font-bold text-fg">{floor.occupied}</td><td className="px-3 py-3 text-muted">{floor.empty}</td><td className="px-3 py-3 text-muted">Đặt {floor.reserved ?? 0} · Bảo trì {floor.maintenance ?? 0}</td><td className="px-3 py-3"><div className="flex items-center gap-3"><div className="h-2.5 w-24 overflow-hidden rounded-full bg-page"><div className={`h-full rounded-full ${floor.utilizationPercent >= 90 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-sky-500 to-emerald-500'}`} style={{ width: `${Math.min(100, floor.utilizationPercent)}%` }} /></div><span className="font-bold text-fg">{floor.utilizationPercent}%</span></div></td></tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function ChartShell({ eyebrow, title, description, children, tone }: { eyebrow: string; title: string; description: string; children: ReactNode; tone: 'violet' | 'emerald' | 'amber' }) {
  const styles = tone === 'violet'
    ? { bar: 'from-violet-500 to-fuchsia-500', text: 'text-violet-600 dark:text-violet-300' }
    : tone === 'emerald'
      ? { bar: 'from-emerald-500 to-cyan-400', text: 'text-emerald-600 dark:text-emerald-300' }
      : { bar: 'from-amber-500 to-orange-500', text: 'text-amber-600 dark:text-amber-300' }
  return <section className="liquid-glass-card rounded-2xl border border-theme p-4 shadow-sm md:p-5"><span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${styles.bar}`} /><p className={`text-[10px] font-black uppercase tracking-[0.18em] ${styles.text}`}>{eyebrow}</p><h2 className="mt-1 text-lg font-black text-fg">{title}</h2><p className="mt-1 text-xs text-muted">{description}</p><div className="mt-5 h-72 w-full">{children}</div></section>
}

function Empty() { return <p className="flex h-full items-center justify-center text-sm text-subtle">Chưa có dữ liệu trong khoảng này.</p> }
function DateField({ label, value, min, max, onChange }: { label: string; value: string; min?: string; max?: string; onChange: (value: string) => void }) { return <label className="text-xs font-medium text-muted">{label}<input type="date" value={value} min={min} max={max} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none focus:border-violet-500" /></label> }
function shortDate(date: string) { return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(new Date(`${date}T00:00:00`)) }
function compactCurrency(value: number) { return value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}tr` : value >= 1_000 ? `${Math.round(value / 1_000)}k` : String(value) }
