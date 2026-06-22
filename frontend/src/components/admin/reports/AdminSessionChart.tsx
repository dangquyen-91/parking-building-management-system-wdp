import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AdminSessionStatsReport } from '../../../services/adminApi'
import { AdminChartEmpty, AdminChartShell, reportAxisStyle, reportColors, reportTooltipStyle, shortAdminDate } from './reportChartConfig'

export function AdminSessionChart({ report }: { report: AdminSessionStatsReport }) {
  const rows = (Array.isArray(report.daily) ? report.daily : []).slice(-14).map((row) => ({ ...row, label: shortAdminDate(row.date) }))
  return <AdminChartShell eyebrow="Lượt xe" title="Lượt xe vào theo ngày" description={`Xe máy: ${report.byVehicleType.motorcycle ?? 0} · Ô tô: ${report.byVehicleType.car ?? 0}`} tone="emerald">{rows.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={rows}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={reportAxisStyle} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={reportAxisStyle} tickLine={false} axisLine={false} width={32} /><Tooltip contentStyle={reportTooltipStyle} formatter={(value) => `${Number(value)} lượt`} /><Line type="monotone" dataKey="count" stroke={reportColors.secondary} strokeWidth={3} dot={{ fill: reportColors.secondary, r: 3 }} /></LineChart></ResponsiveContainer> : <AdminChartEmpty />}</AdminChartShell>
}
