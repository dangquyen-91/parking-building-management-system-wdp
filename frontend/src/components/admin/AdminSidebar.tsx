import { forwardRef } from 'react'
import { NavLink } from 'react-router-dom'
import { LogoIcon } from '../common/icons'

const ADMIN_NAV_ITEMS = [
  {
    to: '/admin',
    label: 'Tổng quan',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="3" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="10" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    to: '/admin/users',
    label: 'Người dùng',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M16 11h5M18.5 8.5v5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: '/admin/managers',
    label: 'Manager',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15 6h6M15 11h6M15 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/admin/buildings',
    label: 'Tòa nhà',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 20V5.5A1.5 1.5 0 0 1 5.5 4H14l4 4v12H4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 9h2M8 13h2M8 17h2M14 13h2M14 17h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/admin/floors',
    label: 'Tầng',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 20V4h14v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 8h3M13 8h3M8 12h3M13 12h3M8 16h3M13 16h3M3 20h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/admin/bookings',
    label: 'Đặt chỗ',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/admin/slots',
    label: 'Chỗ đỗ',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 18V8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 18v-6h10v6M9 10h6M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/admin/gate-logs',
    label: 'Nhật ký cổng',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 20V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 20v-8h6v8M7 9h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/admin/staff',
    label: 'Nhân viên',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 7h5M16 12h5M16 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/admin/plans',
    label: 'Gói giá',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H19v16H7.5A2.5 2.5 0 0 1 5 17.5v-11Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 8h7M8 12h7M8 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/admin/subscriptions',
    label: 'Gói cư dân',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 20V5.5A1.5 1.5 0 0 1 7.5 4h9A1.5 1.5 0 0 1 18 5.5V20" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 8h6M9 12h6M9 16h3M4 20h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/admin/reports',
    label: 'Báo cáo',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 20V4h9l3 3v13H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 15h6M9 11h6M9 7h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
] as const

function linkClassName({ isActive }: { isActive: boolean }) {
  return [
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
    isActive ? 'bg-btn-primary text-btn-primary-fg' : 'text-muted hover:text-fg hover:bg-ghost',
  ].join(' ')
}

type AdminSidebarProps = {
  isOpen: boolean
  onNavigate?: () => void
}

export const AdminSidebar = forwardRef<HTMLElement, AdminSidebarProps>(function AdminSidebar(
  { isOpen, onNavigate },
  ref,
) {
  return (
    <aside
      ref={ref}
      id="admin-sidebar"
      className={[
        'liquid-glass-card flex flex-col border-r border-theme rounded-none',
        'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50',
        'max-lg:w-[min(18rem,85vw)] max-lg:max-h-screen max-lg:overscroll-contain',
        'lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:h-screen lg:w-60 lg:translate-x-0 lg:visible lg:pointer-events-auto',
        'transition-transform duration-300 ease-out lg:transition-none',
        isOpen
          ? 'max-lg:translate-x-0 max-lg:visible max-lg:pointer-events-auto'
          : 'max-lg:-translate-x-full max-lg:invisible max-lg:pointer-events-none',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-2 border-b border-theme px-4 py-5">
        <NavLink
          to="/admin"
          className="flex min-w-0 items-center gap-2 text-sm font-medium text-fg"
          aria-label="Không gian quản trị bãi đỗ"
          onClick={onNavigate}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-badge">
            <LogoIcon size={18} />
          </span>
          <span className="truncate leading-tight">
            Admin
            <span className="block text-[10px] font-normal tracking-wide text-subtle">
              Bảng điều khiển
            </span>
          </span>
        </NavLink>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Điều hướng admin">
        {ADMIN_NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={linkClassName} end onClick={onNavigate}>
            <span className="shrink-0">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

    </aside>
  )
})
