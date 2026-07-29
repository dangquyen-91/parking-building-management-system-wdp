import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrandLink, SkipLink, ThemeToggle, UserMenu } from '../../common'
import { authApi, getStoredAuthUser, type AuthUser } from '../../../services/authApi'

export function BookingTopNav() {
  const navigate = useNavigate()
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
      setLogoutStatus('idle')
      navigate('/login', { replace: true })
    }
  }

  return (
    <>
      <SkipLink />
      <header className="fixed left-0 right-0 top-4 z-50 px-4 md:px-12 lg:px-16">
        <div className="liquid-glass nav-glass mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-full px-4 md:px-6">
          <BrandLink className="flex shrink-0 items-center gap-2 text-sm font-medium text-fg hover:text-fg" />
          <nav className="flex min-w-0 shrink-0 items-center gap-2" aria-label="User navigation">
            {authUser ? (
              <UserMenu
                user={authUser}
                logoutStatus={logoutStatus}
                onLogout={handleLogout}
              />
            ) : (
              <Link
                to="/login"
                className="hidden rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-ghost hover:text-fg sm:inline-flex"
              >
                Đăng nhập
              </Link>
            )}

            <ThemeToggle />
          </nav>
        </div>
      </header>
    </>
  )
}
