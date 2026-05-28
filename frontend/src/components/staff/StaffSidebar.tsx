import { forwardRef } from 'react'
import { NavLink } from 'react-router-dom'
import { LogoIcon } from '../common/icons'

const STAFF_NAV_ITEMS = [
  {
    to: '/staff-gate',
    label: 'Gate Check-in/out',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 18V8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path d="M7 18v-6h10v6M9 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
] as const

function linkClassName({ isActive }: { isActive: boolean }) {
  return [
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
    isActive
      ? 'bg-btn-primary text-btn-primary-fg'
      : 'text-muted hover:text-fg hover:bg-ghost',
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
        'liquid-glass-card flex flex-col border-r border-theme rounded-none',
        'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50',
        'max-lg:w-[min(18rem,85vw)] max-lg:max-h-screen max-lg:overscroll-contain',
        'lg:static lg:z-auto lg:w-full lg:min-h-screen lg:translate-x-0 lg:visible lg:pointer-events-auto',
        'transition-transform duration-300 ease-out lg:transition-none',
        isOpen
          ? 'max-lg:translate-x-0 max-lg:visible max-lg:pointer-events-auto'
          : 'max-lg:-translate-x-full max-lg:invisible max-lg:pointer-events-none',
      ].join(' ')}
    >
      <div className="px-4 py-5 border-b border-theme flex items-center justify-between gap-2">
        <NavLink
          to="/staff-gate"
          className="flex items-center gap-2 text-fg font-medium text-sm min-w-0"
          aria-label="Parking staff workspace"
          onClick={onNavigate}
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-badge shrink-0">
            <LogoIcon size={18} />
          </span>
          <span className="leading-tight truncate">
            Staff
            <span className="block text-[10px] font-normal text-subtle tracking-wide">
              Parking Gate
            </span>
          </span>
        </NavLink>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto" aria-label="Staff navigation">
        {STAFF_NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={linkClassName} end onClick={onNavigate}>
            <span className="shrink-0">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-theme">
        <NavLink
          to="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-subtle hover:text-fg hover:bg-ghost transition-colors"
          onClick={onNavigate}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Home
        </NavLink>
      </div>
    </aside>
  )
})

