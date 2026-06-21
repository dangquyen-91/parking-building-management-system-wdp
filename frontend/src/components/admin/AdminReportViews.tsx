import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ReactNode } from 'react'
import type { AdminOccupancyReport, AdminPeakHoursReport, AdminRevenueReport, AdminSessionStatsReport } from '../../services/adminApi'
import { formatAdminCurrency } from './adminData'

const colors = { primary: '#6366f1', secondary: '#22c55e', tertiary: '#f59e0b', quaternary: '#06b6d4' }
const axisStyle = { fontSize: 11, fill: 'var(--fg-subtle)' }
const tooltipStyle = { backgroundColor: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--fg)', fontSize: '0.75rem' }

export function AdminReportFilters({ from, to, peakDays, loading, onFromChange, onToChange, onPeakDaysChange, onApply }: { from: string; to: string; peakDays: number; loading: boolean; onFromChange: (value: string) => void; onToChange: (value: string) => void; onPeakDaysChange: (value: number) => void; onApply: () => void }) {
  return <section className="liquid-glass-card mb-5 rounded-lg p-4"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
    <DateField label="Từ ngày" value={from} max={to} onChange={onFromChange} />
    <DateField label="Đến ngày" value={to} min={from} onChange={onToChange} />
    <label className="text-xs font-medium text-muted">Khoảng giờ cao điểm<select value={peakDays} onChange={(e) => onPeakDaysChange(Number(e.target.value))} className="mt-1.5 w-full rounded-lg border border-theme bg-page px-3 py-2.5 text-sm text-fg"><option value={7}>7 ngày gần nhất</option><option value={14}>14 ngày gần nhất</option><option value={30}>30 ngày gần nhất</option></select></label>
    <button type="button" disabled={loading || !from || !to || from > to} onClick={onApply} className="rounded-lg bg-btn-primary px-5 py-2.5 text-sm font-semibold text-btn-primary-fg disabled:opacity-50">{loading ? 'Đang tải...' : 'Áp dụng'}</button>
  </div></section>
}

export function AdminRevenueChart({ report }: { report: AdminRevenueReport }) {
  const rows = report.daily.slice(-14).map((row) => ({ ...row, label: shortDate(row.date) }))
  return <ChartShell eyebrow="Doanh thu" title="Doanh thu theo ngày" description="Tối đa 14 ngày gần nhất theo từng nguồn.">{rows.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={rows}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} /><YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={compactCurrency} width={42} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => formatAdminCurrency(Number(value))} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="subscription" name="Gói gửi xe" stackId="r" fill={colors.primary} /><Bar dataKey="booking" name="Booking" stackId="r" fill={colors.secondary} /><Bar dataKey="sessionTransfer" name="Chuyển khoản" stackId="r" fill={colors.tertiary} /><Bar dataKey="sessionCash" name="Tiền mặt" stackId="r" fill={colors.quaternary} /></BarChart></ResponsiveContainer> : <Empty />}</ChartShell>
}

export function AdminSessionChart({ report }: { report: AdminSessionStatsReport }) {
  const rows = report.daily.slice(-14).map((row) => ({ ...row, label: shortDate(row.date) }))
  return <ChartShell eyebrow="Lượt xe" title="Lượt xe vào theo ngày" description={`Xe máy: ${report.byVehicleType.motorcycle ?? 0} · Ô tô: ${report.byVehicleType.car ?? 0}`}>{rows.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={rows}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} width={32} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => `${Number(value)} lượt`} /><Line type="monotone" dataKey="count" stroke={colors.primary} strokeWidth={3} /></LineChart></ResponsiveContainer> : <Empty />}</ChartShell>
}

export function AdminPeakHoursChart({ report }: { report: AdminPeakHoursReport }) {
  const rows = report.hourly.map((row) => ({ ...row, label: `${String(row.hour).padStart(2, '0')}:00` }))
  return <ChartShell eyebrow="Vận hành" title="Giờ xe vào cao điểm" description={`Cao nhất lúc ${String(report.peakHour.hour).padStart(2, '0')}:00 với ${report.peakHour.count} lượt.`}><ResponsiveContainer width="100%" height="100%"><BarChart data={rows}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" interval={2} tick={axisStyle} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} width={32} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => `${Number(value)} lượt`} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="motorcycle" name="Xe máy" stackId="v" fill={colors.primary} /><Bar dataKey="car" name="Ô tô" stackId="v" fill={colors.secondary} /></BarChart></ResponsiveContainer></ChartShell>
}

export function AdminOccupancyTable({ report }: { report: AdminOccupancyReport }) {
  return <section className="liquid-glass-card rounded-lg p-4 md:p-5"><p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Công suất hiện tại</p><h2 className="mt-1 text-base font-semibold text-fg">Tình trạng theo tầng</h2>{!report.floors.length ? <p className="py-8 text-center text-sm text-subtle">Chưa có dữ liệu tầng.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-theme text-xs text-subtle"><tr><th className="px-3 py-3">Tòa nhà / Tầng</th><th className="px-3 py-3">Loại xe</th><th className="px-3 py-3">Đang đỗ</th><th className="px-3 py-3">Còn trống</th><th className="px-3 py-3">Khác</th><th className="px-3 py-3">Sử dụng</th></tr></thead><tbody>{report.floors.map((floor) => <tr key={floor.floorId} className="border-b border-theme last:border-0"><td className="px-3 py-3"><p className="font-medium text-fg">{floor.building?.name ?? 'Chưa xác định'}</p><p className="text-xs text-subtle">Tầng {floor.floorNumber}</p></td><td className="px-3 py-3 text-muted">{floor.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}</td><td className="px-3 py-3 font-semibold text-fg">{floor.occupied}</td><td className="px-3 py-3 text-muted">{floor.empty}</td><td className="px-3 py-3 text-muted">Đặt {floor.reserved ?? 0} · Bảo trì {floor.maintenance ?? 0}</td><td className="px-3 py-3"><div className="flex items-center gap-3"><div className="h-2 w-24 overflow-hidden rounded-full bg-badge"><div className="h-full bg-btn-primary" style={{ width: `${Math.min(100, floor.utilizationPercent)}%` }} /></div><span className="font-semibold text-fg">{floor.utilizationPercent}%</span></div></td></tr>)}</tbody></table></div>}</section>
}

function ChartShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) { return <section className="liquid-glass-card rounded-lg p-4 md:p-5"><p className="text-[10px] uppercase tracking-[0.18em] text-subtle">{eyebrow}</p><h2 className="mt-1 text-base font-semibold text-fg">{title}</h2><p className="mt-1 text-xs text-muted">{description}</p><div className="mt-5 h-72 w-full">{children}</div></section> }
function Empty() { return <p className="flex h-full items-center justify-center text-sm text-subtle">Chưa có dữ liệu trong khoảng này.</p> }
function DateField({ label, value, min, max, onChange }: { label: string; value: string; min?: string; max?: string; onChange: (value: string) => void }) { return <label className="text-xs font-medium text-muted">{label}<input type="date" value={value} min={min} max={max} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-lg border border-theme bg-page px-3 py-2.5 text-sm text-fg" /></label> }
function shortDate(date: string) { return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(new Date(`${date}T00:00:00`)) }
function compactCurrency(value: number) { return value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}tr` : value >= 1_000 ? `${Math.round(value / 1_000)}k` : String(value) }
