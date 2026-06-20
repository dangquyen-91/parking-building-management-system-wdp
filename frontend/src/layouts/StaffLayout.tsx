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
    <div className="h-screen overflow-hidden bg-page text-fg">
      <SkipLink />

      {sidebarOpen && (
        <OverlayBackdrop onClose={closeSidebar} label="Close staff navigation menu" />
      )}

      <div className="flex h-full w-full">
        <div className="max-lg:w-0 max-lg:min-w-0 max-lg:shrink-0 max-lg:overflow-visible lg:w-60 lg:shrink-0">
          <StaffSidebar ref={sidebarRef} isOpen={sidebarOpen} onNavigate={closeSidebar} />
        </div>

        <div className="flex w-full flex-1 flex-col min-w-0 min-h-screen lg:min-h-0">
          <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 border-b border-theme bg-page/95 backdrop-blur-md shrink-0">
            <button
              ref={menuButtonRef}
              type="button"
              className="flex items-center justify-center w-10 h-10 rounded-xl text-muted hover:text-fg hover:bg-ghost transition-colors"
              aria-expanded={sidebarOpen}
              aria-controls="staff-sidebar"
              aria-label="Open staff navigation menu"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon />
            </button>
            <p className="text-sm font-medium text-fg truncate flex-1" aria-hidden="true">
              {pageTitle}
            </p>
            <ThemeToggle />
          </header>

          <main id="main" tabIndex={-1} className="flex-1 min-w-0 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
