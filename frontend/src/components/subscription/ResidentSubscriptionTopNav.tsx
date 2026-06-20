import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandLink, SkipLink, ThemeToggle, UserMenu } from '../common'
import { authApi, getStoredAuthUser, type AuthUser } from '../../services/authApi'

type ResidentSubscriptionTopNavProps = {
  activeItem?: 'purchase' | 'my-subscriptions' | 'profile'
}

export function ResidentSubscriptionTopNav({ activeItem }: ResidentSubscriptionTopNavProps) {
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
      <header className="fixed left-0 right-0 top-4 z-50 px-4 md:px-12 lg:px-16">
        <div className="liquid-glass nav-glass mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-full px-4 md:px-6">
          <BrandLink className="flex shrink-0 items-center gap-2 text-sm font-medium text-fg hover:text-fg" />
          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <Link
              to="/my-subscriptions"
              className={[
                'hidden rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:inline-flex',
                activeItem === 'my-subscriptions'
                  ? 'bg-btn-primary text-btn-primary-fg'
                  : 'text-muted hover:bg-ghost hover:text-fg',
              ].join(' ')}
            >
              Gói của tôi
            </Link>

            {authUser && (
              <UserMenu
                user={authUser}
                logoutStatus={logoutStatus}
                onLogout={handleLogout}
                activeItem={activeItem === 'profile' ? 'profile' : undefined}
              />
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  )
}
