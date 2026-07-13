import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MenuIcon } from 'lucide-react'
import { SkipLink, ThemeToggle } from '../components/common'
import { StaffSidebar } from '../components/staff'
import { Button } from '../components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet'

const STAFF_PAGE_TITLES: Record<string, string> = {
  '/staff/check-in': 'Xe vào',
  '/staff/check-out': 'Xe ra',
  '/staff/vehicles': 'Xe đang gửi',
  '/staff/occupancy': 'Sức chứa',
  '/staff/lost-ticket': 'Mất vé',
  '/staff/incidents': 'Sự cố',
  '/staff/shift': 'Tổng kết ca',
}

export function StaffLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const pageTitle = STAFF_PAGE_TITLES[pathname] ?? 'Nhân viên'

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted))/0.45)] text-foreground">
      <SkipLink />

      <div className="flex h-full w-full">
        <div className="hidden lg:block lg:w-72 lg:shrink-0">
          <StaffSidebar />
        </div>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:min-h-0">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-sky-200/60 bg-background/85 px-4 shadow-sm backdrop-blur lg:hidden dark:border-sky-900/50">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon-lg" aria-label="Mở menu nhân viên">
                  <MenuIcon className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 max-w-[86vw] p-0" showCloseButton={false}>
                <StaffSidebar onNavigate={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{pageTitle}</p>
              <p className="text-xs text-muted-foreground">Khu vận hành cổng bãi xe</p>
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
