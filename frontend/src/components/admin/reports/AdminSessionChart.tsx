import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AdminSessionStatsReport } from '../../../services/adminApi'
import {
  AdminChartEmpty,
  AdminChartShell,
  reportAxisStyle,
  reportColors,
  reportTooltipStyle,
  shortAdminDate,
} from './reportChartConfig'

export function AdminSessionChart({
  report,
}: {
  report: AdminSessionStatsReport
}) {
  const rows = (report.daily ?? []).slice(-14).map((row) => ({
    ...row,
    count: row.count ?? row.total ?? 0,
    motorcycle: row.motorcycle ?? 0,
    car: row.car ?? 0,
    label: shortAdminDate(row.date),
  }))

  return (
    <AdminChartShell
      eyebrow="Lượt xe"
      title="Lượt xe vào theo ngày"
      description={`Xe máy: ${report.byVehicleType?.motorcycle ?? 0} · Ô tô: ${report.byVehicleType?.car ?? 0}`}
    >
      {rows.length === 0 ? (
        <AdminChartEmpty />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={rows}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="label"
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
              formatter={(value, name) => [`${Number(value)} lượt`, name]}
            />
            <Legend
              wrapperStyle={{ color: 'var(--fg-muted)', fontSize: 11 }}
            />
            <Line
              type="monotone"
              dataKey="count"
              name="Tổng lượt"
              stroke={reportColors.primary}
              strokeWidth={3}
              dot={{ r: 3, fill: reportColors.primary }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="motorcycle"
              name="Xe máy"
              stroke={reportColors.secondary}
              strokeWidth={2}
              dot={{ r: 2, fill: reportColors.secondary }}
            />
            <Line
              type="monotone"
              dataKey="car"
              name="Ô tô"
              stroke={reportColors.tertiary}
              strokeWidth={2}
              dot={{ r: 2, fill: reportColors.tertiary }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </AdminChartShell>
  )
}
