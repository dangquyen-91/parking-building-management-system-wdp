/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'

export const reportColors = {
  primary: '#6366f1',
  secondary: '#22c55e',
  tertiary: '#f59e0b',
  quaternary: '#06b6d4',
}

export const reportAxisStyle = {
  fontSize: 11,
  fill: 'var(--fg-subtle)',
}

export const reportTooltipStyle = {
  backgroundColor: 'var(--page-bg)',
  border: '1px solid var(--border)',
  borderRadius: '0.5rem',
  color: 'var(--fg)',
  fontSize: '0.75rem',
}

export function AdminChartShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  tone?: 'violet' | 'emerald' | 'amber'
}) {
  return (
    <section className="rounded-lg bg-card p-4 text-card-foreground ring-1 ring-border md:p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <div className="mt-5 h-72 w-full">{children}</div>
    </section>
  )
}

export function AdminChartEmpty() {
  return (
    <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
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
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`
  return String(value)
}
