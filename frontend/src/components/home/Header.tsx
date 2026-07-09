import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MenuIcon } from 'lucide-react'
import { BrandLink, ThemeToggle, UserMenu } from '../common'
import { Button } from '../ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet'
import { authApi, getStoredAuthUser, type AuthUser } from '../../services/authApi'

const NAV_LINKS = [
  { href: '#about', label: 'Giới thiệu' },
  { href: '#how-it-works', label: 'Cách hoạt động' },
  { href: '#features', label: 'Tính năng' },
  { href: '#resident-plans', label: 'Gói cư dân' },
] as const

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [authUser, setAuthUser] = useState<AuthUser | undefined>(() => getStoredAuthUser())
  const [logoutStatus, setLogoutStatus] = useState<'idle' | 'loading'>('idle')

  useEffect(() => {
    const handleStorage = () => {
      setAuthUser(getStoredAuthUser())
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('auth-user-updated', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('auth-user-updated', handleStorage)
    }
  }, [])

  async function handleLogout() {
    setLogoutStatus('loading')

    try {
      await authApi.logout()
    } catch {
      // Local auth is cleared in authApi.logout even if the API request fails.
    } finally {
      setAuthUser(undefined)
      setMenuOpen(false)
      setLogoutStatus('idle')
    }
  }

  return (
    <header className="fixed left-0 right-0 top-4 z-50 px-4 md:px-12 lg:px-16">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-xl border bg-background/90 px-4 shadow-sm backdrop-blur md:px-6">
        <BrandLink className="flex shrink-0 items-center gap-2 text-sm font-medium text-foreground hover:text-foreground" />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <Button key={href} variant="ghost" size="sm" asChild>
              <a href={href}>{label}</a>
            </Button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {authUser ? (
            <UserMenu user={authUser} logoutStatus={logoutStatus} onLogout={handleLogout} />
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <Link to="/login">Đăng nhập</Link>
              </Button>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                <Link to="/register">Đăng ký</Link>
              </Button>
            </>
          )}
          <ThemeToggle />
          <Button size="sm" asChild>
            <Link to="/booking">Đặt chỗ</Link>
          </Button>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Mở menu">
                <MenuIcon className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 max-w-[85vw]">
              <SheetHeader>
                <SheetTitle>Parking Simulator</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-1 px-4" aria-label="Mobile navigation">
                {NAV_LINKS.map(({ href, label }) => (
                  <Button key={href} variant="ghost" className="justify-start" asChild>
                    <a href={href} onClick={() => setMenuOpen(false)}>
                      {label}
                    </a>
                  </Button>
                ))}
                {authUser ? (
                  <>
                    <div className="my-2 rounded-lg border bg-muted/40 p-3">
                      <p className="truncate text-sm font-semibold">{authUser.fullName}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{authUser.email}</p>
                    </div>
                    {authUser.role === 'user' && (
                      <>
                        <Button variant="ghost" className="justify-start" asChild>
                          <Link to="/my-bookings" onClick={() => setMenuOpen(false)}>
                            Đặt chỗ của tôi
                          </Link>
                        </Button>
                        <Button variant="ghost" className="justify-start" asChild>
                          <Link to="/profile" onClick={() => setMenuOpen(false)}>
                            Hồ sơ
                          </Link>
                        </Button>
                      </>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      className="justify-start"
                      onClick={handleLogout}
                      disabled={logoutStatus === 'loading'}
                    >
                      {logoutStatus === 'loading' ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link to="/login" onClick={() => setMenuOpen(false)}>
                        Đăng nhập
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link to="/register" onClick={() => setMenuOpen(false)}>
                        Đăng ký
                      </Link>
                    </Button>
                  </>
                )}
                <Button className="mt-2 justify-start" asChild>
                  <Link to="/booking" onClick={() => setMenuOpen(false)}>
                    Đặt chỗ
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
