import {
  AlertTriangle,
  BarChart3,
  CarFront,
  Clock3,
  LogOut,
  ScanLine,
  TicketX,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ThemeToggle } from '../../common'
import { LogoIcon } from '../../common/icons'
import { LogoutButton } from '../../common/LogoutButton'
import { Badge } from '../../ui/badge'
import { Card, CardContent } from '../../ui/card'

const STAFF_NAV_ITEMS = [
  { to: '/staff/check-in', label: 'Xe vào', detail: 'Camera, tra cứu, QR', icon: ScanLine },
  { to: '/staff/check-out', label: 'Xe ra', detail: 'Tính phí, thanh toán', icon: LogOut },
  { to: '/staff/vehicles', label: 'Xe đang gửi', detail: 'Theo dõi trong bãi', icon: CarFront },
  { to: '/staff/occupancy', label: 'Sức chứa', detail: 'Tầng, khu, chỗ trống', icon: BarChart3 },
  { to: '/staff/lost-ticket', label: 'Mất vé', detail: 'Xử lý ngoại lệ', icon: TicketX },
  { to: '/staff/incidents', label: 'Sự cố', detail: 'Ghi nhận nhanh', icon: AlertTriangle },
  { to: '/staff/shift', label: 'Tổng kết ca', detail: 'Kết ca và đối soát', icon: Clock3 },
] as const

function linkClassName({ isActive }: { isActive: boolean }) {
  return [
    'group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors',
    isActive
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  ].join(' ')
}

type StaffSidebarProps = {
  onNavigate?: () => void
}

export function StaffSidebar({ onNavigate }: StaffSidebarProps) {
  return (
    <aside className="flex h-full flex-col border-r bg-background">
      <div className="border-b p-5">
        <div className="flex items-center justify-between gap-3">
          <NavLink
            to="/staff/check-in"
            className="flex min-w-0 items-center gap-3 text-foreground"
            aria-label="Khu làm việc nhân viên bãi xe"
            onClick={onNavigate}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted shadow-sm">
              <LogoIcon size={22} />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-base font-semibold">Nhân viên cổng</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">Điều phối bãi xe</span>
            </span>
          </NavLink>
          <ThemeToggle className="shrink-0" />
        </div>

        <Card className="mt-5" size="sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-500" />
              Ca trực đang hoạt động
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Sẵn sàng xử lý xe vào và xe ra</p>
          </CardContent>
        </Card>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Điều hướng nhân viên">
        {STAFF_NAV_ITEMS.map(({ to, label, detail, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClassName} end onClick={onNavigate}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-current group-[.active]:bg-primary-foreground/15">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold">{label}</span>
              <span className="mt-0.5 block truncate text-xs opacity-75">{detail}</span>
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-4">
        <Badge variant="secondary" className="mb-3 w-full justify-center">
          Staff Console
        </Badge>
        <LogoutButton />
      </div>
    </aside>
  )
}
