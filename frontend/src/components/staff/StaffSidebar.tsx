import { forwardRef } from 'react'
import { NavLink } from 'react-router-dom'
import { LogoIcon } from '../common/icons'
import { LogoutButton } from '../common/LogoutButton'

const STAFF_NAV_ITEMS = [
  {
    to: '/staff',
    label: 'Gate Check-in/out',
    icon: 'gate',
  },
  {
    to: '/staff/vehicles',
    label: 'Active Vehicles',
    icon: 'vehicles',
  },
  {
    to: '/staff/lost-ticket',
    label: 'Lost Ticket',
    icon: 'ticket',
  },
  {
    to: '/staff/incidents',
    label: 'Incidents',
    icon: 'incident',
  },
  {
    to: '/staff/shift',
    label: 'Shift Summary',
    icon: 'shift',
  },
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
      <path
        d="M4 18V8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M7 18v-6h10v6M9 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

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
        'lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-60 lg:h-screen lg:translate-x-0 lg:visible lg:pointer-events-auto',
        'transition-transform duration-300 ease-out lg:transition-none',
        isOpen
          ? 'max-lg:translate-x-0 max-lg:visible max-lg:pointer-events-auto'
          : 'max-lg:-translate-x-full max-lg:invisible max-lg:pointer-events-none',
      ].join(' ')}
    >
      <div className="px-4 py-5 border-b border-theme flex items-center justify-between gap-2">
        <NavLink
          to="/staff"
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
            <span className="shrink-0">
              <StaffIcon name={icon} />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-theme">
        <LogoutButton />
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
