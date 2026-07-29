import { forwardRef } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  CalendarCheck2,
  CarFront,
  ClipboardList,
  CreditCard,
  Gauge,
  Layers3,
  ShieldCheck,
  UserCog,
  Users,
  Warehouse,
} from 'lucide-react'
import { LogoIcon } from '../../common/icons'
import { LogoutButton } from '../../common/LogoutButton'
import { Badge } from '../../ui/badge'
import { Separator } from '../../ui/separator'
import { cn } from '../../../lib/utils'

const ADMIN_NAV_ITEMS = [
  {
    to: '/admin',
    label: 'Tổng quan',
    detail: 'Sức khỏe hệ thống',
    icon: Gauge,
  },
  {
    to: '/admin/users',
    label: 'Người dùng',
    detail: 'Tài khoản & phân quyền',
    icon: Users,
  },
  {
    to: '/admin/managers',
    label: 'Quản lý',
    detail: 'Đội ngũ manager',
    icon: UserCog,
  },
  {
    to: '/admin/buildings',
    label: 'Tòa nhà',
    detail: 'Hạ tầng bãi xe',
    icon: Building2,
  },
  {
    to: '/admin/floors',
    label: 'Tầng',
    detail: 'Công suất từng tầng',
    icon: Layers3,
  },
  {
    to: '/admin/bookings',
    label: 'Đặt chỗ',
    detail: 'Booking toàn hệ thống',
    icon: CalendarCheck2,
  },
  {
    to: '/admin/slots',
    label: 'Chỗ đỗ',
    detail: 'Ô đỗ & hàng xe',
    icon: CarFront,
  },
  {
    to: '/admin/gate-logs',
    label: 'Nhật ký cổng',
    detail: 'Lượt xe vào và ra',
    icon: ClipboardList,
  },
  {
    to: '/admin/staff',
    label: 'Nhân viên',
    detail: 'Tài khoản vận hành',
    icon: ShieldCheck,
  },
  {
    to: '/admin/plans',
    label: 'Gói gửi xe',
    detail: 'Giá & thời hạn',
    icon: CreditCard,
  },
  {
    to: '/admin/subscriptions',
    label: 'Gói cư dân',
    detail: 'Đăng ký đang hoạt động',
    icon: Warehouse,
  },
  {
    to: '/admin/reports',
    label: 'Báo cáo',
    detail: 'Doanh thu & vận hành',
    icon: BarChart3,
  },
] as const

const ADMIN_ICON_TONES = [
  'bg-violet-500/15 text-violet-700 ring-violet-500/20 dark:text-violet-300',
  'bg-sky-500/15 text-sky-700 ring-sky-500/20 dark:text-sky-300',
  'bg-emerald-500/15 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  'bg-amber-500/15 text-amber-700 ring-amber-500/20 dark:text-amber-300',
] as const

type AdminSidebarProps = { isOpen: boolean; onNavigate?: () => void }

export const AdminSidebar = forwardRef<HTMLElement, AdminSidebarProps>(
  function AdminSidebar({ isOpen, onNavigate }, ref) {
    return (
      <aside
        ref={ref}
        id="admin-sidebar"
        className={cn(
          'flex flex-col border-r border-violet-200/60 bg-card/92 text-card-foreground shadow-xl backdrop-blur-xl dark:border-violet-900/50',
          'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-[min(19rem,86vw)]',
          'lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:h-screen lg:w-72',
          'transition-transform duration-300 ease-out lg:translate-x-0',
          isOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
        )}
      >
        <div className="bg-linear-to-br from-violet-500/10 via-card to-sky-500/10 p-5 pb-4">
          <NavLink
            to="/admin"
            className="flex items-center gap-3"
            onClick={onNavigate}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-sky-500 text-white shadow-lg shadow-violet-500/20">
              <LogoIcon size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">
                Parking Admin
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                Trung tâm quản trị
              </span>
            </span>
            <Badge className="border-0 bg-violet-600 text-[10px] text-white">
              ADMIN
            </Badge>
          </NavLink>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Hệ thống đang hoạt động
          </div>
        </div>
        <Separator />
        <nav
          className="sidebar-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
          aria-label="Điều hướng admin"
        >
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Quản lý hệ thống
          </p>
          {ADMIN_NAV_ITEMS.map(({ to, label, detail, icon: Icon }, index) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                  isActive
                    ? 'bg-linear-to-r from-violet-600 to-sky-500 text-white shadow-md shadow-violet-500/20'
                    : 'text-muted-foreground hover:bg-white/80 hover:text-foreground hover:shadow-sm dark:hover:bg-white/10',
                )
              }
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 group-[.active]:bg-white/20 group-[.active]:text-white group-[.active]:ring-white/20 ${ADMIN_ICON_TONES[index % ADMIN_ICON_TONES.length]}`}
              >
                <Icon className="size-[18px]" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{label}</span>
                <span className="block truncate text-[11px] opacity-70">
                  {detail}
                </span>
              </span>
            </NavLink>
          ))}
        </nav>
        <Separator />
        <div className="p-3">
          <LogoutButton />
        </div>
      </aside>
    )
  },
)
