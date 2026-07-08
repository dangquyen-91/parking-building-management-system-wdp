import { forwardRef } from 'react'
import { NavLink } from 'react-router-dom'
import { BarChart3, Building2, CalendarCheck2, CarFront, ClipboardList, CreditCard, Gauge, Layers3, ShieldCheck, UserCog, Users, Warehouse } from 'lucide-react'
import { LogoIcon } from '../../common/icons'
import { LogoutButton } from '../../common/LogoutButton'
import { Badge } from '../../ui/badge'
import { Separator } from '../../ui/separator'
import { cn } from '../../../lib/utils'

const ADMIN_NAV_ITEMS = [
  { to: '/admin', label: 'Tổng quan', detail: 'Sức khỏe hệ thống', icon: Gauge },
  { to: '/admin/users', label: 'Người dùng', detail: 'Tài khoản & phân quyền', icon: Users },
  { to: '/admin/managers', label: 'Quản lý', detail: 'Đội ngũ manager', icon: UserCog },
  { to: '/admin/buildings', label: 'Tòa nhà', detail: 'Hạ tầng bãi xe', icon: Building2 },
  { to: '/admin/floors', label: 'Tầng', detail: 'Công suất từng tầng', icon: Layers3 },
  { to: '/admin/bookings', label: 'Đặt chỗ', detail: 'Booking toàn hệ thống', icon: CalendarCheck2 },
  { to: '/admin/slots', label: 'Chỗ đỗ', detail: 'Ô đỗ & hàng xe', icon: CarFront },
  { to: '/admin/gate-logs', label: 'Nhật ký cổng', detail: 'Lượt xe vào và ra', icon: ClipboardList },
  { to: '/admin/staff', label: 'Nhân viên', detail: 'Tài khoản vận hành', icon: ShieldCheck },
  { to: '/admin/plans', label: 'Gói gửi xe', detail: 'Giá & thời hạn', icon: CreditCard },
  { to: '/admin/subscriptions', label: 'Gói cư dân', detail: 'Đăng ký đang hoạt động', icon: Warehouse },
  { to: '/admin/reports', label: 'Báo cáo', detail: 'Doanh thu & vận hành', icon: BarChart3 },
] as const

type AdminSidebarProps = { isOpen: boolean; onNavigate?: () => void }

export const AdminSidebar = forwardRef<HTMLElement, AdminSidebarProps>(function AdminSidebar({ isOpen, onNavigate }, ref) {
  return (
    <aside ref={ref} id="admin-sidebar" className={cn(
      'flex flex-col border-r bg-card text-card-foreground shadow-sm',
      'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-[min(19rem,86vw)]',
      'lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:h-screen lg:w-72',
      'transition-transform duration-300 ease-out lg:translate-x-0',
      isOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
    )}>
      <div className="p-5 pb-4">
        <NavLink to="/admin" className="flex items-center gap-3" onClick={onNavigate}>
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"><LogoIcon size={20} /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">Parking Admin</span>
            <span className="block truncate text-xs text-muted-foreground">Trung tâm quản trị</span>
          </span>
          <Badge variant="secondary" className="text-[10px]">ADMIN</Badge>
        </NavLink>
        <div className="mt-4 flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-emerald-500" /></span>
          Hệ thống đang hoạt động
        </div>
      </div>
      <Separator />
      <nav className="sidebar-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Điều hướng admin">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Quản lý hệ thống</p>
        {ADMIN_NAV_ITEMS.map(({ to, label, detail, icon: Icon }) => (
          <NavLink key={to} to={to} end onClick={onNavigate} className={({ isActive }) => cn(
            'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
            isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )}>
            <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
            <span className="min-w-0 flex-1"><span className="block truncate font-medium">{label}</span><span className="block truncate text-[11px] opacity-70">{detail}</span></span>
          </NavLink>
        ))}
      </nav>
      <Separator />
      <div className="p-3"><LogoutButton /></div>
    </aside>
  )
})
