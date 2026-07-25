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
import type { AdminRevenueReport } from '../../../services/adminApi'
import { formatAdminCurrency } from '../adminData'
import {
  AdminChartEmpty,
  AdminChartShell,
  compactAdminCurrency,
  reportAxisStyle,
  reportColors,
  reportTooltipStyle,
  shortAdminDate,
} from './reportChartConfig'

export function AdminRevenueChart({ report }: { report: AdminRevenueReport }) {
  const sourceRows = Array.isArray(report.periods)
    ? report.periods.map((row) => ({ ...row, date: row.period }))
    : Array.isArray(report.daily)
      ? report.daily
      : []
  const rows = sourceRows.slice(-14).map((row) => ({
    ...row,
    label:
      report.groupBy === 'week' || report.groupBy === 'month'
        ? row.date
        : shortAdminDate(row.date),
  }))
  return (
    <AdminChartShell
      eyebrow="Doanh thu"
      title="Doanh thu theo ngày"
      description="Tối đa 14 ngày gần nhất theo từng nguồn."
      tone="violet"
    >
      {rows.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows}>
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
              tick={reportAxisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={compactAdminCurrency}
              width={42}
            />
            <Tooltip
              contentStyle={reportTooltipStyle}
              formatter={(value) => formatAdminCurrency(Number(value))}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar
              dataKey="subscription"
              name="Gói gửi xe"
              stackId="r"
              fill={reportColors.primary}
            />
            <Bar
              dataKey="booking"
              name="Booking"
              stackId="r"
              fill={reportColors.secondary}
            />
            <Bar
              dataKey="sessionTransfer"
              name="Chuyển khoản"
              stackId="r"
              fill={reportColors.tertiary}
            />
            <Bar
              dataKey="sessionCash"
              name="Tiền mặt"
              stackId="r"
              fill={reportColors.quaternary}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <AdminChartEmpty />
      )}
    </AdminChartShell>
  )
}
