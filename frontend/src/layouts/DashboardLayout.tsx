import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MenuIcon, OverlayBackdrop, Sidebar, SkipLink, ThemeToggle } from '../components/common'
import { useOverlayPanel } from '../hooks/useOverlayPanel'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/user-management': 'User Management',
}

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const pageTitle = PAGE_TITLES[pathname] ?? 'Admin'
  const sidebarRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const { close: closeSidebar } = useOverlayPanel({
    isOpen: sidebarOpen,
    panelRef: sidebarRef,
    triggerRef: menuButtonRef,
    onClose: () => setSidebarOpen(false),
  })

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-page text-fg">
      <SkipLink />

      {sidebarOpen && (
        <OverlayBackdrop onClose={closeSidebar} label="Close navigation menu" />
      )}

      <div className="flex min-h-screen w-full">
        <div className="max-lg:w-0 max-lg:min-w-0 max-lg:shrink-0 max-lg:overflow-visible lg:w-60 lg:shrink-0">
          <Sidebar ref={sidebarRef} isOpen={sidebarOpen} onNavigate={closeSidebar} />
        </div>

        <div className="flex w-full flex-1 flex-col min-w-0 min-h-screen lg:min-h-0">
          <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 border-b border-theme bg-page/95 backdrop-blur-md shrink-0">
            <button
              ref={menuButtonRef}
              type="button"
              className="flex items-center justify-center w-10 h-10 rounded-xl text-muted hover:text-fg hover:bg-ghost transition-colors"
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
              aria-label="Open navigation menu"
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
