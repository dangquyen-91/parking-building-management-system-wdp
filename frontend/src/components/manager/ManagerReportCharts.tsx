import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type {
  ManagerPeakHoursReport,
  ManagerRevenueReport,
  ManagerSessionReport,
} from '../../services/managerReportsApi'
import { formatCurrency } from './managerData'

const chartColors = {
  primary: '#6366f1',
  secondary: '#22c55e',
  tertiary: '#f59e0b',
  quaternary: '#06b6d4',
}

const axisStyle = { fontSize: 11, fill: 'var(--fg-subtle)' }
const tooltipStyle = {
  backgroundColor: 'var(--page-bg)',
  border: '1px solid var(--border)',
  borderRadius: '0.5rem',
  color: 'var(--fg)',
  fontSize: '0.75rem',
}

function shortDate(date: string) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(
    new Date(`${date}T00:00:00`),
  )
}

function compactCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`
  return String(value)
}

function EmptyChart() {
  return <p className="flex h-64 items-center justify-center text-sm text-subtle">Chưa có dữ liệu trong khoảng này.</p>
}

export function ManagerRevenueChart({ report }: { report: ManagerRevenueReport }) {
  const rows = report.daily.slice(-14).map((row) => ({ ...row, label: shortDate(row.date) }))

  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Doanh thu</p>
      <h2 className="mt-1 text-base font-semibold text-fg">Doanh thu theo ngày</h2>
      <p className="mt-1 text-xs text-muted">Hiển thị tối đa 14 ngày gần nhất và từng nguồn doanh thu.</p>

      {rows.length === 0 ? (
        <EmptyChart />
      ) : (
        <div className="mt-5 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={compactCurrency} width={42} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: 'var(--fg)', fontWeight: 600 }}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Legend wrapperStyle={{ color: 'var(--fg-muted)', fontSize: 11 }} />
              <Bar dataKey="subscription" name="Gói gửi xe" stackId="revenue" fill={chartColors.primary} />
              <Bar dataKey="booking" name="Booking" stackId="revenue" fill={chartColors.secondary} />
              <Bar dataKey="sessionTransfer" name="Chuyển khoản" stackId="revenue" fill={chartColors.tertiary} />
              <Bar dataKey="sessionCash" name="Tiền mặt" stackId="revenue" fill={chartColors.quaternary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

export function ManagerSessionChart({ report }: { report: ManagerSessionReport }) {
  const rows = report.daily.slice(-14).map((row) => ({ ...row, label: shortDate(row.date) }))

  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Lượt xe</p>
      <h2 className="mt-1 text-base font-semibold text-fg">Lượt xe vào theo ngày</h2>
      <p className="mt-1 text-xs text-muted">
        Xe máy: {report.byVehicleType.motorcycle ?? 0} · Ô tô: {report.byVehicleType.car ?? 0}
      </p>

      {rows.length === 0 ? (
        <EmptyChart />
      ) : (
        <div className="mt-5 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} width={32} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: 'var(--fg)', fontWeight: 600 }}
                formatter={(value) => [`${Number(value)} lượt`, 'Lượt xe vào']}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Lượt xe vào"
                stroke={chartColors.primary}
                strokeWidth={3}
                dot={{ r: 3, fill: chartColors.primary }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

export function ManagerPeakHoursChart({ report }: { report: ManagerPeakHoursReport }) {
  const rows = report.hourly.map((row) => ({
    ...row,
    label: `${String(row.hour).padStart(2, '0')}:00`,
  }))

  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Vận hành</p>
      <h2 className="mt-1 text-base font-semibold text-fg">Giờ xe vào cao điểm</h2>
      <p className="mt-1 text-xs text-muted">
        Cao nhất lúc {String(report.peakHour.hour).padStart(2, '0')}:00 với {report.peakHour.count} lượt trong {report.days} ngày.
      </p>

      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              interval={2}
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
            />
            <YAxis allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} width={32} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: 'var(--fg)', fontWeight: 600 }}
              formatter={(value) => `${Number(value)} lượt`}
            />
            <Legend wrapperStyle={{ color: 'var(--fg-muted)', fontSize: 11 }} />
            <Bar dataKey="motorcycle" name="Xe máy" stackId="vehicles" fill={chartColors.primary} />
            <Bar dataKey="car" name="Ô tô" stackId="vehicles" fill={chartColors.secondary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
