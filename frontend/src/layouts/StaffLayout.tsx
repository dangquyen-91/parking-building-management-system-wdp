import { useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MenuIcon, OverlayBackdrop, SkipLink, ThemeToggle } from '../components/common'
import { StaffSidebar } from '../components/staff'
import { useOverlayPanel } from '../hooks/useOverlayPanel'

const STAFF_PAGE_TITLES: Record<string, string> = {
  '/staff': 'Cổng xe vào/ra',
  '/staff/vehicles': 'Xe đang gửi',
  '/staff/lost-ticket': 'Mất vé',
  '/staff/incidents': 'Sự cố',
  '/staff/shift': 'Tổng kết ca',
}

export function StaffLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const pageTitle = STAFF_PAGE_TITLES[pathname] ?? 'Nhân viên'
  const sidebarRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const { close: closeSidebar } = useOverlayPanel({
    isOpen: sidebarOpen,
    panelRef: sidebarRef,
    triggerRef: menuButtonRef,
    onClose: () => setSidebarOpen(false),
  })

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_34%),linear-gradient(135deg,var(--page-bg),var(--page-bg))] text-fg">
      <SkipLink />

      {sidebarOpen && <OverlayBackdrop onClose={closeSidebar} label="Đóng menu nhân viên" />}

      <div className="flex h-full w-full">
        <div className="max-lg:w-0 max-lg:min-w-0 max-lg:shrink-0 max-lg:overflow-visible lg:w-72 lg:shrink-0">
          <StaffSidebar ref={sidebarRef} isOpen={sidebarOpen} onNavigate={closeSidebar} />
        </div>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:min-h-0">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-theme bg-page/85 px-4 backdrop-blur-xl lg:hidden">
            <button
              ref={menuButtonRef}
              type="button"
              className="flex size-11 items-center justify-center rounded-2xl border border-theme bg-badge text-muted shadow-sm transition-colors hover:bg-ghost hover:text-fg"
              aria-expanded={sidebarOpen}
              aria-controls="staff-sidebar"
              aria-label="Mở menu nhân viên"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-fg">{pageTitle}</p>
              <p className="text-[11px] text-subtle">Khu vận hành cổng bãi xe</p>
            </div>
            <ThemeToggle />
          </header>

          <main id="main" tabIndex={-1} className="min-w-0 flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
