import { useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AdminSidebar } from '../components/admin'
import { MenuIcon, OverlayBackdrop, SkipLink, ThemeToggle } from '../components/common'
import { useOverlayPanel } from '../hooks/useOverlayPanel'

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Tổng quan hệ thống',
  '/admin/users': 'Quản lý người dùng',
  '/admin/managers': 'Quản lý manager',
  '/admin/buildings': 'Tòa nhà & tầng',
  '/admin/floors': 'Công suất tầng',
  '/admin/bookings': 'Quản lý booking',
  '/admin/slots': 'Quản lý chỗ đỗ',
  '/admin/gate-logs': 'Nhật ký cổng',
  '/admin/staff': 'Quản lý nhân viên',
  '/admin/plans': 'Gói gửi xe',
  '/admin/subscriptions': 'Người dùng gói',
  '/admin/reports': 'Báo cáo hệ thống',
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

  return (
    <div className="relative h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.12),transparent_32%),linear-gradient(135deg,var(--page-bg),var(--page-bg))] text-fg">
      <SkipLink />

      {sidebarOpen && (
        <OverlayBackdrop onClose={closeSidebar} label="Đóng menu quản trị" />
      )}

      <div className="flex h-full w-full">
        <div className="max-lg:w-0 max-lg:min-w-0 max-lg:shrink-0 max-lg:overflow-visible lg:w-72 lg:shrink-0">
          <AdminSidebar ref={sidebarRef} isOpen={sidebarOpen} onNavigate={closeSidebar} />
        </div>

        <div className="flex h-full w-full min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-theme bg-page/85 px-4 shadow-sm backdrop-blur-xl lg:hidden">
            <button
              ref={menuButtonRef}
              type="button"
              className="flex size-11 items-center justify-center rounded-2xl border border-theme bg-badge text-muted shadow-sm transition-colors hover:bg-ghost hover:text-fg"
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
              aria-label="Mở menu quản trị"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon />
            </button>
            <div className="min-w-0 flex-1" aria-hidden="true">
              <p className="truncate text-sm font-black text-fg">{pageTitle}</p>
              <p className="text-[11px] text-subtle">Trung tâm quản trị hệ thống</p>
            </div>
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
