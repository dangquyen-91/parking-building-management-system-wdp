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
import { Card, CardContent } from '../../ui/card'

const STAFF_NAV_ITEMS = [
  { to: '/staff/check-in', label: 'Xe vào', detail: 'Camera, tra cứu, QR', icon: ScanLine, color: 'sky' },
  { to: '/staff/check-out', label: 'Xe ra', detail: 'Tính phí, thanh toán', icon: LogOut, color: 'emerald' },
  { to: '/staff/vehicles', label: 'Xe đang gửi', detail: 'Theo dõi trong bãi', icon: CarFront, color: 'indigo' },
  { to: '/staff/occupancy', label: 'Sức chứa', detail: 'Tầng, khu, chỗ trống', icon: BarChart3, color: 'cyan' },
  { to: '/staff/lost-ticket', label: 'Mất vé', detail: 'Xử lý ngoại lệ', icon: TicketX, color: 'amber' },
  { to: '/staff/incidents', label: 'Sự cố', detail: 'Ghi nhận nhanh', icon: AlertTriangle, color: 'rose' },
  { to: '/staff/shift', label: 'Tổng kết ca', detail: 'Kết ca và đối soát', icon: Clock3, color: 'violet' },
] as const

const NAV_COLOR_CLASS = {
  sky: 'bg-sky-500/15 text-sky-700 ring-sky-500/20 dark:text-sky-300',
  emerald: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  indigo: 'bg-indigo-500/15 text-indigo-700 ring-indigo-500/20 dark:text-indigo-300',
  cyan: 'bg-cyan-500/15 text-cyan-700 ring-cyan-500/20 dark:text-cyan-300',
  amber: 'bg-amber-500/15 text-amber-700 ring-amber-500/20 dark:text-amber-300',
  rose: 'bg-rose-500/15 text-rose-700 ring-rose-500/20 dark:text-rose-300',
  violet: 'bg-violet-500/15 text-violet-700 ring-violet-500/20 dark:text-violet-300',
} as const

function linkClassName({ isActive }: { isActive: boolean }) {
  return [
    'group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all',
    isActive
      ? 'bg-linear-to-r from-sky-600 to-emerald-500 text-white shadow-md shadow-sky-500/20'
      : 'text-muted-foreground hover:bg-white/80 hover:text-foreground hover:shadow-sm dark:hover:bg-white/10',
  ].join(' ')
}

type StaffSidebarProps = {
  onNavigate?: () => void
}

export function StaffSidebar({ onNavigate }: StaffSidebarProps) {
  return (
    <aside className="flex h-full flex-col border-r border-sky-200/60 bg-background/90 backdrop-blur dark:border-sky-900/50">
      <div className="border-b border-sky-200/60 bg-linear-to-br from-sky-500/10 via-background to-emerald-500/10 p-5 dark:border-sky-900/50">
        <div className="flex items-center justify-between gap-3">
          <NavLink
            to="/staff/check-in"
            className="flex min-w-0 items-center gap-3 text-foreground"
            aria-label="Khu làm việc nhân viên bãi xe"
            onClick={onNavigate}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-sky-500 to-emerald-500 text-white shadow-lg shadow-sky-500/20">
              <LogoIcon size={22} />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-base font-semibold">Nhân viên cổng</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">Điều phối bãi xe</span>
            </span>
          </NavLink>
          <ThemeToggle className="shrink-0" />
        </div>

        <Card className="mt-5 border-emerald-500/25 bg-emerald-500/10" size="sm">
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
        {STAFF_NAV_ITEMS.map(({ to, label, detail, icon: Icon, color }) => (
          <NavLink key={to} to={to} className={linkClassName} end onClick={onNavigate}>
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors group-[.active]:bg-white/20 group-[.active]:text-white group-[.active]:ring-white/20 ${NAV_COLOR_CLASS[color]}`}>
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
        <LogoutButton />
      </div>
    </aside>
  )
}
