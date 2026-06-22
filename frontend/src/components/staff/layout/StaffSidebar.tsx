import { forwardRef } from 'react'
import { NavLink } from 'react-router-dom'
import { ThemeToggle } from '../../common'
import { LogoIcon } from '../../common/icons'
import { LogoutButton } from '../../common/LogoutButton'

const STAFF_NAV_ITEMS = [
  { to: '/staff', label: 'Cổng xe vào/ra', detail: 'Check-in, checkout', icon: 'gate' },
  { to: '/staff/vehicles', label: 'Xe đang gửi', detail: 'Theo dõi trong bãi', icon: 'vehicles' },
  { to: '/staff/lost-ticket', label: 'Mất vé', detail: 'Xử lý ngoại lệ', icon: 'ticket' },
  { to: '/staff/incidents', label: 'Sự cố', detail: 'Ghi nhận nhanh', icon: 'incident' },
  { to: '/staff/shift', label: 'Tổng kết ca', detail: 'Kết ca và đối soát', icon: 'shift' },
] as const

function StaffIcon({ name }: { name: (typeof STAFF_NAV_ITEMS)[number]['icon'] }) {
  if (name === 'vehicles') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 16h14l-1.5-5h-11L5 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 11l1.5-3h7L17 11M7 18h.01M17 18h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'ticket') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
      </svg>
    )
  }

  if (name === 'incident') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4l9 16H3L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 9v5M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'shift') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 8v4l3 2M7 4l-2 2M17 4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 18V8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 18v-6h10v6M9 10h6M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function linkClassName({ isActive }: { isActive: boolean }) {
  return [
    'group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition-all duration-200',
    isActive
      ? 'border-sky-400/40 bg-sky-500 text-white shadow-lg shadow-sky-500/20'
      : 'border-transparent text-muted hover:border-theme hover:bg-ghost hover:text-fg',
  ].join(' ')
}

type StaffSidebarProps = {
  isOpen: boolean
  onNavigate?: () => void
}

export const StaffSidebar = forwardRef<HTMLElement, StaffSidebarProps>(function StaffSidebar(
  { isOpen, onNavigate },
  ref,
) {
  return (
    <aside
      ref={ref}
      id="staff-sidebar"
      className={[
        'flex flex-col border-r border-theme bg-page/90 shadow-2xl backdrop-blur-xl',
        'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50',
        'max-lg:w-[min(19rem,86vw)] max-lg:max-h-screen max-lg:overscroll-contain',
        'lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:h-screen lg:w-72 lg:translate-x-0 lg:visible lg:pointer-events-auto',
        'transition-transform duration-300 ease-out lg:transition-none',
        isOpen
          ? 'max-lg:translate-x-0 max-lg:visible max-lg:pointer-events-auto'
          : 'max-lg:-translate-x-full max-lg:invisible max-lg:pointer-events-none',
      ].join(' ')}
    >
      <div className="border-b border-theme p-5">
        <div className="flex items-center justify-between gap-3">
        <NavLink
          to="/staff"
          className="flex min-w-0 items-center gap-3 text-fg"
          aria-label="Khu làm việc nhân viên bãi xe"
          onClick={onNavigate}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-badge shadow-sm">
            <LogoIcon size={22} />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-base font-black">Nhân viên cổng</span>
            <span className="mt-0.5 block truncate text-[11px] font-medium text-subtle">Điều phối bãi xe</span>
          </span>
        </NavLink>
        <ThemeToggle className="shrink-0 border border-theme bg-badge shadow-sm" />
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-200">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
            Ca trực đang hoạt động
          </div>
          <p className="mt-1 text-[11px] text-muted">Sẵn sàng xử lý xe vào / ra</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Điều hướng nhân viên">
        {STAFF_NAV_ITEMS.map(({ to, label, detail, icon }) => (
          <NavLink key={to} to={to} className={linkClassName} end onClick={onNavigate}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-badge/70 group-[.active]:bg-white/15">
              <StaffIcon name={icon} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-bold">{label}</span>
              <span className="mt-0.5 block truncate text-[11px] opacity-70">{detail}</span>
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-theme p-4">
        <LogoutButton />
      </div>
    </aside>
  )
})
