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
  '/manager/complaints': 'Quản lý khiếu nại',
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
    <div className="relative h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.14),transparent_32%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted))/0.42)] text-foreground">
      <SkipLink />

      {sidebarOpen && <OverlayBackdrop onClose={closeSidebar} label="Đóng menu quản lý" />}

      <div className="flex h-full w-full">
        <div className="max-lg:w-0 max-lg:min-w-0 max-lg:shrink-0 max-lg:overflow-visible lg:w-72 lg:shrink-0">
          <ManagerSidebar ref={sidebarRef} isOpen={sidebarOpen} onNavigate={closeSidebar} />
        </div>

        <div className="flex h-full min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-emerald-200/60 bg-background/85 px-4 shadow-sm backdrop-blur-xl lg:hidden dark:border-emerald-900/50">
            <button
              ref={menuButtonRef}
              type="button"
              className="flex size-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 shadow-sm transition-colors hover:bg-emerald-500/15 dark:text-emerald-300"
              aria-expanded={sidebarOpen}
              aria-controls="manager-sidebar"
              aria-label="Mở menu quản lý"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-foreground">{pageTitle}</p>
              <p className="text-[11px] text-muted-foreground">Trung tâm điều hành bãi xe</p>
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
