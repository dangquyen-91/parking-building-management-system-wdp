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
import type { AdminRevenueByVehicleReport } from '../../../services/adminApi'
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

export function AdminRevenueByVehicleChart({
  report,
}: {
  report: AdminRevenueByVehicleReport
}) {
  const rows = (report.periods ?? []).slice(-14).map((row) => ({
    label:
      report.groupBy === 'week' || report.groupBy === 'month'
        ? row.period
        : shortAdminDate(row.period),
    motorcycle: row.motorcycle?.total ?? 0,
    car: row.car?.total ?? 0,
  }))

  return (
    <AdminChartShell
      eyebrow="Phân loại"
      title="Doanh thu xe máy và ô tô"
      description="So sánh doanh thu theo loại xe trong khoảng ngày đã chọn."
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
              labelStyle={{ color: 'var(--fg)', fontWeight: 600 }}
              formatter={(value) => formatAdminCurrency(Number(value))}
            />
            <Legend
              wrapperStyle={{ color: 'var(--fg-muted)', fontSize: 11 }}
            />
            <Bar
              dataKey="motorcycle"
              name="Xe máy"
              fill={reportColors.primary}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="car"
              name="Ô tô"
              fill={reportColors.secondary}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </AdminChartShell>
  )
}
