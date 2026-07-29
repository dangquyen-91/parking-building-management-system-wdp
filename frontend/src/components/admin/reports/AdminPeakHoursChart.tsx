import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AdminPeakHoursReport } from '../../../services/adminApi'
import {
  AdminChartEmpty,
  AdminChartShell,
  reportAxisStyle,
  reportColors,
  reportTooltipStyle,
} from './reportChartConfig'

export function AdminPeakHoursChart({
  report,
}: {
  report: AdminPeakHoursReport
}) {
  const rows = (Array.isArray(report.hourly) ? report.hourly : []).map(
    (row) => ({ ...row, label: `${String(row.hour).padStart(2, '0')}:00` }),
  )
  const peakHour = report.peakHour ?? { hour: 0, count: 0 }
  return (
    <AdminChartShell
      eyebrow="Vận hành"
      title="Giờ xe vào cao điểm"
      description={`Cao nhất lúc ${String(peakHour.hour).padStart(2, '0')}:00 với ${peakHour.count} lượt trong ${report.days ?? 0} ngày.`}
    >
      {rows.length === 0 ? (
        <AdminChartEmpty />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
          >
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            interval={2}
            tick={reportAxisStyle}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={reportAxisStyle}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={reportTooltipStyle}
            labelStyle={{ color: 'var(--fg)', fontWeight: 600 }}
            formatter={(value) => `${Number(value)} lượt`}
          />
          <Legend
            wrapperStyle={{ color: 'var(--fg-muted)', fontSize: 11 }}
          />
          <Bar
            dataKey="motorcycle"
            name="Xe máy"
            stackId="v"
            fill={reportColors.quaternary}
          />
          <Bar
            dataKey="car"
            name="Ô tô"
            stackId="v"
            fill={reportColors.tertiary}
          />
          </BarChart>
        </ResponsiveContainer>
      )}
    </AdminChartShell>
  )
}
