import { useRef, useState } from 'react'
import { Menu, ShieldCheck } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { AdminSidebar } from '../components/admin'
import { OverlayBackdrop, SkipLink, ThemeToggle } from '../components/common'
import { Button } from '../components/ui/button'
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
  const sidebarRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { close: closeSidebar } = useOverlayPanel({
    isOpen: sidebarOpen,
    panelRef: sidebarRef,
    triggerRef: menuButtonRef,
    onClose: () => setSidebarOpen(false),
  })

  return (
    <div data-admin-ui className="relative h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.14),transparent_32%),radial-gradient(circle_at_90%_8%,rgba(14,165,233,0.14),transparent_30%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted))/0.42)] text-foreground">
      <SkipLink />
      {sidebarOpen && <OverlayBackdrop onClose={closeSidebar} label="Đóng menu quản trị" />}
      <div className="flex h-full w-full">
        <div className="max-lg:w-0 max-lg:min-w-0 max-lg:shrink-0 max-lg:overflow-visible lg:w-72 lg:shrink-0">
          <AdminSidebar ref={sidebarRef} isOpen={sidebarOpen} onNavigate={closeSidebar} />
        </div>
        <div className="flex h-full min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-violet-200/60 bg-background/85 px-4 shadow-sm backdrop-blur-xl lg:hidden dark:border-violet-900/50">
            <Button ref={menuButtonRef} variant="outline" size="icon" aria-expanded={sidebarOpen} aria-controls="admin-sidebar" aria-label="Mở menu quản trị" onClick={() => setSidebarOpen(true)}>
              <Menu className="size-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{PAGE_TITLES[pathname] ?? 'Admin'}</p>
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><ShieldCheck className="size-3" /> Trung tâm quản trị</p>
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
