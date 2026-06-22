/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'

export const reportColors = { primary: '#8b5cf6', secondary: '#10b981', tertiary: '#f59e0b', quaternary: '#0ea5e9' }
export const reportAxisStyle = { fontSize: 11, fill: 'var(--fg-subtle)' }
export const reportTooltipStyle = { backgroundColor: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: '1rem', color: 'var(--fg)', fontSize: '0.75rem' }

export function AdminChartShell({ eyebrow, title, description, children, tone }: { eyebrow: string; title: string; description: string; children: ReactNode; tone: 'violet' | 'emerald' | 'amber' }) {
  const styles = tone === 'violet'
    ? { bar: 'from-violet-500 to-fuchsia-500', text: 'text-violet-600 dark:text-violet-300' }
    : tone === 'emerald'
      ? { bar: 'from-emerald-500 to-sky-500', text: 'text-emerald-600 dark:text-emerald-300' }
      : { bar: 'from-amber-500 to-orange-500', text: 'text-amber-600 dark:text-amber-300' }
  return <section className="liquid-glass-card rounded-2xl border border-theme p-4 shadow-sm md:p-5"><span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${styles.bar}`} /><p className={`text-[10px] font-black uppercase tracking-[0.18em] ${styles.text}`}>{eyebrow}</p><h2 className="mt-1 text-lg font-black text-fg">{title}</h2><p className="mt-1 text-xs text-muted">{description}</p><div className="mt-5 h-72">{children}</div></section>
}

export function AdminChartEmpty() {
  return <p className="flex h-full items-center justify-center text-sm text-subtle">Chưa có dữ liệu trong khoảng này.</p>
}

export function shortAdminDate(date: string) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(new Date(`${date}T00:00:00`))
}

export function compactAdminCurrency(value: number) {
  return value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}tr` : value >= 1_000 ? `${Math.round(value / 1_000)}k` : String(value)
}
