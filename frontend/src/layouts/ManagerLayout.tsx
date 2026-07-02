import { useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MenuIcon, OverlayBackdrop, SkipLink, ThemeToggle } from '../components/common'
import { ManagerSidebar } from '../components/manager'
import { useOverlayPanel } from '../hooks/useOverlayPanel'

const MANAGER_PAGE_TITLES: Record<string, string> = {
  '/manager': 'Tổng quan vận hành',
  '/manager/buildings': 'Tòa nhà & tầng',
  '/manager/slots': 'Chỗ đỗ',
  '/manager/bookings': 'Quản lý booking',
  '/manager/gate-logs': 'Hoạt động cổng',
  '/manager/lost-tickets': 'Quản lý mất vé',
  '/manager/staff': 'Nhân viên',
  '/manager/plans': 'Gói gửi xe',
  '/manager/subscriptions': 'Người dùng gói',
  '/manager/reports': 'Báo cáo vận hành',
}

export function ManagerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const pageTitle = MANAGER_PAGE_TITLES[pathname] ?? 'Manager'
  const sidebarRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const { close: closeSidebar } = useOverlayPanel({
    isOpen: sidebarOpen,
    panelRef: sidebarRef,
    triggerRef: menuButtonRef,
    onClose: () => setSidebarOpen(false),
  })

  return (
    <div className="relative h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.12),transparent_32%),linear-gradient(135deg,var(--page-bg),var(--page-bg))] text-fg">
      <SkipLink />

      {sidebarOpen && <OverlayBackdrop onClose={closeSidebar} label="ÄÃ³ng menu quáº£n lÃ½" />}

      <div className="flex h-full w-full">
        <div className="max-lg:w-0 max-lg:min-w-0 max-lg:shrink-0 max-lg:overflow-visible lg:w-72 lg:shrink-0">
          <ManagerSidebar ref={sidebarRef} isOpen={sidebarOpen} onNavigate={closeSidebar} />
        </div>

        <div className="flex h-full min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-theme bg-page/85 px-4 shadow-sm backdrop-blur-xl lg:hidden">
            <button
              ref={menuButtonRef}
              type="button"
              className="flex size-11 items-center justify-center rounded-2xl border border-theme bg-badge text-muted shadow-sm transition-colors hover:bg-ghost hover:text-fg"
              aria-expanded={sidebarOpen}
              aria-controls="manager-sidebar"
              aria-label="Má»Ÿ menu quáº£n lÃ½"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-fg">{pageTitle}</p>
              <p className="text-[11px] text-subtle">Trung tÃ¢m Ä‘iá»u hÃ nh bÃ£i xe</p>
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

