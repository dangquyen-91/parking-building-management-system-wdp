import { forwardRef } from 'react'
import { NavLink } from 'react-router-dom'
import { LogoIcon } from '../../common/icons'
import { LogoutButton } from '../../common/LogoutButton'

const MANAGER_NAV_ITEMS = [
  { to: '/manager', label: 'Tổng quan', icon: 'grid' },
  { to: '/manager/buildings', label: 'Tòa Nhà', icon: 'building' },
  { to: '/manager/slots', label: 'Chỗ đỗ', icon: 'slots' },
  { to: '/manager/bookings', label: 'Booking', icon: 'calendar' },
  { to: '/manager/gate-logs', label: 'Hoạt động cổng', icon: 'gate' }, // Gate Logs
  { to: '/manager/staff', label: 'Nhân viên', icon: 'staff' },
  { to: '/manager/plans', label: 'Gói gửi xe', icon: 'plan' },
  { to: '/manager/subscriptions', label: 'Người dùng gói', icon: 'plan' },
  { to: '/manager/reports', label: 'Báo cáo', icon: 'report' },
] as const

function ManagerIcon({ name }: { name: (typeof MANAGER_NAV_ITEMS)[number]['icon'] }) {
  if (name === 'grid') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }

  if (name === 'staff') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 7h5M16 12h5M16 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'calendar') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'report') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 20V4h9l3 3v13H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 15h6M9 11h6M9 7h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'plan') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5v-13Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'building') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 20V5.5A1.5 1.5 0 0 1 5.5 4H14l4 4v12H4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 9h2M8 13h2M8 17h2M14 13h2M14 17h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
    'group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition-all duration-200',
    isActive
      ? 'bg-btn-primary text-btn-primary-fg shadow-lg shadow-black/10'
      : 'text-muted hover:text-fg hover:bg-ghost hover:translate-x-0.5',
  ].join(' ')
}

type ManagerSidebarProps = {
  isOpen: boolean
  onNavigate?: () => void
}

export const ManagerSidebar = forwardRef<HTMLElement, ManagerSidebarProps>(function ManagerSidebar(
  { isOpen, onNavigate },
  ref,
) {
  return (
    <aside
      ref={ref}
      id="manager-sidebar"
      className={[
        'flex flex-col border-r border-theme bg-page/80 rounded-none shadow-2xl shadow-black/5 backdrop-blur-2xl',
        'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50',
        'max-lg:w-[min(18rem,85vw)] max-lg:max-h-screen max-lg:overscroll-contain',
        'lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-60 lg:h-screen lg:translate-x-0 lg:visible lg:pointer-events-auto',
        'transition-transform duration-300 ease-out lg:transition-none',
        isOpen
          ? 'max-lg:translate-x-0 max-lg:visible max-lg:pointer-events-auto'
          : 'max-lg:-translate-x-full max-lg:invisible max-lg:pointer-events-none',
      ].join(' ')}
    >
      <div className="px-4 py-5 border-b border-theme flex items-center justify-between gap-2">
        <NavLink
          to="/manager"
          className="group flex items-center gap-3 text-fg font-medium text-sm min-w-0"
          aria-label="Parking manager workspace"
          onClick={onNavigate}
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 border border-theme shadow-sm shrink-0 transition-transform group-hover:-rotate-3">
            <LogoIcon size={18} />
          </span>
          <span className="leading-tight truncate">
            Quản lý bãi xe
            <span className="mt-0.5 block text-[10px] font-bold uppercase text-subtle tracking-[0.16em]">
              Trung tâm điều khiển
            </span>
          </span>
        </NavLink>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5 overflow-y-auto" aria-label="Manager navigation">
        {MANAGER_NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={linkClassName} end onClick={onNavigate}>
            <span className="shrink-0 opacity-80 transition-transform group-hover:scale-110">
              <ManagerIcon name={icon} />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-theme">
        <LogoutButton />
      </div>
    </aside>
  )
})
