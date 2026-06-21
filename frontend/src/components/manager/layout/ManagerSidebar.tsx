import { forwardRef } from 'react'
import { NavLink } from 'react-router-dom'
import { LogoIcon } from '../../common/icons'
import { LogoutButton } from '../../common/LogoutButton'

const MANAGER_NAV_ITEMS = [
  { to: '/manager', label: 'Tổng quan', detail: 'Bức tranh vận hành', icon: 'grid' },
  { to: '/manager/buildings', label: 'Tòa nhà', detail: 'Khu, tầng, sức chứa', icon: 'building' },
  { to: '/manager/slots', label: 'Chỗ đỗ', detail: 'Slot và hàng xe', icon: 'slots' },
  { to: '/manager/bookings', label: 'Booking', detail: 'Đặt chỗ trả trước', icon: 'calendar' },
  { to: '/manager/gate-logs', label: 'Hoạt động cổng', detail: 'Xe vào, xe ra', icon: 'gate' },
  { to: '/manager/staff', label: 'Nhân viên', detail: 'Tài khoản staff', icon: 'staff' },
  { to: '/manager/plans', label: 'Gói gửi xe', detail: 'Giá và trạng thái', icon: 'plan' },
  { to: '/manager/subscriptions', label: 'Người dùng gói', detail: 'Cư dân đã mua gói', icon: 'plan' },
  { to: '/manager/reports', label: 'Báo cáo', detail: 'Doanh thu, vận hành', icon: 'report' },
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
    'group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition-all duration-200',
    isActive
      ? 'border-sky-400/40 bg-sky-500 text-white shadow-lg shadow-sky-500/20'
      : 'border-transparent text-muted hover:border-theme hover:bg-ghost hover:text-fg',
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
        <NavLink
          to="/manager"
          className="flex min-w-0 items-center gap-3 text-fg"
          aria-label="Khu quản lý bãi xe"
          onClick={onNavigate}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-badge shadow-sm">
            <LogoIcon size={22} />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-base font-black">Quản lý bãi xe</span>
            <span className="mt-1 block truncate text-[11px] font-black uppercase tracking-[0.24em] text-subtle">
              Control Center
            </span>
          </span>
        </NavLink>

        <div className="mt-5 rounded-2xl border border-sky-500/25 bg-sky-500/10 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 dark:text-sky-200">
            <span className="size-2 rounded-full bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.9)]" />
            Dữ liệu vận hành trực tiếp
          </div>
          <p className="mt-1 text-[11px] text-muted">Theo dõi bãi xe, nhân viên và doanh thu</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Điều hướng quản lý">
        {MANAGER_NAV_ITEMS.map(({ to, label, detail, icon }) => (
          <NavLink key={to} to={to} className={linkClassName} end onClick={onNavigate}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-badge/70 group-[.active]:bg-white/15">
              <ManagerIcon name={icon} />
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
