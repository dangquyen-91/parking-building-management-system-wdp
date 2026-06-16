import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandLink, SkipLink, ThemeToggle, UserMenu } from '../common'
import { authApi, getStoredAuthUser, type AuthUser } from '../../services/authApi'

export function BookingTopNav() {
  const [authUser, setAuthUser] = useState<AuthUser>()
  const [logoutStatus, setLogoutStatus] = useState<'idle' | 'loading'>('idle')

  useEffect(() => {
    setAuthUser(getStoredAuthUser())

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
      setLogoutStatus('idle')
    }
  }

  return (
    <>
      <SkipLink />
      <header className="sticky top-0 z-40 border-b border-theme bg-page/95 px-4 backdrop-blur-md md:px-8 lg:px-10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
          <BrandLink className="flex items-center gap-2 text-sm font-medium text-fg hover:text-fg" />
          <nav className="flex items-center gap-2" aria-label="User navigation">
            <Link
              to="/"
              className="hidden rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-ghost hover:text-fg sm:inline-flex"
            >
              Trang chủ
            </Link>

            {authUser ? (
              <UserMenu
                user={authUser}
                logoutStatus={logoutStatus}
                onLogout={handleLogout}
                buttonClassName="rounded-lg"
              />
            ) : (
              <Link
                to="/login"
                className="hidden rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-ghost hover:text-fg sm:inline-flex"
              >
                Đăng nhập
              </Link>
            )}

            <Link
              to="/my-bookings"
              className="hidden rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-ghost hover:text-fg sm:inline-flex"
            >
              Đặt chỗ của tôi
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
    </>
  )
}
