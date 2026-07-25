/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card'

export const reportColors = {
  primary: '#8b5cf6',
  secondary: '#10b981',
  tertiary: '#f59e0b',
  quaternary: '#0ea5e9',
}
export const reportAxisStyle = { fontSize: 11, fill: 'var(--fg-subtle)' }
export const reportTooltipStyle = {
  backgroundColor: 'var(--page-bg)',
  border: '1px solid var(--border)',
  borderRadius: '1rem',
  color: 'var(--fg)',
  fontSize: '0.75rem',
}

export function AdminChartShell({
  eyebrow,
  title,
  description,
  children,
  tone,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  tone: 'violet' | 'emerald' | 'amber'
}) {
  void tone
  return (
    <Card>
      <CardHeader>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">{children}</div>
      </CardContent>
    </Card>
  )
}

export function AdminChartEmpty() {
  return (
    <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Chưa có dữ liệu trong khoảng này.
    </p>
  )
}

export function shortAdminDate(date: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${date}T00:00:00`))
}

export function compactAdminCurrency(value: number) {
  return value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(1)}tr`
    : value >= 1_000
      ? `${Math.round(value / 1_000)}k`
      : String(value)
}
